"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, requireAdmin } from "@/lib/session";

type QuoteStatus = "PENDING" | "QUOTATION_SENT" | "CONFIRMED" | "CANCELLED";
type FlightStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
type PaymentStatus = "PENDING" | "HALF" | "PAID";
type AdminRole = "SUPER_ADMIN" | "ADMIN" | "STAFF";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => Number(fd.get(k) ?? 0) || 0;
const done = () => revalidatePath("/", "layout");

async function log(adminName: string, action: string, target?: string) {
  await prisma.auditLog.create({ data: { adminName, action, target: target ?? null } });
}

// ---------- Login ----------
export async function login(fd: FormData) {
  if (!process.env.SESSION_SECRET) redirect("/login?error=config");
  const admin = await prisma.admin.findUnique({ where: { email: str(fd, "email").toLowerCase() } });
  if (!admin || !admin.isActive || !(await bcrypt.compare(str(fd, "password"), admin.passwordHash))) {
    redirect("/login?error=1");
  }
  await createSession(admin.id);
  await log(admin.name, "Logged in");
  redirect("/admin");
}

export async function setupFirstAdmin(fd: FormData) {
  if (!process.env.SESSION_SECRET) redirect("/login?error=config");
  if ((await prisma.admin.count()) > 0) redirect("/login");
  const password = str(fd, "password");
  if (password.length < 8) redirect("/login?error=short");
  const admin = await prisma.admin.create({
    data: {
      name: str(fd, "name"),
      email: str(fd, "email").toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      role: "SUPER_ADMIN",
    },
  });
  await createSession(admin.id);
  await log(admin.name, "Created the first super admin");
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

// ---------- Quotation / fare ----------
export async function setQuote(fd: FormData) {
  const me = await requireAdmin("requests");
  const kind = str(fd, "kind");
  const id = str(fd, "id");
  const price = num(fd, "price");
  if (price <= 0) return;

  if (kind === "umrah") {
    const cur = await prisma.umrahRequest.findUnique({ where: { id }, select: { status: true, reference: true } });
    if (!cur) return;
    await prisma.umrahRequest.update({
      where: { id },
      data: {
        quotedPrice: price,
        quotedAt: new Date(),
        status: cur.status === "CONFIRMED" ? undefined : "QUOTATION_SENT",
      },
    });
    await log(me.name, `Saved Umrah quotation PKR ${price}`, cur.reference);
  } else if (kind === "visa") {
    const cur = await prisma.visaRequest.findUnique({ where: { id }, select: { status: true, reference: true } });
    if (!cur) return;
    await prisma.visaRequest.update({
      where: { id },
      data: {
        quotedPrice: price,
        quotedAt: new Date(),
        status: cur.status === "CONFIRMED" ? undefined : "QUOTATION_SENT",
      },
    });
    await log(me.name, `Saved visa quotation PKR ${price}`, cur.reference);
  } else if (kind === "flight") {
    const r = await prisma.flightBooking.update({ where: { id }, data: { fare: price }, select: { reference: true } });
    await log(me.name, `Set flight fare PKR ${price}`, r.reference);
  }
  done();
}

// ---------- Cost price / supplier (for the sales & profit report) ----------
export async function setCost(fd: FormData) {
  const me = await requireAdmin("requests");
  const kind = str(fd, "kind");
  const id = str(fd, "id");
  const costPrice = num(fd, "costPrice");
  const supplierName = str(fd, "supplierName");
  if (costPrice <= 0 || !supplierName) return;

  if (kind === "umrah") {
    const r = await prisma.umrahRequest.update({ where: { id }, data: { costPrice, supplierName }, select: { reference: true } });
    await log(me.name, `Recorded supplier cost PKR ${costPrice} (${supplierName})`, r.reference);
  } else if (kind === "visa") {
    const r = await prisma.visaRequest.update({ where: { id }, data: { costPrice, supplierName }, select: { reference: true } });
    await log(me.name, `Recorded supplier cost PKR ${costPrice} (${supplierName})`, r.reference);
  } else if (kind === "flight") {
    const r = await prisma.flightBooking.update({ where: { id }, data: { costPrice, supplierName }, select: { reference: true } });
    await log(me.name, `Recorded supplier cost PKR ${costPrice} (${supplierName})`, r.reference);
  }
  done();
}

// ---------- Confirm / cancel ----------
export async function setRequestStatus(fd: FormData) {
  const me = await requireAdmin("requests");
  const kind = str(fd, "kind");
  const id = str(fd, "id");
  const status = str(fd, "status");
  if (status !== "CONFIRMED" && status !== "CANCELLED") return;

  if (kind === "umrah") {
    const r = await prisma.umrahRequest.findUnique({ where: { id }, select: { reference: true, quotedPrice: true } });
    if (!r || (status === "CONFIRMED" && r.quotedPrice == null)) return;
    await prisma.umrahRequest.update({ where: { id }, data: { status: status as QuoteStatus } });
    await log(me.name, `Umrah request ${status.toLowerCase()}`, r.reference);
  } else if (kind === "visa") {
    const r = await prisma.visaRequest.findUnique({ where: { id }, select: { reference: true, quotedPrice: true } });
    if (!r || (status === "CONFIRMED" && r.quotedPrice == null)) return;
    await prisma.visaRequest.update({ where: { id }, data: { status: status as QuoteStatus } });
    await log(me.name, `Visa request ${status.toLowerCase()}`, r.reference);
  } else if (kind === "flight") {
    const r = await prisma.flightBooking.update({
      where: { id },
      data: { status: status as FlightStatus },
      select: { reference: true },
    });
    await log(me.name, `Flight booking ${status.toLowerCase()}`, r.reference);
  }
  done();
}

// ---------- Payment (only once confirmed) ----------
export async function setPaymentStatus(fd: FormData) {
  const me = await requireAdmin("requests");
  const kind = str(fd, "kind");
  const id = str(fd, "id");
  const paymentStatus = str(fd, "paymentStatus") as PaymentStatus;
  if (!["PENDING", "HALF", "PAID"].includes(paymentStatus)) return;

  if (kind === "umrah") {
    const r = await prisma.umrahRequest.findUnique({ where: { id }, select: { reference: true, status: true } });
    if (!r || r.status !== "CONFIRMED") return;
    await prisma.umrahRequest.update({ where: { id }, data: { paymentStatus } });
    await log(me.name, `Payment set to ${paymentStatus.toLowerCase()}`, r.reference);
  } else if (kind === "visa") {
    const r = await prisma.visaRequest.findUnique({ where: { id }, select: { reference: true, status: true } });
    if (!r || r.status !== "CONFIRMED") return;
    await prisma.visaRequest.update({ where: { id }, data: { paymentStatus } });
    await log(me.name, `Payment set to ${paymentStatus.toLowerCase()}`, r.reference);
  } else if (kind === "flight") {
    const r = await prisma.flightBooking.findUnique({ where: { id }, select: { reference: true, status: true } });
    if (!r || r.status !== "CONFIRMED") return;
    await prisma.flightBooking.update({ where: { id }, data: { paymentStatus } });
    await log(me.name, `Payment set to ${paymentStatus.toLowerCase()}`, r.reference);
  }
  done();
}

// ---------- Users ----------
export async function createUser(fd: FormData) {
  const me = await requireAdmin("users");
  const email = str(fd, "email").toLowerCase();
  try {
    await prisma.user.create({
      data: {
        name: str(fd, "name"),
        phone: str(fd, "phone"),
        email: email || null,
        cnic: str(fd, "cnic") || null,
        passportNo: str(fd, "passportNo") || null,
      },
    });
    await log(me.name, "Added a user", str(fd, "name"));
  } catch {
    // duplicate email
  }
  done();
}

export async function deleteUser(fd: FormData) {
  const me = await requireAdmin("users");
  const u = await prisma.user.findUnique({
    where: { id: str(fd, "id") },
    include: { _count: { select: { umrahRequests: true, visaRequests: true, flightBookings: true } } },
  });
  if (!u) return;
  const c = u._count;
  if (c.umrahRequests + c.visaRequests + c.flightBookings > 0) return;
  await prisma.user.delete({ where: { id: u.id } });
  await log(me.name, "Deleted a user", u.name);
  done();
}

// ---------- Admins ----------
export async function createAdmin(fd: FormData) {
  const me = await requireAdmin("admins");
  const password = str(fd, "password");
  if (password.length < 8) return;
  const role = str(fd, "role") as AdminRole;
  try {
    await prisma.admin.create({
      data: {
        name: str(fd, "name"),
        email: str(fd, "email").toLowerCase(),
        passwordHash: await bcrypt.hash(password, 10),
        role: ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(role) ? role : "STAFF",
      },
    });
    await log(me.name, `Created a ${role.toLowerCase().replace("_", " ")}`, str(fd, "email"));
  } catch {
    // email already exists
  }
  done();
}

export async function setAdminRole(fd: FormData) {
  const me = await requireAdmin("admins");
  const id = str(fd, "id");
  const role = str(fd, "role") as AdminRole;
  if (id === me.id || !["SUPER_ADMIN", "ADMIN", "STAFF"].includes(role)) return;
  const a = await prisma.admin.update({ where: { id }, data: { role } });
  await log(me.name, `Changed role to ${role.toLowerCase().replace("_", " ")}`, a.email);
  done();
}

export async function toggleAdmin(fd: FormData) {
  const me = await requireAdmin("admins");
  const id = str(fd, "id");
  if (id === me.id) return;
  const isActive = str(fd, "isActive") !== "true";
  const a = await prisma.admin.update({ where: { id }, data: { isActive } });
  await log(me.name, isActive ? "Enabled an admin" : "Disabled an admin", a.email);
  done();
}

// ---------- Blog ----------
export async function createPost(fd: FormData) {
  const me = await requireAdmin("content");
  const title = str(fd, "title");
  const slug =
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36).slice(-4);
  await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt: str(fd, "excerpt"),
      content: str(fd, "content"),
      isPublished: fd.get("isPublished") === "on",
    },
  });
  await log(me.name, "Wrote a blog post", title);
  done();
}

export async function togglePost(fd: FormData) {
  const me = await requireAdmin("content");
  const isPublished = str(fd, "isPublished") !== "true";
  const p = await prisma.blogPost.update({ where: { id: str(fd, "id") }, data: { isPublished } });
  await log(me.name, isPublished ? "Published a post" : "Unpublished a post", p.title);
  done();
}

export async function deletePost(fd: FormData) {
  const me = await requireAdmin("content");
  const p = await prisma.blogPost.delete({ where: { id: str(fd, "id") } });
  await log(me.name, "Deleted a post", p.title);
  done();
}
