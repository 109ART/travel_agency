import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { waLink } from "@/lib/whatsapp";
import { DataTable, EmptyRow, PageTitle, pkr } from "@/components/admin/ui";
import { FLIGHT_TABS, PaymentControl, QuoteForm, StatusControls, StatusTabs, pickStatus } from "@/components/admin/RequestControls";

export const dynamic = "force-dynamic";

type S = "PENDING" | "CONFIRMED" | "CANCELLED";
const day = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function FlightBookingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin("requests");
  const { status } = await searchParams;
  const filter = pickStatus(FLIGHT_TABS, status) as S | undefined;

  const rows = await prisma.flightBooking.findMany({
    where: { status: filter },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true },
  });

  return (
    <>
      <PageTitle title="Flight bookings" sub="Set the fare, confirm the booking, and track payment." />
      <StatusTabs base="/admin/flights" current={filter} tabs={FLIGHT_TABS} />

      <DataTable head={["Booking", "Customer", "Trip", "Documents", "Fare", "Status", "Payment"]} min={1100}>
        {rows.length === 0 && <EmptyRow cols={7} text="No flight bookings here yet." />}
        {rows.map((r) => (
          <tr key={r.id} className="align-top transition hover:bg-slate-50">
            <td className="px-4 py-3">
              <p className="font-semibold text-navy-900">{r.reference}</p>
              <p className="text-xs text-slate-400">{r.createdAt.toLocaleDateString("en-GB")}</p>
              <p className="text-slate-600">
                {r.passengers} passenger(s), {r.cabinClass}
              </p>
            </td>
            <td className="px-4 py-3">
              <p>{r.user.name}</p>
              <p className="text-slate-500">{r.user.phone}</p>
              <a
                href={waLink(r.user.phone, `Assalam o Alaikum ${r.user.name}, this is SafarPro about your flight booking ${r.reference}.`)}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-gold-600 hover:underline"
              >
                Message on WhatsApp
              </a>
            </td>
            <td className="px-4 py-3 text-slate-700">
              <p className="font-medium">
                {r.fromCity} to {r.toCity}
              </p>
              <p>
                {r.tripType}, departs {day(r.departureDate)}
              </p>
              {r.returnDate && <p>Returns {day(r.returnDate)}</p>}
              {r.notes && <p className="max-w-xs text-slate-500">{r.notes}</p>}
            </td>
            <td className="px-4 py-3">
              <p>{r.cnic}</p>
              <p className="text-slate-500">{r.passportNo}</p>
            </td>
            <td className="space-y-2 px-4 py-3">
              {r.fare != null && <p className="font-semibold text-navy-900">{pkr(r.fare)}</p>}
              <QuoteForm kind="flight" id={r.id} price={r.fare} button="Save fare" />
            </td>
            <td className="px-4 py-3">
              <StatusControls kind="flight" id={r.id} status={r.status} canConfirm />
            </td>
            <td className="px-4 py-3">
              <PaymentControl kind="flight" id={r.id} status={r.status} payment={r.paymentStatus} />
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
