"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { CalendarDays, Mail, Phone, UserRound } from "lucide-react";
import type { Locale } from "@/i18n.config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentButton } from "@/components/payment-button";
import { StatusCard, StatusCardSkeleton } from "@/components/status-card";

type BookingDetails = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes: string | null;
  preferredDate: string | null;
  course: {
    title: string;
    titleZh: string | null;
    price: number;
  };
  availability: {
    startDateTime: string;
    endDateTime: string;
    capacity: number;
  } | null;
};

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "missing-id" }
  | { kind: "not-found" }
  | { kind: "error"; message: string }
  | { kind: "loaded"; booking: BookingDetails };

/**
 * Client-side booking confirmation renderer.
 *
 * Reads `bookingId` from the URL via `useSearchParams`, fetches the
 * booking details from `/api/bookings/[id]`, and renders one of:
 *   - missing-id (no `bookingId` in the URL)
 *   - loading
 *   - not-found
 *   - error
 *   - loaded (the full confirmation block)
 *
 * The redesign funnels the headline / status surface through the
 * shared `StatusCard` so the booking, payment success and payment
 * cancel flows share the same visual language.
 */
export function BookingConfirmation({
  locale,
  initialBooking,
}: {
  locale: Locale;
  initialBooking?: BookingDetails;
}) {
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get("bookingId") ?? null;
  const email = searchParams?.get("email") ?? null;
  const t = useTranslations("booking.confirmed");
  const tp = useTranslations("booking.payment");

  const [state, setState] = useState<LoadState>(
    initialBooking
      ? { kind: "loaded", booking: initialBooking }
      : !bookingId || !email
        ? { kind: "missing-id" }
        : { kind: "idle" },
  );

  useEffect(() => {
    if (!bookingId) {
      setState({ kind: "missing-id" });
      return;
    }
    if (!email) {
      // No email supplied → the API would reject the request, so
      // surface the same "missing reference" CTA the user sees for a
      // missing bookingId. They can recover by clicking the link in
      // the confirmation email which carries both pieces of state.
      setState({ kind: "missing-id" });
      return;
    }
    let cancelled = false;
    setState({ kind: "loading" });
    const url = `/api/bookings/${encodeURIComponent(bookingId)}?email=${encodeURIComponent(email)}`;
    fetch(url)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setState({ kind: "not-found" });
          return;
        }
        if (res.status === 401) {
          setState({ kind: "not-found" });
          return;
        }
        if (!res.ok) {
          setState({ kind: "error", message: `HTTP ${res.status}` });
          return;
        }
        const data = (await res.json()) as BookingDetails;
        if (!cancelled) setState({ kind: "loaded", booking: data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [bookingId, email]);

  if (state.kind === "missing-id") {
    return (
      <StatusCard
        variant="warning"
        title={t("missingReference")}
        message={t("missingReferenceBody")}
        eyebrow={t("eyebrow")}
        footer={
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">{t("footer")}</p>
            <Button asChild>
              <Link href={`/${locale}/courses`}>{t("backToCourses")}</Link>
            </Button>
          </div>
        }
      />
    );
  }

  if (state.kind === "loading" || state.kind === "idle") {
    return <StatusCardSkeleton message={t("loading")} />;
  }

  if (state.kind === "not-found") {
    return (
      <StatusCard
        variant="error"
        title={t("notFound")}
        message={t("notFoundBody")}
        eyebrow={t("eyebrow")}
        footer={
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">{t("footer")}</p>
            <Button asChild>
              <Link href={`/${locale}/courses`}>{t("backToCourses")}</Link>
            </Button>
          </div>
        }
      />
    );
  }

  if (state.kind === "error") {
    return (
      <StatusCard
        variant="error"
        title={t("errorTitle")}
        message={state.message}
        eyebrow={t("eyebrow")}
        footer={
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">{t("footer")}</p>
            <Button asChild>
              <Link href={`/${locale}/courses`}>{t("backToCourses")}</Link>
            </Button>
          </div>
        }
      />
    );
  }

  const booking = state.booking;
  const statusLabel = formatBookingStatus(booking.status, locale);
  const courseTitle =
    locale === "zh-Hant" && booking.course.titleZh
      ? booking.course.titleZh
      : booking.course.title;

  const startDate = booking.availability?.startDateTime
    ? new Date(booking.availability.startDateTime)
    : booking.preferredDate
      ? new Date(booking.preferredDate)
      : null;
  const endDate = booking.availability?.endDateTime
    ? new Date(booking.availability.endDateTime)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <StatusCard
        variant="success"
        title={t("headline")}
        eyebrow={t("eyebrow")}
        message={t("intro")}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("referenceHeading")}</CardTitle>
          <CardDescription className="text-sm">
            {t("referenceDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("reference")}
              </dt>
              <dd className="font-mono text-sm text-foreground break-all">
                {booking.id}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("status")}
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {statusLabel}
              </dd>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("course")}
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {courseTitle}
              </dd>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("session")}
                </span>
              </dt>
              <dd className="text-sm text-foreground">
                {formatSessionWindow(startDate, endDate, locale)}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("attendee")}
                </span>
              </dt>
              <dd className="text-sm text-foreground">{booking.name}</dd>
            </div>

            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("emailLabel")}
                </span>
              </dt>
              <dd className="text-sm text-foreground">
                <a
                  className="text-primary underline-offset-2 hover:underline"
                  href={`mailto:${booking.email}`}
                >
                  {booking.email}
                </a>
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("phoneLabel")}
                </span>
              </dt>
              <dd className="text-sm text-foreground">
                {booking.phone ?? t("phoneNotProvided")}
              </dd>
            </div>
          </dl>

          {booking.notes ? (
            <div className="space-y-1 rounded-md border border-border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("notes")}
              </p>
              <p className="whitespace-pre-line text-sm text-foreground">
                {booking.notes}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {booking.paymentStatus === PaymentStatus.PENDING && email ? (
        <Card data-testid="payment-cta">
          <CardHeader>
            <CardTitle className="text-lg">{tp("paymentTitle")}</CardTitle>
            <CardDescription className="text-sm">
              {tp("paymentDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentButton
              bookingId={booking.id}
              email={email}
              locale={locale}
              courseTitle={courseTitle}
              amount={booking.course.price}
              currency="hkd"
            />
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">{t("footer")}</p>
        <Button asChild>
          <Link href={`/${locale}/courses`}>{t("backToCourses")}</Link>
        </Button>
      </div>
    </div>
  );
}

function formatBookingStatus(status: BookingStatus, locale: Locale): string {
  const dictionary: Record<BookingStatus, { en: string; "zh-Hant": string }> = {
    PENDING: { en: "Pending", "zh-Hant": "待確認" },
    CONFIRMED: { en: "Confirmed", "zh-Hant": "已確認" },
    CANCELLED: { en: "Cancelled", "zh-Hant": "已取消" },
    COMPLETED: { en: "Completed", "zh-Hant": "已完成" },
  };
  return dictionary[status][locale] ?? dictionary[status].en;
}

function formatSessionWindow(
  start: Date | null,
  end: Date | null,
  locale: Locale,
): string {
  if (!start) return "—";
  if (Number.isNaN(start.getTime())) return "—";
  const intlLocale = locale === "zh-Hant" ? "zh-Hant" : "en";
  const fmt = new Intl.DateTimeFormat(intlLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const startLabel = fmt.format(start);
  if (end && !Number.isNaN(end.getTime())) {
    const endLabel = new Intl.DateTimeFormat(intlLocale, {
      hour: "numeric",
      minute: "2-digit",
    }).format(end);
    return `${startLabel} – ${endLabel}`;
  }
  return startLabel;
}
