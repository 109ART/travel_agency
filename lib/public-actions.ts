"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notifyAdmin } from "@/lib/email";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => Number(fd.get(k) ?? 0) || 0;
const date = (fd: FormData, k: string) => (str(fd, k) ? new Date(str(fd, k)) : null);
const ref = (p: string) =>
  `${p}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

async function customer(fd: FormData, type: string) {
  const name = str(fd, "name");
  const phone = str(fd, "phone");
  const cnic = str(fd, "cnic");
  const passportNo = str(fd, "passportNo");
  if (!name || !phone || !cnic || !passportNo) redirect(`/request?type=${type}&error=1`);

  const email = str(fd, "email").toLowerCase() || null;
  const existing = await prisma.user.findFirst({
    where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
  });
  if (existing) return existing;
  return prisma.user.create({ data: { name, phone, email, cnic, passportNo } });
}

export async function submitUmrah(fd: FormData) {
  const user = await customer(fd, "umrah");
  const reference = ref("UM");
  const travelers = Math.max(1, num(fd, "travelers"));
  await prisma.umrahRequest.create({
    data: {
      reference,
      userId: user.id,
      travelers,
      preferredDate: date(fd, "preferredDate"),
      nightsMakkah: num(fd, "nightsMakkah"),
      nightsMadinah: num(fd, "nightsMadinah"),
      hotelCategory: str(fd, "hotelCategory"),
      needsVisa: fd.get("needsVisa") === "on",
      notes: str(fd, "notes") || null,
      cnic: str(fd, "cnic"),
      passportNo: str(fd, "passportNo"),
    },
  });

  await notifyAdmin({
    subject: `New Umrah inquiry — ${reference}`,
    lines: [
      `Customer: ${user.name} (${user.phone})`,
      `Travelers: ${travelers}`,
      `Reference: ${reference}`,
      `Please open the admin panel to review and send a quotation.`,
    ],
  });

  redirect(`/request?type=umrah&sent=${reference}`);
}

export async function submitVisa(fd: FormData) {
  const user = await customer(fd, "visa");
  const reference = ref("VS");
  const country = str(fd, "country");
  const visaType = str(fd, "visaType");
  await prisma.visaRequest.create({
    data: {
      reference,
      userId: user.id,
      country,
      visaType,
      entryType: str(fd, "entryType"),
      travelers: Math.max(1, num(fd, "travelers")),
      travelDate: date(fd, "travelDate"),
      passportExpiry: date(fd, "passportExpiry"),
      notes: str(fd, "notes") || null,
      cnic: str(fd, "cnic"),
      passportNo: str(fd, "passportNo"),
    },
  });

  await notifyAdmin({
    subject: `New visa inquiry — ${reference}`,
    lines: [
      `Customer: ${user.name} (${user.phone})`,
      `${country} — ${visaType}`,
      `Reference: ${reference}`,
      `Please open the admin panel to review and send a quotation.`,
    ],
  });

  redirect(`/request?type=visa&sent=${reference}`);
}

export async function submitFlight(fd: FormData) {
  const user = await customer(fd, "flight");
  const reference = ref("FL");
  const fromCity = str(fd, "fromCity");
  const toCity = str(fd, "toCity");
  await prisma.flightBooking.create({
    data: {
      reference,
      userId: user.id,
      tripType: str(fd, "tripType"),
      fromCity,
      toCity,
      departureDate: new Date(str(fd, "departureDate")),
      returnDate: date(fd, "returnDate"),
      passengers: Math.max(1, num(fd, "passengers")),
      cabinClass: str(fd, "cabinClass"),
      notes: str(fd, "notes") || null,
      cnic: str(fd, "cnic"),
      passportNo: str(fd, "passportNo"),
    },
  });

  await notifyAdmin({
    subject: `New flight booking — ${reference}`,
    lines: [
      `Customer: ${user.name} (${user.phone})`,
      `${fromCity} to ${toCity}`,
      `Reference: ${reference}`,
      `Please open the admin panel to set the fare and confirm.`,
    ],
  });

  redirect(`/request?type=flight&sent=${reference}`);
}
