import Link from "next/link";
import Logo from "@/components/Logo";

const links = [
  ["/", "Home"],
  ["/request?type=umrah", "Umrah"],
  ["/request?type=visa", "Visa"],
  ["/request?type=flight", "Flights"],
  ["/blog", "Blog"],
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-navy-grad text-white shadow-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/">
          <Logo sub="Umrah, flights and visas" />
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-lg px-3 py-2 text-white/80 transition hover:bg-white/10 hover:text-white">
              {label}
            </Link>
          ))}
          <Link href="/login" className="ml-2 rounded-lg bg-gold-grad px-4 py-2 font-semibold text-navy-950 transition hover:brightness-105">
            Admin login
          </Link>
        </nav>
      </div>
    </header>
  );
}
