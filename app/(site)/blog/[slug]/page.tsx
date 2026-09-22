import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.isPublished) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy-900">{post.title}</h1>
      <p className="mt-2 text-sm text-slate-500">{post.createdAt.toLocaleDateString("en-GB", { dateStyle: "long" })}</p>
      <div className="mt-6 whitespace-pre-line text-lg leading-relaxed text-slate-700">{post.content}</div>
    </article>
  );
}
