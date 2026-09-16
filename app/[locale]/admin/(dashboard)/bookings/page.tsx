import Link from "next/link";
import { Inbox } from "lucide-react";
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
import { getBookings, updateBookingStatus } from "@/lib/actions/bookings";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/admin/booking-status-badge";
import { BookingStatusForm } from "@/components/admin/booking-status-form";
import { isLocale, type Locale } from "@/i18n.config";

export const dynamic = "force-dynamic";

function formatDate(value: Date | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value: Date | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminBookingsPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const bookings = await getBookings();

  return (
    <div className="space-y-8">
      <AdminListHeader
        eyebrow="Customer reservations"
        title="Bookings"
        description="Manage course bookings submitted from the public site."
        accent="sage"
      />

      {bookings.length === 0 ? (
        <Card className="border-brand-sand/60 bg-gradient-to-br from-background to-sage-50">
          <CardHeader>
            <span
              aria-hidden
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-sage-700"
            >
              <Inbox className="h-5 w-5" />
            </span>
            <CardTitle className="font-display text-brand-900">
              No bookings yet
            </CardTitle>
            <CardDescription>
              New bookings will appear here once customers submit them.
            </CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      ) : (
        <AdminListTable accent="sage">
          <table className="w-full text-sm">
            <thead className="bg-sage-50/70 text-left">
              <tr className="border-b border-brand-sand/60">
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Course
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Payment
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Preferred date
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-brand-800">
                  Created
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-right text-brand-800">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-sand/60">
              {bookings.map((booking) => (
                <AdminTableRow key={booking.id} accent="sage">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">
                      {booking.course?.title ?? "(deleted course)"}
                    </div>
                    {booking.course?.titleZh ? (
                      <div className="text-xs text-muted-foreground">
                        {booking.course.titleZh}
                      </div>
                    ) : null}
                    <div className="mt-1 text-xs text-muted-foreground">
                      ID: {booking.id.slice(0, 8)}
                    </div>
                  </td>
                  <td className="px-4 py-3">{booking.name}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${booking.email}`}
                      className="text-sage-700 underline-offset-2 transition-colors duration-200 hover:text-sage-900 hover:underline"
                    >
                      {booking.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <BookingStatusBadge status={booking.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={booking.paymentStatus} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(booking.preferredDate)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(booking.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-sage-300 text-sage-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-sage-500 hover:bg-sage-50 hover:shadow-sm"
                      >
                        <Link href={`/${locale}/admin/bookings/${booking.id}`}>
                          View
                        </Link>
                      </Button>
                      <BookingStatusForm
                        bookingId={booking.id}
                        currentStatus={booking.status}
                        action={updateBookingStatus}
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
