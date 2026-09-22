import Link from "next/link";
import { Landmark, Stamp, Plane } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const services = [
  { href: "/request?type=umrah", title: "Umrah packages", note: "Tell us your dates and hotels, we send a quotation.", Icon: Landmark },
  { href: "/request?type=visa", title: "Visa services", note: "Share your documents and get a visa quotation.", Icon: Stamp },
  { href: "/request?type=flight", title: "Flight booking", note: "Send your route and dates, we confirm the fare.", Icon: Plane },
];

export default async function Home() {
  const posts = await prisma.blogPost.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" }, take: 3 });

  return (
    <>
      <section className="bg-navy-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">Umrah, flights and visas, arranged by one team.</h1>
          <p className="mt-4 max-w-xl text-lg text-white/75">Send your request, get a clear quotation, and we take care of the rest.</p>
          <Link
            href="/request?type=umrah"
            className="mt-8 inline-block rounded-lg bg-gold-grad px-5 py-3 font-semibold text-navy-950 transition hover:brightness-105"
          >
            Request an Umrah quotation
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-3">
        {services.map(({ href, title, note, Icon }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-navy-900/5 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-navy-900/5 text-navy-800">
              <Icon size={22} />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-navy-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{note}</p>
          </Link>
        ))}
      </section>

      {posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <h2 className="mb-4 text-2xl font-bold text-navy-900">From the blog</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-navy-900/5 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <h3 className="text-lg font-semibold text-navy-900">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
