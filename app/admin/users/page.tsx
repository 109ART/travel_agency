import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { createUser, deleteUser } from "@/lib/actions";
import { Btn, Card, DataTable, EmptyRow, Field, PageTitle } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireAdmin("users");
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { umrahRequests: true, visaRequests: true, flightBookings: true } } },
  });

  return (
    <>
      <PageTitle title="User management" sub="Your customers and their identity documents." />
      <Card>
        <form action={createUser} className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Full name" name="name" />
          <Field label="Phone" name="phone" />
          <Field label="Email (optional)" name="email" type="email" required={false} />
          <Field label="CNIC" name="cnic" required={false} />
          <Field label="Passport number" name="passportNo" required={false} />
          <div className="flex items-end">
            <Btn>Add user</Btn>
          </div>
        </form>
      </Card>

      <DataTable head={["Name", "Contact", "CNIC / passport", "Umrah / visa / flights", ""]} min={750}>
        {users.length === 0 && <EmptyRow cols={5} text="No users yet. Customers appear here when they submit a request." />}
        {users.map((u) => {
          const c = u._count;
          const total = c.umrahRequests + c.visaRequests + c.flightBookings;
          return (
            <tr key={u.id} className="transition hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold text-navy-900">{u.name}</td>
              <td className="px-4 py-3">
                {u.phone}
                <br />
                <span className="text-slate-500">{u.email}</span>
              </td>
              <td className="px-4 py-3">
                {u.cnic ?? "-"}
                <br />
                <span className="text-slate-500">{u.passportNo ?? "-"}</span>
              </td>
              <td className="px-4 py-3">
                {c.umrahRequests} / {c.visaRequests} / {c.flightBookings}
              </td>
              <td className="px-4 py-3 text-right">
                {total === 0 && (
                  <form action={deleteUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <button className="text-sm font-medium text-rose-700 hover:underline">Delete</button>
                  </form>
                )}
              </td>
            </tr>
          );
        })}
      </DataTable>
    </>
  );
}
