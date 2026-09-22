import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import { Btn, Field } from "@/components/admin/ui";
import { getAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { login, setupFirstAdmin } from "@/lib/actions";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  "1": "The email or password is wrong, or this admin is disabled.",
  short: "Password must be at least 8 characters.",
  config: "SESSION_SECRET is missing in .env. Add it and restart the server.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const first = (await prisma.admin.count()) === 0;

  return (
    <main className="grid min-h-screen place-items-center bg-navy-grad p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <Logo tone="dark" />
        <h1 className="mt-6 text-2xl font-bold text-navy-900">{first ? "Create the first super admin" : "Sign in"}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {first ? "No admin exists yet. This account will have every right." : "Enter your admin email and password."}
        </p>
        {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{messages[error] ?? messages["1"]}</p>}
        <form action={first ? setupFirstAdmin : login} className="mt-5 grid gap-3">
          {first && <Field label="Name" name="name" />}
          <Field label="Email" name="email" type="email" />
          <Field label="Password" name="password" type="password" />
          <Btn className="justify-center">{first ? "Create account" : "Sign in"}</Btn>
        </form>
      </div>
    </main>
  );
}
