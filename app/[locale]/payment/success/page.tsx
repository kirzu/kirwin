import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale, type Locale } from "@/i18n.config";
import { PaymentStatus } from "@/components/payment-status";
import { FadeIn } from "@/components/animations";

/**
 * Per-locale metadata for the payment success page. Title and intro come
 * from the message catalogue so editors can localise them without
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
    namespace: "booking.payment.success",
  });
  return {
    title: t("title"),
    description: t("intro"),
  };
}

/**
 * Static shell for the post-checkout "success" landing page.
 *
 * Stripe redirects the user here with `?bookingId=...&email=...`
 * (and optionally `?session_id=...`) after a successful checkout
 * session. We render a fully-localised shell with the eyebrow,
 * title and intro pre-rendered so `next build` emits a static
 * `.html` file. The headline / reference / actions block (which
 * depends on the query parameters) is delegated to the
 * `PaymentStatus` client component, wrapped in Suspense so it can
 * read the URL via `useSearchParams`.
 */
export default async function PaymentSuccessPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }
  const locale = params.locale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "booking.payment.success" });

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sage-50 via-background to-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[120%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(83,121,83,0.18),transparent_60%)]"
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
        <Suspense
          fallback={
            <p className="text-sm leading-6 text-muted-foreground">
              {t("referenceDescription")}
            </p>
          }
        >
          <PaymentStatus locale={locale} variant="success" />
        </Suspense>
      </div>
    </section>
  );
}
