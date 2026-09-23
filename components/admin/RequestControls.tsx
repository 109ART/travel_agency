import Link from "next/link";
import { Badge, Btn, inputCls, tone } from "@/components/admin/ui";
import { setQuote, setCost, setRequestStatus, setPaymentStatus } from "@/lib/actions";

export type Kind = "umrah" | "visa" | "flight";

export const QUOTE_TABS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Awaiting quotation" },
  { key: "QUOTATION_SENT", label: "Quotation sent" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "CANCELLED", label: "Cancelled" },
];

export const FLIGHT_TABS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "CANCELLED", label: "Cancelled" },
];

export const pickStatus = (tabs: { key: string }[], v?: string) =>
  tabs.some((t) => t.key === v && t.key !== "ALL") ? v : undefined;

export const label = (s: string) => s.replaceAll("_", " ").toLowerCase();

const PAY_LABEL: Record<string, string> = { PENDING: "Pending", HALF: "Half paid", PAID: "Fully paid" };

export function StatusTabs({ base, current, tabs }: { base: string; current?: string; tabs: { key: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.key === "ALL" ? base : `${base}?status=${t.key}`}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            (current ?? "ALL") === t.key ? "bg-navy-900 text-white" : "bg-white text-navy-900 ring-1 ring-navy-900/10 hover:bg-slate-50"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

export function QuoteForm({ kind, id, price, button }: { kind: Kind; id: string; price: number | null; button: string }) {
  return (
    <form action={setQuote} className="flex items-center gap-2">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <input
        name="price"
        type="number"
        min={1}
        required
        defaultValue={price ?? undefined}
        placeholder="PKR"
        aria-label="Price in PKR"
        className={`${inputCls} !w-28 !py-1`}
      />
      <Btn tone="navy" className="!px-2.5 !py-1 text-xs">
        {button}
      </Btn>
    </form>
  );
}

// Supplier name + cost price (what SafarPro pays the supplier), used by the sales/profit report
export function CostForm({
  kind,
  id,
  costPrice,
  supplierName,
}: {
  kind: Kind;
  id: string;
  costPrice: number | null;
  supplierName: string | null;
}) {
  return (
    <form action={setCost} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <input
        name="supplierName"
        required
        defaultValue={supplierName ?? undefined}
        placeholder="Supplier"
        aria-label="Supplier name"
        className={`${inputCls} !w-28 !py-1`}
      />
      <input
        name="costPrice"
        type="number"
        min={1}
        required
        defaultValue={costPrice ?? undefined}
        placeholder="Cost PKR"
        aria-label="Cost price in PKR"
        className={`${inputCls} !w-24 !py-1`}
      />
      <Btn tone="ghost" className="!px-2.5 !py-1 text-xs">
        Save cost
      </Btn>
    </form>
  );
}

export function StatusControls({ kind, id, status, canConfirm }: { kind: Kind; id: string; status: string; canConfirm: boolean }) {
  return (
    <>
      <Badge t={tone[status]}>{label(status)}</Badge>
      <div className="mt-2 flex gap-2">
        <form action={setRequestStatus}>
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="CONFIRMED" />
          <Btn
            disabled={!canConfirm || status === "CONFIRMED"}
            title={!canConfirm ? "Save a price first" : undefined}
            className="!px-2.5 !py-1 text-xs"
          >
            Confirm
          </Btn>
        </form>
        <form action={setRequestStatus}>
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="CANCELLED" />
          <Btn tone="danger" disabled={status === "CANCELLED"} className="!px-2.5 !py-1 text-xs">
            Cancel
          </Btn>
        </form>
      </div>
    </>
  );
}

export function PaymentControl({ kind, id, status, payment }: { kind: Kind; id: string; status: string; payment: string }) {
  if (status !== "CONFIRMED") return <span className="text-xs text-slate-400">Available after confirmation</span>;
  return (
    <>
      <Badge t={tone[payment]}>{PAY_LABEL[payment]}</Badge>
      <form action={setPaymentStatus} className="mt-2 flex gap-2">
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={id} />
        <select name="paymentStatus" defaultValue={payment} className="rounded-lg border border-slate-300 px-2 py-1 text-xs">
          <option value="PENDING">Pending</option>
          <option value="HALF">Half paid</option>
          <option value="PAID">Fully paid</option>
        </select>
        <Btn tone="ghost" className="!px-2.5 !py-1 text-xs">
          Save
        </Btn>
      </form>
    </>
  );
}
