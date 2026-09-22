import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0d131f] text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold text-[#d4af37] mb-4">SafarPro</h1>
      <p className="text-slate-400 mb-8 text-center max-w-md">
        Your trusted partner for Umrah packages, flight bookings, and visa services.
      </p>
      <Link
        href="/admin"
        className="bg-[#d4af37] text-slate-950 font-semibold px-6 py-3 rounded hover:bg-[#f3e5ab] transition"
      >
        Go to Admin Panel
      </Link>
    </main>
  );
}