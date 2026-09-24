"use client";

import Image from "next/image";
import {
  ArrowRight,
  ClipboardCheck,
  Compass,
  Hand,
  Quote,
  Sparkles,
  Target,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n.config";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animations/animated-section";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/animations/stagger-children";
import { SplitText } from "@/components/animations/split-text";
import { MagneticButton } from "@/components/animations/magnetic-button";
import { TiltCard } from "@/components/animations/tilt-card";
import { ImageReveal } from "@/components/animations/image-reveal";
import { LineReveal, SectionEyebrow } from "@/components/animations";
import { MassageOptionsSection } from "@/components/massage-options-section";
import { PricingSection } from "@/components/pricing-section";
import { AnimatedHeroBackground } from "./animated-hero-background";

const trainingIcons = [Compass, Hand, Target, ClipboardCheck] as const;

export type HomeFeaturedTestimonial = {
  name: string;
  quote: string;
  imageUrl: string | null;
};

export interface HomeViewProps {
  locale: Locale;
  trainingItems: Array<{ title: string; body: string }>;
  credentials: string[];
  featuredTestimonial?: HomeFeaturedTestimonial | null;
}

/**
 * Client-side view for the redesigned home page. Receives server-resolved
 * translations and a small set of pre-shaped data (training items,
 * credentials, course preview, and a featured testimonial) so the
 * animation primitives can run without crossing the server/client boundary.
 *
 * The page leads with massage: a prominent booking card sits directly
 * under the hero, flanked by a quiet, visually demoted courses companion
 * card. Practitioner training is further demoted to a small
 * course-interest note near the bottom of the page.
 */
export function HomeView({
  locale,
  trainingItems,
  credentials,
  featuredTestimonial = null,
}: HomeViewProps) {
  const t = useTranslations("home");

  return (
    <div className="text-foreground">
      {/* Hero — drifting-blob background, headline, and dual CTAs */}
      <section
        aria-labelledby="home-hero-title"
        className="relative isolate overflow-hidden text-foreground"
      >
        <AnimatedHeroBackground />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-background/70 dark:bg-background/50"
        />

        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-16 pt-16 sm:pb-20 sm:pt-24">
          <FadeIn duration={0.7}>
            <Image
              src="/assets/logo.png"
              alt={t("hero.logoAlt")}
              width={112}
              height={112}
              priority
              className="h-20 w-20 rounded-sm opacity-90 sm:h-24 sm:w-24"
            />
          </FadeIn>

          <AnimatedSection
            direction="up"
            distance={48}
            duration={0.9}
            delay={0.1}
            className="flex flex-col gap-6"
          >
            <h1
              id="home-hero-title"
              className="max-w-3xl font-display text-3xl font-medium leading-snug tracking-tight text-foreground sm:text-5xl md:text-6xl"
            >
              <SplitText
                text={t("hero.title")}
                stagger={70}
                offset={24}
                duration={700}
              />
            </h1>
            <p className="max-w-2xl text-base leading-7 text-foreground/80 sm:text-lg">
              {t("hero.subtitle")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Booking card — the prominent action, with a quiet courses companion */}
      <section
        aria-labelledby="home-booking-title"
        className="border-b border-border"
      >
        <div className="mx-auto grid max-w-5xl gap-6 px-6 py-14 sm:py-20 md:grid-cols-2 md:gap-8">
          <FadeIn direction="up" className="h-full">
            <TiltCard
              maxTiltX={4}
              maxTiltY={4}
              className="h-full"
              innerClassName="h-full"
            >
              <article
                data-testid="home-choice-massage"
                className="luxe-card luxe-card--hover flex h-full flex-col items-center justify-center gap-6 rounded-2xl border border-border bg-background p-7 text-center sm:p-10"
              >
                <div className="flex flex-col items-center gap-3">
                  <SectionEyebrow>{t("booking.eyebrow")}</SectionEyebrow>
                  <h2
                    id="home-booking-title"
                    className="font-display text-2xl font-medium leading-snug tracking-tight text-foreground sm:text-3xl lg:text-4xl"
                  >
                    {t("booking.title")}
                  </h2>
                  <p className="max-w-xl text-base leading-7 text-muted-foreground">
                    {t("booking.body")}
                  </p>
                </div>
                <MagneticButton>
                  <Button
                    asChild
                    size="lg"
                    shimmer
                    className="min-h-11 rounded-sm"
                  >
                    <a
                      href={`/${locale}/bookings`}
                      data-testid="home-choice-massage-cta"
                    >
                      <Sparkles aria-hidden className="mr-2 h-4 w-4" />
                      {t("booking.cta")}
                      <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </MagneticButton>
              </article>
            </TiltCard>
          </FadeIn>

          <FadeIn direction="up" delay={0.15} className="h-full">
            <article
              data-testid="home-courses-card"
              className="flex h-full flex-col items-start justify-center gap-3 rounded-2xl border border-border/70 bg-muted/50 p-7 text-left sm:p-8"
            >
              <SectionEyebrow>{t("coursesNext.eyebrow")}</SectionEyebrow>
              <h3 className="font-display text-lg font-medium leading-snug tracking-tight text-foreground sm:text-xl">
                {t("coursesNext.heading")}
              </h3>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                {t("coursesNext.body")}
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-2 rounded-sm"
              >
                <a
                  href={`/${locale}/contact`}
                  data-testid="home-courses-card-cta"
                >
                  {t("coursesNext.cta")}
                  <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </article>
          </FadeIn>
        </div>
      </section>

      {/* Bodywork options — preview of the core therapeutic sessions offered at the Wan Chai studio. */}
      <MassageOptionsSection
        locale={locale}
        namespace="home"
        ariaLabelledById="home-massage-options-title"
        showCta={false}
      />

      {/* Session fees — a quiet pricing strip so visitors see fees without leaving the homepage. */}
      <PricingSection
        locale={locale}
        ariaLabelledById="home-pricing-title"
        testId="home-pricing"
      />

      {/* What we offer — short training summary */}
      <section aria-labelledby="home-offerings-title">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-20 sm:py-28 lg:py-32">
          <FadeIn direction="up">
            <div className="max-w-3xl">
              <SectionEyebrow className="mb-3">{t("offerings.eyebrow")}</SectionEyebrow>
              <h2
                id="home-offerings-title"
                className="font-display text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              >
                {t("offerings.title")}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {t("training.intro")}
              </p>
            </div>
          </FadeIn>

          <StaggerChildren
            className="grid gap-6 sm:grid-cols-2"
            stagger={0.1}
            y={28}
          >
            {trainingItems.map((item, index) => {
              const Icon = trainingIcons[index % trainingIcons.length];
              return (
                <StaggerItem key={item.title} className="h-full">
                  <div className="flex h-full items-start gap-4 border-t border-border pt-5">
                    <Icon
                      aria-hidden
                      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    />
                    <div className="flex flex-col gap-2">
                      <h3 className="font-sans text-lg font-medium leading-snug text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* About Stephen — portrait + bio + credentials */}
      <section aria-labelledby="home-about-title">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 sm:py-28 lg:py-32 md:grid-cols-5 md:gap-16">
          <FadeIn direction="left" className="md:col-span-2">
            <ImageReveal
              direction="right"
              duration={900}
              className="overflow-hidden rounded-tl-3xl rounded-br-3xl rounded-tr-lg rounded-bl-lg border border-border"
            >
              <figure>
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src="/assets/about-therapy.jpg"
                    alt={t("experience.imageAlt")}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    priority={false}
                    className="object-cover"
                  />
                </div>
              </figure>
            </ImageReveal>
          </FadeIn>

          <AnimatedSection
            direction="right"
            delay={0.1}
            className="md:col-span-3"
          >
            <div className="flex flex-col gap-6">
              <SectionEyebrow>{t("experience.eyebrow")}</SectionEyebrow>
              <h2
                id="home-about-title"
                className="font-display text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              >
                {t("experience.title")}
              </h2>
              <p className="mt-2 text-base leading-7 text-muted-foreground sm:text-lg">
                {t("experience.body")}
              </p>

              <ul className="mt-2 flex flex-col gap-3 border-t border-border pt-5">
                {credentials.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 text-sm leading-7"
                  >
                    <span
                      aria-hidden
                      className="mt-3 h-1 w-4 shrink-0 bg-primary"
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <div>
                <Button asChild variant="link" className="link-underline h-auto px-0 text-base">
                  <a href={`/${locale}/about`}>
                    {t("experience.cta")}
                    <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials teaser — one strong quote + link to full list */}
      <section aria-labelledby="home-testimonials-title">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-20 sm:py-28 lg:py-32">
          <LineReveal />
          <FadeIn direction="up">
            <div className="max-w-2xl">
              <SectionEyebrow className="mb-3">{t("testimonials.eyebrow")}</SectionEyebrow>
              <h2
                id="home-testimonials-title"
                className="font-display text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              >
                {t("testimonials.title")}
              </h2>
              <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
                {t("testimonials.intro")}
              </p>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <figure className="grid gap-8 border-t border-border pt-8 md:grid-cols-[auto_1fr] md:items-start">
              {featuredTestimonial?.imageUrl ? (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-border bg-muted">
                  <Image
                    src={featuredTestimonial.imageUrl}
                    alt={t("testimonials.imageAlt", {
                      name: featuredTestimonial.name,
                    })}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  aria-hidden
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-sm border border-border bg-muted"
                >
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="flex flex-col gap-4">
                <Quote aria-hidden className="h-5 w-5 text-primary" />
                <blockquote className="font-display text-xl leading-snug text-foreground sm:text-2xl">
                  {featuredTestimonial?.quote ??
                    t("testimonials.fallbackQuote")}
                </blockquote>
                <figcaption className="text-sm uppercase tracking-wide text-muted-foreground">
                  —{" "}
                  {featuredTestimonial?.name ??
                    t("testimonials.fallbackName")}
                </figcaption>
                <div className="pt-2">
                  <Button asChild variant="link" className="link-underline h-auto px-0 text-base">
                    <a href={`/${locale}/testimonials`}>
                      {t("testimonials.cta")}
                      <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </figure>
          </FadeIn>
        </div>
      </section>

      {/* Course interest — small print; training is a quiet secondary path */}
      <section aria-labelledby="home-course-interest-title">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 px-6 pb-2 text-center sm:pb-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("courseInterest.eyebrow")}
          </p>
          <h2 id="home-course-interest-title" className="sr-only">
            {t("courseInterest.heading")}
          </h2>
          <p className="text-xs leading-6 text-muted-foreground sm:text-sm">
            {t("courseInterest.body")}
          </p>
          <Button
            asChild
            variant="link"
            className="link-underline h-auto px-0 text-sm"
          >
            <a
              href={`/${locale}/contact`}
              data-testid="home-course-interest-cta"
            >
              {t("courseInterest.cta")}
              <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Closing CTA */}
      <section aria-labelledby="home-cta-title">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center sm:py-28 lg:py-32">
          <LineReveal />
          <FadeIn direction="up" className="mt-4 flex flex-col items-center gap-6">
            <h2
              id="home-cta-title"
              className="font-display text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            >
              {t("cta.title")}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("cta.body")}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <MagneticButton>
                <Button asChild size="lg" shimmer className="rounded-sm">
                  <a href={`/${locale}/bookings`}>
                    {t("cta.primaryCta")}
                    <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
