import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Plus, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AdminListHeader,
  AdminListTable,
  AdminTableRow,
} from "@/components/admin/admin-list-header";
import { getPosts, deletePost } from "@/lib/actions/blog";
import { isLocale, type Locale } from "@/i18n.config";

export const dynamic = "force-dynamic";

function DeletePostButton({
  id,
  title,
  locale,
}: {
  id: string;
  title: string;
  locale: Locale;
}) {
  async function handleDelete() {
    "use server";
    const result = await deletePost(id, locale);
    if (result && result.status === "error") {
      revalidatePath(`/${locale}/admin/blog`);
      throw new Error(result.message);
    }
  }

  return (
    <form action={handleDelete}>
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        aria-label={`Delete testimonial ${title}`}
        className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        Delete
      </Button>
    </form>
  );
}

export default async function AdminBlogPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const posts = await getPosts();

  return (
    <div className="space-y-8">
      <AdminListHeader
        eyebrow="Editorial"
        title="Testimonials"
        description="Manage client testimonials shown on the public site."
        accent="terracotta"
        actions={
          <Button
            asChild
            className="bg-terracotta-600 text-terracotta-50 hover:bg-terracotta-700 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <Link href={`/${locale}/admin/blog/new`}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              Create testimonial
            </Link>
          </Button>
        }
      />

      {posts.length === 0 ? (
        <Card className="border-brand-sand/60 bg-gradient-to-br from-background to-terracotta-50">
          <CardHeader>
            <span
              aria-hidden
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-terracotta-100 text-terracotta-700"
            >
              <Newspaper className="h-5 w-5" />
            </span>
            <CardTitle className="font-display text-brand-900">
              No testimonials yet
            </CardTitle>
            <CardDescription>
              Get started by adding your first client testimonial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="bg-terracotta-600 text-terracotta-50 hover:bg-terracotta-700 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Link href={`/${locale}/admin/blog/new`}>
                <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                Create your first testimonial
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AdminListTable accent="terracotta">
          <table className="w-full text-sm">
            <thead className="bg-terracotta-50/60 text-left">
              <tr className="border-b border-brand-sand/60">
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Title
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Updated
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-medium text-right text-brand-800"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sand/60">
              {posts.map((post) => (
                <AdminTableRow key={post.id} accent="terracotta">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {post.title}
                    </div>
                    {post.titleZh ? (
                      <div className="text-xs text-muted-foreground">
                        {post.titleZh}
                      </div>
                    ) : null}
                    <div className="mt-1 text-xs text-muted-foreground">
                      /{post.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {post.published ? (
                      <span className="inline-flex items-center rounded-full bg-sage-100 px-2 py-0.5 text-xs font-medium text-sage-700">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(post.updatedAt).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-terracotta-300 text-terracotta-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-terracotta-500 hover:bg-terracotta-50 hover:shadow-sm"
                      >
                        <Link href={`/${locale}/admin/blog/${post.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                      <DeletePostButton
                        id={post.id}
                        title={post.title}
                        locale={locale}
                      />
                    </div>
                  </td>
                </AdminTableRow>
              ))}
            </tbody>
          </table>
        </AdminListTable>
      )}
    </div>
  );
}
