"use client";

import { LogOut } from "lucide-react";
import { Btn } from "@/components/admin/ui";
import { logout } from "@/lib/actions";

export default function LogoutButton() {
  return (
    <form
      action={logout}
      onSubmit={(e) => {
        if (!confirm("Are you sure you want to log out?")) e.preventDefault();
      }}
    >
      <Btn tone="ghost" type="submit">
        <LogOut size={16} /> Log out
      </Btn>
    </form>
  );
}