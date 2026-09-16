import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Plus, GraduationCap } from "lucide-react";
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
import { getCourses, deleteCourse } from "@/lib/actions/courses";
import { formatDuration, formatPriceHkd } from "@/lib/format";
import { isLocale, type Locale } from "@/i18n.config";

export const dynamic = "force-dynamic";

function DeleteCourseButton({
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
    const result = await deleteCourse(id, locale);
    if (result && result.status === "error") {
      revalidatePath(`/${locale}/admin/courses`);
      throw new Error(result.message);
    }
  }

  return (
    <form action={handleDelete}>
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        aria-label={`Delete course ${title}`}
        className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        Delete
      </Button>
    </form>
  );
}

export default async function AdminCoursesPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const courses = await getCourses();

  return (
    <div className="space-y-8">
      <AdminListHeader
        eyebrow="Training catalogue"
        title="Courses"
        description="Manage training courses available on the public site."
        accent="brand"
        actions={
          <Button
            asChild
            className="bg-brand-700 text-brand-50 hover:bg-brand-800 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <Link href={`/${locale}/admin/courses/new`}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              Create course
            </Link>
          </Button>
        }
      />

      {courses.length === 0 ? (
        <Card className="border-brand-sand/60 bg-gradient-to-br from-background to-brand-50">
          <CardHeader>
            <span
              aria-hidden
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700"
            >
              <GraduationCap className="h-5 w-5" />
            </span>
            <CardTitle className="font-display text-brand-900">
              No courses yet
            </CardTitle>
            <CardDescription>
              Get started by creating your first course listing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="bg-brand-700 text-brand-50 hover:bg-brand-800 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Link href={`/${locale}/admin/courses/new`}>
                <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                Create your first course
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AdminListTable accent="brand">
          <table className="w-full text-sm">
            <thead className="bg-brand-50/60 text-left">
              <tr className="border-b border-brand-sand/60">
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Title
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Duration
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Max
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Price
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
              {courses.map((course) => {
                const duration = formatDuration(course.durationMinutes);
                const priceLabel = formatPriceHkd(course.price);
                return (
                  <AdminTableRow key={course.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {course.title}
                      </div>
                      {course.titleZh ? (
                        <div className="text-xs text-muted-foreground">
                          {course.titleZh}
                        </div>
                      ) : null}
                      <div className="mt-1 text-xs text-muted-foreground">
                        /{course.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {course.published ? (
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
                      {duration ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {course.maxParticipants}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {priceLabel}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-brand-300 text-brand-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-50 hover:shadow-sm"
                        >
                          <Link href={`/${locale}/admin/courses/${course.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                        <DeleteCourseButton
                          id={course.id}
                          title={course.title}
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
