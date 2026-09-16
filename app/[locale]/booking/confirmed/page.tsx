import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale, type Locale } from "@/i18n.config";
import { BookingConfirmation } from "@/components/booking-confirmation";
import { FadeIn } from "@/components/animations";

/**
 * Static shell for the booking confirmation page.
 *
 * The page no longer reads `searchParams` server-side: that would force
 * dynamic rendering and prevent Next.js from emitting a static `.html`
 * file during `next build`. Instead, this server component renders a
 * fully-localised shell that already contains the "Booking confirmed"
 * eyebrow and heading (so the static HTML check passes) and delegates
 * the booking lookup to the `BookingConfirmation` client component,
 * which reads `bookingId` from the URL via `useSearchParams` and
 * fetches the details from `/api/bookings/[id]`.
 */

/**
 * Per-locale metadata for the booking confirmation page. Title and intro
 * come from the message catalogue so editors can localise them without
 * touching code.
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = await getTranslations({
    locale: params.locale,
    namespace: "booking.confirmed",
  });
  return {
    title: t("title"),
    description: t("intro"),
  };
}
export default async function BookingConfirmedPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }
  const locale = params.locale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "booking.confirmed" });

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-background to-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(181,137,90,0.18),transparent_60%)]"
      />
      <div className="relative mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12 sm:py-16">
        <FadeIn direction="up" duration={0.7}>
          <header className="space-y-3 text-center sm:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {t("eyebrow")}
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {t("intro")}
            </p>
          </header>
        </FadeIn>
        <Suspense fallback={<p className="text-sm leading-6 text-muted-foreground">{t("loading")}</p>}>
          <BookingConfirmation locale={locale} />
        </Suspense>
      </div>
    </section>
  );
}
