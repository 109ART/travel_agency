import { Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { createAdmin, setAdminRole, toggleAdmin } from "@/lib/actions";
import { can, PERM_LABEL, type Perm, type Role } from "@/lib/permissions";
import { Badge, Btn, Card, DataTable, EmptyRow, Field, PageTitle, inputCls } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const ROLES: { key: Role; label: string }[] = [
  { key: "SUPER_ADMIN", label: "Super admin" },
  { key: "ADMIN", label: "Admin" },
  { key: "STAFF", label: "Staff" },
];

export default async function AdminsPage() {
  const me = await requireAdmin("admins");
  const admins = await prisma.admin.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <>
      <PageTitle title="Admins and rights" sub="Create admins and decide what each role can do." />

      <Card>
        <form action={createAdmin} className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Name" name="name" />
          <Field label="Email" name="email" type="email" />
          <Field label="Password (8+ characters)" name="password" type="password" />
          <label className="text-sm">
            <span className="mb-1 block font-medium text-navy-900">Role</span>
            <select name="role" defaultValue="ADMIN" className={inputCls}>
              {ROLES.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2 lg:col-span-4">
            <Btn>Create admin</Btn>
          </div>
        </form>
      </Card>

      <DataTable head={["Name", "Email", "Role", "Access"]} min={700}>
        {admins.length === 0 && <EmptyRow cols={4} text="No admins yet." />}
        {admins.map((a) => (
          <tr key={a.id} className="transition hover:bg-slate-50">
            <td className="px-4 py-3 font-semibold text-navy-900">
              {a.name}
              {a.id === me.id && <span className="ml-2 text-xs text-slate-500">(you)</span>}
            </td>
            <td className="px-4 py-3">{a.email}</td>
            <td className="px-4 py-3">
              {a.id === me.id ? (
                ROLES.find((r) => r.key === a.role)?.label
              ) : (
                <form action={setAdminRole} className="flex gap-2">
                  <input type="hidden" name="id" value={a.id} />
                  <select name="role" defaultValue={a.role} className="rounded-lg border border-slate-300 px-2 py-1 text-xs">
                    {ROLES.map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <Btn tone="ghost" className="!px-2.5 !py-1 text-xs">
                    Save
                  </Btn>
                </form>
              )}
            </td>
            <td className="px-4 py-3">
              {a.id === me.id ? (
                <Badge t="green">Active</Badge>
              ) : (
                <form action={toggleAdmin}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="isActive" value={String(a.isActive)} />
                  <button>
                    <Badge t={a.isActive ? "green" : "gray"}>{a.isActive ? "Active" : "Disabled"}</Badge>
                  </button>
                </form>
              )}
            </td>
          </tr>
        ))}
      </DataTable>

      <h2 className="text-lg font-semibold text-navy-900">What each role can do</h2>
      <DataTable head={["Right", ...ROLES.map((r) => r.label)]} min={600}>
        {(Object.keys(PERM_LABEL) as Perm[]).map((p) => (
          <tr key={p} className="transition hover:bg-slate-50">
            <td className="px-4 py-3">{PERM_LABEL[p]}</td>
            {ROLES.map((r) => (
              <td key={r.key} className="px-4 py-3">
                {can(r.key, p) ? <Check size={18} className="text-emerald-600" /> : <span className="text-slate-300">-</span>}
              </td>
            ))}
          </tr>
        ))}
      </DataTable>
    </>
  );
}
