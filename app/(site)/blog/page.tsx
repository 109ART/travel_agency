import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-navy-900">Travel guides and articles</h1>
      {posts.length === 0 && <p className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-card">No articles yet.</p>}
      <div className="space-y-4">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="block rounded-2xl bg-white p-6 shadow-card ring-1 ring-navy-900/5 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <h2 className="text-xl font-semibold text-navy-900">{p.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{p.createdAt.toLocaleDateString("en-GB", { dateStyle: "long" })}</p>
            <p className="mt-2 text-slate-600">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
