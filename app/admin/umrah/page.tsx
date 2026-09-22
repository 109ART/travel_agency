import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { waLink } from "@/lib/whatsapp";
import { DataTable, EmptyRow, PageTitle, pkr } from "@/components/admin/ui";
import { PaymentControl, QUOTE_TABS, QuoteForm, StatusControls, StatusTabs, pickStatus } from "@/components/admin/RequestControls";

export const dynamic = "force-dynamic";

type S = "PENDING" | "QUOTATION_SENT" | "CONFIRMED" | "CANCELLED";

export default async function UmrahRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin("requests");
  const { status } = await searchParams;
  const filter = pickStatus(QUOTE_TABS, status) as S | undefined;

  const rows = await prisma.umrahRequest.findMany({
    where: { status: filter },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true },
  });

  return (
    <>
      <PageTitle title="Umrah requests" sub="Review each inquiry, save a quotation, then confirm once the customer agrees." />
      <StatusTabs base="/admin/umrah" current={filter} tabs={QUOTE_TABS} />

      <DataTable head={["Request", "Customer", "Trip details", "Documents", "Quotation", "Status", "Payment"]} min={1100}>
        {rows.length === 0 && <EmptyRow cols={7} text="No Umrah requests here yet." />}
        {rows.map((r) => (
          <tr key={r.id} className="align-top transition hover:bg-slate-50">
            <td className="px-4 py-3">
              <p className="font-semibold text-navy-900">{r.reference}</p>
              <p className="text-xs text-slate-400">{r.createdAt.toLocaleDateString("en-GB")}</p>
              <p className="text-slate-600">{r.travelers} traveler(s)</p>
              {r.preferredDate && <p className="text-slate-500">Prefers {r.preferredDate.toLocaleDateString("en-GB")}</p>}
            </td>
            <td className="px-4 py-3">
              <p>{r.user.name}</p>
              <p className="text-slate-500">{r.user.phone}</p>
              <a
                href={waLink(r.user.phone, `Assalam o Alaikum ${r.user.name}, this is SafarPro about your Umrah request ${r.reference}.`)}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-gold-600 hover:underline"
              >
                Message on WhatsApp
              </a>
            </td>
            <td className="px-4 py-3 text-slate-700">
              <p>
                Makkah {r.nightsMakkah} nights, Madinah {r.nightsMadinah} nights
              </p>
              <p>
                {r.hotelCategory} hotels, visa {r.needsVisa ? "needed" : "not needed"}
              </p>
              {r.notes && <p className="max-w-xs text-slate-500">{r.notes}</p>}
            </td>
            <td className="px-4 py-3">
              <p>{r.cnic}</p>
              <p className="text-slate-500">{r.passportNo}</p>
            </td>
            <td className="space-y-2 px-4 py-3">
              {r.quotedPrice != null && <p className="font-semibold text-navy-900">{pkr(r.quotedPrice)}</p>}
              <QuoteForm kind="umrah" id={r.id} price={r.quotedPrice} button="Save quotation" />
              {r.quotedPrice != null && (
                <a
                  href={waLink(
                    r.user.phone,
                    `Assalam o Alaikum ${r.user.name}, your Umrah quotation (${r.reference}) from SafarPro is ${pkr(r.quotedPrice)} for ${r.travelers} traveler(s). Please reply to confirm.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-xs font-medium text-gold-600 hover:underline"
                >
                  Share quotation on WhatsApp
                </a>
              )}
            </td>
            <td className="px-4 py-3">
              <StatusControls kind="umrah" id={r.id} status={r.status} canConfirm={r.quotedPrice != null} />
            </td>
            <td className="px-4 py-3">
              <PaymentControl kind="umrah" id={r.id} status={r.status} payment={r.paymentStatus} />
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
