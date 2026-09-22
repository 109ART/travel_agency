import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { createPost, togglePost, deletePost } from "@/lib/actions";
import { Badge, Btn, Card, DataTable, EmptyRow, Field, PageTitle, inputCls } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function BlogAdminPage() {
  await requireAdmin("content");
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageTitle title="Blog and content" sub="Write guides and articles for your website." />
      <Card>
        <form action={createPost} className="grid gap-3 p-5">
          <Field label="Title" name="title" />
          <Field label="Short summary" name="excerpt" />
          <label className="text-sm">
            <span className="mb-1 block font-medium text-navy-900">Article</span>
            <textarea name="content" required rows={8} className={inputCls} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublished" defaultChecked /> Publish now
          </label>
          <div>
            <Btn>Save post</Btn>
          </div>
        </form>
      </Card>

      <DataTable head={["Title", "Date", "Status", ""]} min={600}>
        {posts.length === 0 && <EmptyRow cols={4} text="No posts yet. Write your first article above." />}
        {posts.map((p) => (
          <tr key={p.id} className="transition hover:bg-slate-50">
            <td className="px-4 py-3">
              <p className="font-semibold text-navy-900">{p.title}</p>
              <p className="text-slate-500">{p.excerpt}</p>
            </td>
            <td className="px-4 py-3">{p.createdAt.toLocaleDateString("en-GB")}</td>
            <td className="px-4 py-3">
              <form action={togglePost}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="isPublished" value={String(p.isPublished)} />
                <button title="Click to publish or unpublish">
                  <Badge t={p.isPublished ? "green" : "gray"}>{p.isPublished ? "Published" : "Draft"}</Badge>
                </button>
              </form>
            </td>
            <td className="px-4 py-3 text-right">
              <form action={deletePost}>
                <input type="hidden" name="id" value={p.id} />
                <button className="text-sm font-medium text-rose-700 hover:underline">Delete</button>
              </form>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
