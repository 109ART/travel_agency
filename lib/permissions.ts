export type Role = "SUPER_ADMIN" | "ADMIN" | "STAFF";
export type Perm = "requests" | "users" | "content" | "admins" | "audit" | "sales";

export const ROLE_PERMS: Record<Role, Perm[]> = {
  SUPER_ADMIN: ["requests", "users", "content", "admins", "audit", "sales"],
  ADMIN: ["requests", "users", "content", "audit", "sales"],
  STAFF: ["requests", "users"],
};

export const PERM_LABEL: Record<Perm, string> = {
  requests: "Handle Umrah, visa and flight requests, send quotations, update payments",
  users: "Manage customers and their documents",
  content: "Write and publish blog posts",
  admins: "Create admins and change their access",
  audit: "View audit history",
  sales: "View the sales and profit report, export to CSV",
};

export const can = (role: Role, perm: Perm) => ROLE_PERMS[role].includes(perm);
