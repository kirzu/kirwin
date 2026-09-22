"use client";

import { ArrowRight, ExternalLink, Mail, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n.config";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animations/animated-section";
import { FadeIn } from "@/components/animations/fade-in";
import { LineReveal, SectionEyebrow } from "@/components/animations";
import { CLINIKO_BOOKING_URL } from "@/lib/cliniko";

export interface BookingsViewProps {
  locale: Locale;
}

/**
 * Client-side view for the public Bookings page.
 *
 * The `/bookings` route now embeds the Cliniko scheduler directly so
 * visitors can pick a time without leaving the site. A fallback link
 * sits below the iframe for clients whose browser cannot render the
 * embed (very rare, but worth handling gracefully).
 */
export function BookingsView({ locale }: BookingsViewProps) {
  const t = useTranslations("bookings");

  return (
    <div className="text-foreground">
      {/* Hero */}
      <section
        aria-labelledby="bookings-hero-title"
        className="border-b border-border"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-14 text-center sm:py-20">
          <FadeIn direction="up" delay={0.1}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <Sparkles aria-hidden className="h-3.5 w-3.5" />
              Online scheduler
            </span>
          </FadeIn>

          <FadeIn direction="up" delay={0.15}>
            <h1
              id="bookings-hero-title"
              className="font-display text-3xl font-medium leading-snug tracking-tight sm:text-5xl md:text-6xl"
            >
              {t("title")}
            </h1>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("intro")}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Embedded Cliniko scheduler */}
      <section
        aria-labelledby="bookings-scheduler-title"
        className="bg-muted/30"
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-14 sm:py-20">
          <h2 id="bookings-scheduler-title" className="sr-only">
            {t("iframeTitle")}
          </h2>

          <FadeIn direction="up" duration={0.8}>
            <div className="luxe-card overflow-hidden rounded-2xl border border-border bg-background shadow-[0_18px_60px_-30px_rgba(63,42,22,0.35)]">
              <iframe
                title={t("iframeTitle")}
                src={CLINIKO_BOOKING_URL}
                loading="lazy"
                // The Cliniko scheduler is a fully responsive widget;
                // a tall viewport-height container keeps it comfortable
                // on both phones and laptops.
                className="block h-[70vh] min-h-[28rem] w-full rounded-2xl border-0 bg-background"
                data-testid="bookings-cliniko-iframe"
                allow="payment"
              />
            </div>
          </FadeIn>

          <AnimatedSection
            direction="up"
            distance={20}
            duration={0.7}
            delay={0.1}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <SectionEyebrow>{t("fallbackTitle")}</SectionEyebrow>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                {t("fallbackBody")}
              </p>
              <Button asChild variant="outline" className="min-h-11 rounded-sm">
                <a
                  href={CLINIKO_BOOKING_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-testid="bookings-cliniko-fallback"
                >
                  <ExternalLink aria-hidden className="mr-2 h-4 w-4" />
                  {t("fallbackCta")}
                  <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* After you book — a small sign-off */}
      <section aria-labelledby="bookings-after-title">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-14 text-center sm:py-20">
          <LineReveal className="-mb-4" />
          <FadeIn direction="up">
            <SectionEyebrow>{t("afterTitle")}</SectionEyebrow>
          </FadeIn>
          <FadeIn direction="up" delay={0.05}>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("afterBody")}
            </p>
          </FadeIn>
          <FadeIn direction="up" delay={0.1}>
            <Button asChild variant="outline" className="min-h-11 rounded-sm">
              <a href={`/${locale}/contact`}>
                <Mail aria-hidden className="mr-2 h-4 w-4" />
                {t("afterCta")}
                <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
