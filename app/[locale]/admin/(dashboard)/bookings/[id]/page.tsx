import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBookingById, updateBookingStatus } from "@/lib/actions/bookings";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/booking-status-badge";
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

type Props = {
  params: { id: string; locale: string };
};

export default async function AdminBookingDetailPage({ params }: Props) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const booking = await getBookingById(params.id);
  if (!booking) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Booking details
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and update a single booking.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/${locale}/admin/bookings`}>Back to bookings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking #{booking.id}</CardTitle>
          <CardDescription>
            Created {formatDateTime(booking.createdAt)} · Last updated{" "}
            {formatDateTime(booking.updatedAt)}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Course
            </div>
            <div className="font-medium text-foreground">
              {booking.course?.title ?? "(deleted course)"}
            </div>
            {booking.course?.titleZh ? (
              <div className="text-sm text-muted-foreground">
                {booking.course.titleZh}
              </div>
            ) : null}
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Customer
            </div>
            <div className="font-medium text-foreground">{booking.name}</div>
            <div className="text-sm">
              <a
                href={`mailto:${booking.email}`}
                className="text-primary underline-offset-2 hover:underline"
              >
                {booking.email}
              </a>
            </div>
            {booking.phone ? (
              <div className="text-sm text-muted-foreground">{booking.phone}</div>
            ) : null}
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Booking status
            </div>
            <div>
              <BookingStatusBadge status={booking.status} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Payment status
            </div>
            <div>
              <PaymentStatusBadge status={booking.paymentStatus} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Preferred date
            </div>
            <div className="text-sm">{formatDate(booking.preferredDate)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Phone
            </div>
            <div className="text-sm">{booking.phone ?? "—"}</div>
          </div>

          <div className="sm:col-span-2 space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Notes
            </div>
            <div className="whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-3 text-sm">
              {booking.notes ?? "—"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update status</CardTitle>
          <CardDescription>
            Change the booking status. The change takes effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingStatusForm
            bookingId={booking.id}
            currentStatus={booking.status}
            action={updateBookingStatus}
            locale={locale}
          />
        </CardContent>
      </Card>
    </div>
  );
}
