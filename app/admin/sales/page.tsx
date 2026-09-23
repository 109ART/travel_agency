import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card, DataTable, EmptyRow, PageTitle, pkr } from "@/components/admin/ui";
import ExportCsvButton, { type SalesRow } from "@/components/admin/ExportCsvButton";

export const dynamic = "force-dynamic";

const day = (d: Date) => d.toLocaleDateString("en-GB");

export default async function SalesPage() {
  await requireAdmin("sales");

  const [umrah, visa, flights] = await Promise.all([
    prisma.umrahRequest.findMany({ where: { status: "CONFIRMED" }, include: { user: true }, orderBy: { updatedAt: "desc" } }),
    prisma.visaRequest.findMany({ where: { status: "CONFIRMED" }, include: { user: true }, orderBy: { updatedAt: "desc" } }),
    prisma.flightBooking.findMany({ where: { status: "CONFIRMED" }, include: { user: true }, orderBy: { updatedAt: "desc" } }),
  ]);

  const rows: SalesRow[] = [
    ...umrah.map((r) => ({
      customer: r.user.name,
      service: `Umrah — ${r.reference}`,
      saleDate: day(r.updatedAt),
      supplier: r.supplierName ?? "-",
      costPrice: r.costPrice ?? 0,
      sellingPrice: r.quotedPrice ?? 0,
      profit: (r.quotedPrice ?? 0) - (r.costPrice ?? 0),
    })),
    ...visa.map((r) => ({
      customer: r.user.name,
      service: `Visa (${r.country} ${r.visaType}) — ${r.reference}`,
      saleDate: day(r.updatedAt),
      supplier: r.supplierName ?? "-",
      costPrice: r.costPrice ?? 0,
      sellingPrice: r.quotedPrice ?? 0,
      profit: (r.quotedPrice ?? 0) - (r.costPrice ?? 0),
    })),
    ...flights.map((r) => ({
      customer: r.user.name,
      service: `Flight (${r.fromCity} to ${r.toCity}) — ${r.reference}`,
      saleDate: day(r.updatedAt),
      supplier: r.supplierName ?? "-",
      costPrice: r.costPrice ?? 0,
      sellingPrice: r.fare ?? 0,
      profit: (r.fare ?? 0) - (r.costPrice ?? 0),
    })),
  ];

  const totalSales = rows.reduce((s, r) => s + r.sellingPrice, 0);
  const totalCost = rows.reduce((s, r) => s + r.costPrice, 0);
  const totalProfit = rows.reduce((s, r) => s + r.profit, 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageTitle title="Sales & profits" sub="Confirmed bookings across Umrah, visa and flights, with supplier cost and margin." />
        <ExportCsvButton rows={rows} filename={`safarpro-sales-${new Date().toISOString().slice(0, 10)}.csv`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-600">Total sales</p>
          <p className="text-2xl font-bold text-navy-900">{pkr(totalSales)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-600">Total supplier cost</p>
          <p className="text-2xl font-bold text-navy-900">{pkr(totalCost)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-600">Total profit</p>
          <p className="text-2xl font-bold text-emerald-700">{pkr(totalProfit)}</p>
        </Card>
      </div>

      <DataTable head={["Customer", "Service", "Sale date", "Supplier", "Cost price", "Selling price", "Profit"]} min={1000}>
        {rows.length === 0 && (
          <EmptyRow cols={7} text="No confirmed sales yet. Once a request is confirmed and has a supplier cost saved, it appears here." />
        )}
        {rows.map((r, i) => (
          <tr key={i} className="transition hover:bg-slate-50">
            <td className="px-4 py-3 font-medium text-navy-900">{r.customer}</td>
            <td className="px-4 py-3">{r.service}</td>
            <td className="px-4 py-3">{r.saleDate}</td>
            <td className="px-4 py-3">{r.supplier}</td>
            <td className="px-4 py-3">{pkr(r.costPrice)}</td>
            <td className="px-4 py-3">{pkr(r.sellingPrice)}</td>
            <td className={`px-4 py-3 font-semibold ${r.profit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{pkr(r.profit)}</td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
