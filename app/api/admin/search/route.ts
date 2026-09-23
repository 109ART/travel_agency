import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/session";

export async function GET(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ results: [] }, { status: 401 });

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const where = {
    OR: [
      { reference: { contains: q, mode: "insensitive" as const } },
      { user: { name: { contains: q, mode: "insensitive" as const } } },
      { user: { phone: { contains: q, mode: "insensitive" as const } } },
    ],
  };

  const [umrah, visa, flights] = await Promise.all([
    prisma.umrahRequest.findMany({ where, take: 5, include: { user: true }, orderBy: { createdAt: "desc" } }),
    prisma.visaRequest.findMany({ where, take: 5, include: { user: true }, orderBy: { createdAt: "desc" } }),
    prisma.flightBooking.findMany({ where, take: 5, include: { user: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const results = [
    ...umrah.map((r) => ({
      id: r.id,
      type: "Umrah" as const,
      href: "/admin/umrah",
      reference: r.reference,
      name: r.user.name,
      phone: r.user.phone,
      status: r.status,
    })),
    ...visa.map((r) => ({
      id: r.id,
      type: "Visa" as const,
      href: "/admin/visa",
      reference: r.reference,
      name: r.user.name,
      phone: r.user.phone,
      status: r.status,
    })),
    ...flights.map((r) => ({
      id: r.id,
      type: "Flight" as const,
      href: "/admin/flights",
      reference: r.reference,
      name: r.user.name,
      phone: r.user.phone,
      status: r.status,
    })),
  ];

  return NextResponse.json({ results });
}
