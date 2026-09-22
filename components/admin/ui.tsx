import type { ButtonHTMLAttributes, ReactNode } from "react";

export const pkr = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;

export const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/40";

const badgeTones = {
  gold: "bg-gold-200/60 text-gold-600",
  green: "bg-emerald-100 text-emerald-800",
  red: "bg-rose-100 text-rose-800",
  blue: "bg-sky-100 text-sky-800",
  gray: "bg-slate-200 text-slate-700",
  amber: "bg-amber-100 text-amber-800",
} as const;
export type Tone = keyof typeof badgeTones;

// Status -> badge color, shared across bookings/requests
export const tone: Record<string, Tone> = {
  PENDING: "amber",
  QUOTATION_SENT: "blue",
  CONFIRMED: "green",
  APPROVED: "green",
  REJECTED: "red",
  CANCELLED: "red",
  HALF: "blue",
  PAID: "green",
};

export function Badge({ t = "gray", children }: { t?: Tone; children: ReactNode }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeTones[t]}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white shadow-card ring-1 ring-navy-900/5 ${className}`}>{children}</div>;
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
      {sub && <p className="mt-1 text-slate-600">{sub}</p>}
    </div>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required = true,
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`text-sm ${className}`}>
      <span className="mb-1 block font-medium text-navy-900">{label}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} className={inputCls} />
    </label>
  );
}

const btnTones = {
  gold: "bg-gold-grad text-navy-950 hover:brightness-105 shadow-sm",
  navy: "bg-navy-900 text-white hover:bg-navy-800",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
  ghost: "border border-slate-300 bg-white text-navy-900 hover:bg-slate-50",
};

export function Btn({
  tone: t = "gold",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: keyof typeof btnTones }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 ${btnTones[t]} ${className}`}
    />
  );
}

export function DataTable({ head, min = 800, children }: { head: string[]; min?: number; children: ReactNode }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-left text-sm" style={{ minWidth: min }}>
        <thead className="bg-navy-900 text-white">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </Card>
  );
}

export function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-12 text-center text-slate-500">
        {text}
      </td>
    </tr>
  );
}
