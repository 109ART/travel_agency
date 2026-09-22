"use client";

import { useState } from "react";
import { Menu, X, LifeBuoy } from "lucide-react";
import Logo from "@/components/Logo";
import NavLinks from "@/components/admin/NavLinks";
import LogoutButton from "@/components/admin/LogoutButton";
import type { Role } from "@/lib/permissions";

export default function AdminShell({
  role,
  name,
  children,
}: {
  role: Role;
  name: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between gap-3 bg-navy-grad px-4 py-3 text-white lg:hidden">
        <Logo sub="Agency Management Portal" />
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg border border-white/20 p-2 hover:bg-white/10"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar: fixed on desktop, sliding drawer on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-navy-grad text-white transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-64 lg:translate-x-0 lg:flex lg:flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 lg:p-6">
          <Logo />
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
        <div onClick={() => setOpen(false)}>
          <NavLinks role={role} />
        </div>
        <div className="mt-auto hidden p-4 lg:block">
          <div className="flex items-center gap-3 rounded-xl border border-white/15 p-4">
            <LifeBuoy className="text-gold-400" />
            <div className="text-sm">
              <p className="font-semibold">Need help?</p>
              <p className="text-white/70">Contact your super admin</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Top header - user section kept exactly as before */}
        <header className="flex items-center justify-end gap-4 border-b border-navy-900/10 bg-white px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-navy-900 font-semibold text-gold-400">
              {name.charAt(0).toUpperCase()}
            </span>
            <div className="text-sm leading-tight">
              <p className="font-semibold text-navy-900">{name}</p>
              <p className="text-slate-500">{role.replace("_", " ").toLowerCase()}</p>
            </div>
          </div>
          <LogoutButton />
        </header>
        <main className="space-y-6 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}