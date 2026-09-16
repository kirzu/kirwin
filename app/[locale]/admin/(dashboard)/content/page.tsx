import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Plus, FileText } from "lucide-react";
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
import { getSections, deleteSection } from "@/lib/actions/content";
import { isLocale, type Locale } from "@/i18n.config";

export const dynamic = "force-dynamic";

function DeleteSectionButton({
  id,
  label,
  locale,
}: {
  id: string;
  label: string;
  locale: Locale;
}) {
  async function handleDelete() {
    "use server";
    const result = await deleteSection(id, locale);
    if (result && result.status === "error") {
      revalidatePath(`/${locale}/admin/content`);
      throw new Error(result.message);
    }
  }

  return (
    <form action={handleDelete}>
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        aria-label={`Delete content section ${label}`}
        className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        Delete
      </Button>
    </form>
  );
}

export default async function AdminContentPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const sections = await getSections();

  return (
    <div className="space-y-8">
      <AdminListHeader
        eyebrow="Site copy"
        title="Content sections"
        description="Manage reusable site copy blocks (hero, about, contact info, etc.) used across the public site."
        accent="sage"
        actions={
          <Button
            asChild
            className="bg-sage-600 text-sage-50 hover:bg-sage-700 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <Link href={`/${locale}/admin/content/new`}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              Create section
            </Link>
          </Button>
        }
      />

      {sections.length === 0 ? (
        <Card className="border-brand-sand/60 bg-gradient-to-br from-background to-sage-50">
          <CardHeader>
            <span
              aria-hidden
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-sage-700"
            >
              <FileText className="h-5 w-5" />
            </span>
            <CardTitle className="font-display text-brand-900">
              No content sections yet
            </CardTitle>
            <CardDescription>
              Get started by creating your first content section.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="bg-sage-600 text-sage-50 hover:bg-sage-700 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Link href={`/${locale}/admin/content/new`}>
                <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                Create your first section
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AdminListTable accent="sage">
          <table className="w-full text-sm">
            <thead className="bg-sage-50/70 text-left">
              <tr className="border-b border-brand-sand/60">
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Key
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Label
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Value preview
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
              {sections.map((section) => {
                const preview =
                  section.value.length > 80
                    ? `${section.value.slice(0, 80)}...`
                    : section.value;
                return (
                  <AdminTableRow key={section.id} accent="sage">
                    <td className="px-4 py-3">
                      <code className="rounded bg-sage-100/70 px-1.5 py-0.5 font-mono text-xs text-sage-800">
                        {section.key}
                      </code>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {section.label}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="line-clamp-2 block max-w-md">
                        {preview}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(section.updatedAt).toLocaleDateString("en-GB", {
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
                          className="border-sage-300 text-sage-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-sage-500 hover:bg-sage-50 hover:shadow-sm"
                        >
                          <Link
                            href={`/${locale}/admin/content/${section.id}/edit`}
                          >
                            Edit
                          </Link>
                        </Button>
                        <DeleteSectionButton
                          id={section.id}
                          label={section.label}
                          locale={locale}
                        />
                      </div>
                    </td>
                  </AdminTableRow>
                );
              })}
            </tbody>
          </table>
        </AdminListTable>
      )}
    </div>
  );
}
