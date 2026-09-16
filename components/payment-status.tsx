"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n.config";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusCard } from "@/components/status-card";

/**
 * Variant for the shared payment-status block.
 *
 * - `success`: rendered on the post-checkout success page
 * - `cancel`: rendered on the post-checkout cancellation page
 *
 * The two flows share the same reference-block layout so we render
 * both with a single client component.
 */
export type PaymentStatusVariant = "success" | "cancel";

/**
 * Client-side renderer for the post-checkout landing pages.
 *
 * Mirrors the approach used by `components/booking-confirmation.tsx`:
 * the surrounding page is a static server component that ships a
 * pre-localised shell with eyebrow/title/intro already in the HTML,
 * while this client component reads the optional `bookingId` and
 * `email` query parameters via `useSearchParams`.
 *
 * The redesigned surface funnels the headline (icon + title + intro)
 * through the shared `StatusCard` so the success, cancellation and
 * booking-confirmation flows share one visual language. The detailed
 * reference block keeps its original Card markup (with the
 * `success-reference` / `cancel-reference` test ids) so existing
 * behaviour assertions remain valid.
 */
export function PaymentStatus({
  locale,
  variant,
}: {
  locale: Locale;
  variant: PaymentStatusVariant;
}) {
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get("bookingId") ?? null;
  const sessionId = searchParams?.get("session_id") ?? null;
  const email = searchParams?.get("email") ?? null;
  const t = useTranslations(`booking.payment.${variant}`);

  const hasReference = Boolean(bookingId);

  // Build the link targets. When we have a bookingId, both variants
  // route the user back to the booking confirmation page (which will
  // refetch details and, on cancel, re-surface the payment button).
  // Without a bookingId we fall back to the courses list.
  const referenceHref =
    hasReference && bookingId
      ? `/${locale}/booking/confirmed?bookingId=${encodeURIComponent(bookingId)}` +
        (email ? `&email=${encodeURIComponent(email)}` : "")
      : null;
  const coursesHref = `/${locale}/courses`;

  // Choose the primary CTA label/href based on the variant and whether
  // we have a booking reference.
  const primaryLabel = hasReference
    ? variant === "cancel"
      ? t("tryAgain")
      : t("viewBooking")
    : t("backToCourses");
  const primaryHref = referenceHref ?? coursesHref;

  return (
    <div className="flex flex-col gap-6">
      <StatusCard
        variant={variant === "success" ? "success" : "error"}
        eyebrow={t("eyebrow")}
        title={hasReference ? t("headline") : t("genericTitle")}
        message={hasReference ? t("intro") : t("genericIntro")}
        footer={
          <div
            className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
            data-testid={`${variant}-actions`}
          >
            <p className="text-xs text-muted-foreground">{t("footer")}</p>
            <Button asChild>
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
          </div>
        }
      />

      {hasReference && bookingId ? (
        <Card data-testid={`${variant}-reference`}>
          <CardHeader>
            <CardTitle className="text-lg">{t("referenceHeading")}</CardTitle>
            <CardDescription className="text-sm">
              {t("referenceDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("reference")}
                </dt>
                <dd className="font-mono text-sm text-foreground break-all">
                  {bookingId}
                </dd>
              </div>
              {sessionId && variant === "success" ? (
                <div className="space-y-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("sessionId")}
                  </dt>
                  <dd className="font-mono text-xs text-muted-foreground break-all">
                    {sessionId}
                  </dd>
                </div>
              ) : null}
            </dl>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
