"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Landmark, Stamp, Plane, Users, FileText, ShieldCheck, History } from "lucide-react";
import { can, type Perm, type Role } from "@/lib/permissions";

const ITEMS: { href: string; label: string; Icon: typeof LayoutDashboard; perm?: Perm }[] = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/umrah", label: "Umrah requests", Icon: Landmark, perm: "requests" },
  { href: "/admin/visa", label: "Visa requests", Icon: Stamp, perm: "requests" },
  { href: "/admin/flights", label: "Flight bookings", Icon: Plane, perm: "requests" },
  { href: "/admin/users", label: "User management", Icon: Users, perm: "users" },
  { href: "/admin/blog", label: "Blog and content", Icon: FileText, perm: "content" },
  { href: "/admin/admins", label: "Admins and rights", Icon: ShieldCheck, perm: "admins" },
  { href: "/admin/audit", label: "Audit history", Icon: History, perm: "audit" },
];

export default function NavLinks({ role }: { role: Role }) {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-2 px-4 pb-4">
      {ITEMS.filter((i) => !i.perm || can(role, i.perm)).map(({ href, label, Icon }) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-none items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              active ? "bg-gold-grad text-navy-950 shadow-lg" : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
