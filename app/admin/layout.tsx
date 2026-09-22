import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  return (
    <AdminShell role={me.role} name={me.name}>
      {children}
    </AdminShell>
  );
}