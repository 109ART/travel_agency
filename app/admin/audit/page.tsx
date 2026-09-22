import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { DataTable, EmptyRow, PageTitle } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  await requireAdmin("audit");
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <>
      <PageTitle title="Audit history" sub="Who did what in the admin panel (latest 200 actions)." />
      <DataTable head={["When", "Admin", "Action", "Item"]} min={650}>
        {logs.length === 0 && <EmptyRow cols={4} text="Nothing recorded yet. Actions will appear here." />}
        {logs.map((l) => (
          <tr key={l.id} className="transition hover:bg-slate-50">
            <td className="px-4 py-3 text-slate-600">
              {l.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
            </td>
            <td className="px-4 py-3 font-medium text-navy-900">{l.adminName}</td>
            <td className="px-4 py-3">{l.action}</td>
            <td className="px-4 py-3 text-slate-500">{l.target ?? "-"}</td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
