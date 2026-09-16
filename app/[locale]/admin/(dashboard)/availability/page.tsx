import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Plus, CalendarDays } from "lucide-react";
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
import {
  getAvailabilities,
  deleteAvailability,
} from "@/lib/actions/availability";
import { isLocale, type Locale } from "@/i18n.config";

export const dynamic = "force-dynamic";

function DeleteAvailabilityButton({
  id,
  courseTitle,
  locale,
}: {
  id: string;
  courseTitle: string;
  locale: Locale;
}) {
  async function handleDelete() {
    "use server";
    const result = await deleteAvailability(id, locale);
    if (result && result.status === "error") {
      revalidatePath(`/${locale}/admin/availability`);
      throw new Error(result.message);
    }
  }

  return (
    <form action={handleDelete}>
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        aria-label={`Delete availability slot for ${courseTitle}`}
        className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        Delete
      </Button>
    </form>
  );
}

function formatDateTime(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminAvailabilityPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const slots = await getAvailabilities();

  return (
    <div className="space-y-8">
      <AdminListHeader
        eyebrow="Scheduling"
        title="Availability"
        description="Manage bookable time slots for each course. Slots can be hidden from the booking flow without being deleted."
        accent="terracotta"
        actions={
          <Button
            asChild
            className="bg-terracotta-600 text-terracotta-50 hover:bg-terracotta-700 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <Link href={`/${locale}/admin/availability/new`}>
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              Create slot
            </Link>
          </Button>
        }
      />

      {slots.length === 0 ? (
        <Card className="border-brand-sand/60 bg-gradient-to-br from-background to-terracotta-50">
          <CardHeader>
            <span
              aria-hidden
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-terracotta-100 text-terracotta-700"
            >
              <CalendarDays className="h-5 w-5" />
            </span>
            <CardTitle className="font-display text-brand-900">
              No availability slots yet
            </CardTitle>
            <CardDescription>
              Create your first slot to start accepting bookings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="bg-terracotta-600 text-terracotta-50 hover:bg-terracotta-700 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Link href={`/${locale}/admin/availability/new`}>
                <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                Create your first slot
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
                  Course
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Starts
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Ends
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Capacity
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Booked
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Status
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
              {slots.map((slot) => {
                const courseTitle = slot.course?.title ?? "(no course)";
                return (
                  <AdminTableRow key={slot.id} accent="terracotta">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {courseTitle}
                      </div>
                      {slot.course?.slug ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          /{slot.course.slug}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(slot.startDateTime)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(slot.endDateTime)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {slot.capacity}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {slot.bookedCount}
                    </td>
                    <td className="px-4 py-3">
                      {slot.isAvailable ? (
                        <span className="inline-flex items-center rounded-full bg-sage-100 px-2 py-0.5 text-xs font-medium text-sage-700">
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-terracotta-300 text-terracotta-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-terracotta-500 hover:bg-terracotta-50 hover:shadow-sm"
                        >
                          <Link
                            href={`/${locale}/admin/availability/${slot.id}/edit`}
                          >
                            Edit
                          </Link>
                        </Button>
                        <DeleteAvailabilityButton
                          id={slot.id}
                          courseTitle={courseTitle}
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
