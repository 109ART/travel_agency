import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { can, type Perm } from "@/lib/permissions";

const COOKIE = "admin_session";
const WEEK = 7 * 24 * 60 * 60;

const sign = (value: string) =>
  createHmac("sha256", process.env.SESSION_SECRET ?? "").update(value).digest("base64url");

export async function createSession(adminId: string) {
  const payload = `${adminId}.${Date.now() + WEEK * 1000}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WEEK,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getAdmin() {
  if (!process.env.SESSION_SECRET) return null;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [id, exp, sig] = raw.split(".");
  if (!id || !exp || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(`${id}.${exp}`));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(exp) < Date.now()) return null;
  const admin = await prisma.admin.findUnique({ where: { id } });
  return admin && admin.isActive ? admin : null;
}

export async function requireAdmin(perm?: Perm) {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  if (perm && !can(admin.role, perm)) redirect("/admin?denied=1");
  return admin;
}
