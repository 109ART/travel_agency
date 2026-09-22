import Link from "next/link";
import { Users, Landmark, Stamp, Plane, Clock, Send, Wallet, PenLine, ShieldCheck, Check, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { can, PERM_LABEL, type Perm } from "@/lib/permissions";
import { Badge, Card, PageTitle, pkr, tone } from "@/components/admin/ui";
import { label } from "@/components/admin/RequestControls";

export const dynamic = "force-dynamic";

function Stat({ title, value, note, Icon, href }: { title: string; value: string | number; note: string; Icon: LucideIcon; href?: string }) {
  const body = (
    <Card className="flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-xl">
      <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-navy-900/5 text-navy-800">
        <Icon size={22} />
      </span>
      <span>
        <span className="block text-sm text-slate-600">{title}</span>
        <span className="block text-3xl font-bold text-navy-900">{value}</span>
        <span className="block text-xs text-slate-500">{note}</span>
      </span>
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const me = await requireAdmin();
  const { denied } = await searchParams;

  const [users, uTotal, uPending, uQuoted, vTotal, vPending, vQuoted, fTotal, fPending, uSum, vSum, fSum, uRecent, vRecent, fRecent] =
    await Promise.all([
      prisma.user.count(),
      prisma.umrahRequest.count(),
      prisma.umrahRequest.count({ where: { status: "PENDING" } }),
      prisma.umrahRequest.count({ where: { status: "QUOTATION_SENT" } }),
      prisma.visaRequest.count(),
      prisma.visaRequest.count({ where: { status: "PENDING" } }),
      prisma.visaRequest.count({ where: { status: "QUOTATION_SENT" } }),
      prisma.flightBooking.count(),
      prisma.flightBooking.count({ where: { status: "PENDING" } }),
      prisma.umrahRequest.aggregate({ where: { status: "CONFIRMED" }, _sum: { quotedPrice: true } }),
      prisma.visaRequest.aggregate({ where: { status: "CONFIRMED" }, _sum: { quotedPrice: true } }),
      prisma.flightBooking.aggregate({ where: { status: "CONFIRMED" }, _sum: { fare: true } }),
      prisma.umrahRequest.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: true } }),
      prisma.visaRequest.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: true } }),
      prisma.flightBooking.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: true } }),
    ]);

  const recent = [
    ...uRecent.map((r) => ({ id: r.id, type: "Umrah", href: "/admin/umrah", ref: r.reference, name: r.user.name, status: r.status, at: r.createdAt })),
    ...vRecent.map((r) => ({ id: r.id, type: "Visa", href: "/admin/visa", ref: r.reference, name: r.user.name, status: r.status, at: r.createdAt })),
    ...fRecent.map((r) => ({ id: r.id, type: "Flight", href: "/admin/flights", ref: r.reference, name: r.user.name, status: r.status, at: r.createdAt })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 6);

  const link = (perm: Perm, href: string) => (can(me.role, perm) ? href : undefined);
  const confirmedValue = (uSum._sum.quotedPrice ?? 0) + (vSum._sum.quotedPrice ?? 0) + (fSum._sum.fare ?? 0);

  const actions: { perm: Perm; href: string; title: string; note: string; Icon: LucideIcon }[] = [
    { perm: "requests", href: "/admin/umrah", title: "Umrah requests", note: `${uPending} need a quotation`, Icon: Landmark },
    { perm: "requests", href: "/admin/visa", title: "Visa requests", note: `${vPending} need a quotation`, Icon: Stamp },
    { perm: "requests", href: "/admin/flights", title: "Flight bookings", note: `${fPending} pending`, Icon: Plane },
    { perm: "content", href: "/admin/blog", title: "New blog post", note: "Add an article or guide", Icon: PenLine },
    { perm: "users", href: "/admin/users", title: "Manage users", note: "Client list", Icon: Users },
    { perm: "admins", href: "/admin/admins", title: "Admins and rights", note: "Create admins, set roles", Icon: ShieldCheck },
  ];
  const myActions = actions.filter((a) => can(me.role, a.perm));

  return (
    <>
      {denied && (
        <div className="rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-900">
          Your role does not have access to that page. Ask a super admin to change your role.
        </div>
      )}

      <PageTitle title="Admin control center" sub={`Welcome back, ${me.name}. Here is what is happening with your agency.`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Registered users" value={users} note="Customers in the database" Icon={Users} href={link("users", "/admin/users")} />
        <Stat title="Umrah requests" value={uTotal} note={`${uPending} awaiting quotation`} Icon={Landmark} href={link("requests", "/admin/umrah")} />
        <Stat title="Visa requests" value={vTotal} note={`${vPending} awaiting quotation`} Icon={Stamp} href={link("requests", "/admin/visa")} />
        <Stat title="Flight bookings" value={fTotal} note={`${fPending} pending`} Icon={Plane} href={link("requests", "/admin/flights")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat title="Needs your action" value={uPending + vPending + fPending} note="Pending Umrah, visa and flights" Icon={Clock} />
        <Stat title="Quotations sent" value={uQuoted + vQuoted} note="Waiting for customer to confirm" Icon={Send} />
        <Stat title="Confirmed business" value={pkr(confirmedValue)} note="Total of confirmed requests" Icon={Wallet} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {can(me.role, "requests") && (
          <Card className="p-5 lg:col-span-3">
            <h2 className="mb-4 text-lg font-semibold text-navy-900">Recent requests</h2>
            {recent.length === 0 ? (
              <p className="py-10 text-center text-slate-500">No requests yet. They appear here once customers use the request form.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recent.map((r) => (
                  <li key={r.type + r.id}>
                    <Link href={r.href} className="flex items-center justify-between gap-3 rounded-lg px-2 py-3 text-sm transition hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-navy-900">{r.name}</p>
                        <p className="text-slate-500">
                          {r.type} - {r.ref}
                        </p>
                      </div>
                      <Badge t={tone[r.status]}>{label(r.status)}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-navy-900">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {myActions.map(({ href, title, note, Icon }, i) => (
              <Link
                key={href}
                href={href}
                className={`rounded-xl p-4 transition hover:-translate-y-0.5 hover:brightness-110 ${
                  i % 2 === 0 ? "bg-navy-900 text-white" : "bg-gold-grad text-navy-950"
                }`}
              >
                <Icon size={22} />
                <p className="mt-3 font-semibold">{title}</p>
                <p className={`text-sm ${i % 2 === 0 ? "text-white/70" : "text-navy-950/70"}`}>{note}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-navy-900">Your admin rights</h2>
        <p className="mb-4 text-sm text-slate-600">You are signed in as {me.role.replace("_", " ").toLowerCase()}.</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(PERM_LABEL) as Perm[]).map((p) => (
            <li key={p} className="flex items-center gap-2 text-sm">
              {can(me.role, p) ? <Check size={16} className="text-emerald-600" /> : <X size={16} className="text-slate-400" />}
              <span className={can(me.role, p) ? "text-slate-800" : "text-slate-400"}>{PERM_LABEL[p]}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
