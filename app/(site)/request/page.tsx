import Link from "next/link";
import { Btn, Card, Field, inputCls } from "@/components/admin/ui";
import { submitUmrah, submitVisa, submitFlight } from "@/lib/public-actions";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "umrah", label: "Umrah" },
  { key: "visa", label: "Visa" },
  { key: "flight", label: "Flights" },
];

const grid = "grid gap-3 sm:grid-cols-2";

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium text-navy-900">{label}</span>
      <select name={name} required className={inputCls}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function CustomerFields() {
  return (
    <>
      <Field label="Full name" name="name" />
      <Field label="Phone (WhatsApp)" name="phone" />
      <Field label="Email (optional)" name="email" type="email" required={false} />
      <Field label="CNIC" name="cnic" placeholder="35202-1234567-1" />
      <Field label="Passport number" name="passportNo" />
    </>
  );
}

const Notes = () => (
  <label className="text-sm sm:col-span-2">
    <span className="mb-1 block font-medium text-navy-900">Anything else we should know (optional)</span>
    <textarea name="notes" rows={3} className={inputCls} />
  </label>
);

export default async function RequestPage({ searchParams }: { searchParams: Promise<{ type?: string; sent?: string; error?: string }> }) {
  const { type: t, sent, error } = await searchParams;
  const type = t === "visa" || t === "flight" ? t : "umrah";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy-900">Send us your request</h1>
      <p className="mt-1 text-slate-600">
        {type === "flight" ? "We will confirm your flight booking and fare." : "We will review your request and send you a quotation."}
      </p>

      <div className="mt-6 flex gap-2">
        {TABS.map((x) => (
          <Link
            key={x.key}
            href={`/request?type=${x.key}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              type === x.key ? "bg-navy-900 text-white" : "bg-white text-navy-900 ring-1 ring-navy-900/10 hover:bg-slate-50"
            }`}
          >
            {x.label}
          </Link>
        ))}
      </div>

      {sent && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Thank you. Your request <strong>{sent}</strong> has been received. Please keep this reference number.
        </p>
      )}
      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">Please fill in all required fields.</p>}

      <Card className="mt-6 p-6">
        {type === "umrah" && (
          <form action={submitUmrah} className={grid}>
            <CustomerFields />
            <Field label="Number of travelers" name="travelers" type="number" />
            <Field label="Preferred travel date" name="preferredDate" type="date" required={false} />
            <Field label="Nights in Makkah" name="nightsMakkah" type="number" />
            <Field label="Nights in Madinah" name="nightsMadinah" type="number" />
            <Select label="Hotel category" name="hotelCategory" options={["3 star", "4 star", "5 star"]} />
            <label className="flex items-center gap-2 self-end text-sm">
              <input type="checkbox" name="needsVisa" defaultChecked /> I need a visa
            </label>
            <Notes />
            <div className="sm:col-span-2">
              <Btn>Request quotation</Btn>
            </div>
          </form>
        )}

        {type === "visa" && (
          <form action={submitVisa} className={grid}>
            <CustomerFields />
            <Field label="Country" name="country" />
            <Select label="Visa type" name="visaType" options={["Tourist", "Umrah", "Business", "Visit"]} />
            <Select label="Entry type" name="entryType" options={["Single", "Multiple"]} />
            <Field label="Number of travelers" name="travelers" type="number" />
            <Field label="Planned travel date" name="travelDate" type="date" required={false} />
            <Field label="Passport expiry" name="passportExpiry" type="date" required={false} />
            <Notes />
            <div className="sm:col-span-2">
              <Btn>Request quotation</Btn>
            </div>
          </form>
        )}

        {type === "flight" && (
          <form action={submitFlight} className={grid}>
            <CustomerFields />
            <Select label="Trip type" name="tripType" options={["One way", "Return"]} />
            <Field label="From city" name="fromCity" />
            <Field label="To city" name="toCity" />
            <Field label="Departure date" name="departureDate" type="date" />
            <Field label="Return date (if return)" name="returnDate" type="date" required={false} />
            <Field label="Passengers" name="passengers" type="number" />
            <Select label="Cabin class" name="cabinClass" options={["Economy", "Business"]} />
            <Notes />
            <div className="sm:col-span-2">
              <Btn>Request booking</Btn>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
