"use client";

import { ArrowRight, CalendarCheck, Mail, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n.config";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animations/animated-section";
import { FadeIn } from "@/components/animations/fade-in";
import { SplitText, MagneticButton } from "@/components/animations";
import { CLINIKO_BOOKING_URL } from "@/lib/cliniko";

export interface BookingsViewProps {
  locale: Locale;
}

/**
 * Client-side view for the public Bookings page. All scheduling happens
 * in Cliniko, so this page is intentionally light: a soft hero, a
 * Cliniko CTA, and a secondary section pointing visitors toward
 * seminars or direct contact if they have questions first.
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
              Cliniko scheduler
            </span>
          </FadeIn>

          <FadeIn direction="up" delay={0.15}>
            <h1
              id="bookings-hero-title"
              className="font-display text-4xl font-medium leading-snug tracking-tight sm:text-5xl md:text-6xl"
            >
              <SplitText text={t("title")} stagger={50} offset={20} duration={650} />
            </h1>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("subtitle")}
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.25}>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {t("intro")}
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.3} duration={0.8}>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <MagneticButton>
                <Button asChild size="lg" shimmer className="rounded-sm">
                  <a
                    href={CLINIKO_BOOKING_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-testid="bookings-cliniko-cta"
                  >
                    <CalendarCheck aria-hidden className="mr-2 h-4 w-4" />
                    {t("cta")}
                    <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Secondary section — seminars or contact */}
      <section aria-labelledby="bookings-next-title" className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
          <h2 id="bookings-next-title" className="sr-only">
            {t("title")}
          </h2>

          <AnimatedSection
            direction="up"
            distance={28}
            duration={0.8}
            delay={0.1}
            className="grid gap-6 sm:grid-cols-2"
          >
            <article className="flex h-full flex-col gap-4 border-t border-border pt-6">
              <h3 className="font-sans text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                {t("coursesTitle")}
              </h3>
              <p className="text-base leading-7 text-muted-foreground">
                {t("coursesBody")}
              </p>
              <div className="pt-2">
                <Button asChild variant="outline" className="rounded-sm">
                  <a href={`/${locale}/courses`}>
                    {t("coursesCta")}
                    <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </article>

            <article className="flex h-full flex-col gap-4 border-t border-border pt-6">
              <h3 className="font-sans text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                {t("contactTitle")}
              </h3>
              <p className="text-base leading-7 text-muted-foreground">
                {t("contactBody")}
              </p>
              <div className="pt-2">
                <Button asChild variant="outline" className="rounded-sm">
                  <a href={`/${locale}/contact`}>
                    <Mail aria-hidden className="mr-2 h-4 w-4" />
                    {t("contactCta")}
                    <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </article>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}

export default BookingsView;
