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
import { AnimatedHeroBackground } from "./animated-hero-background";

const trainingIcons = [Compass, Hand, Target, ClipboardCheck] as const;

export type HomeCoursePreview = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationLabel: string | null;
  priceLabel: string;
};

export type HomeFeaturedTestimonial = {
  name: string;
  quote: string;
  imageUrl: string | null;
};

export interface HomeViewProps {
  locale: Locale;
  trainingItems: Array<{ title: string; body: string }>;
  credentials: string[];
  featuredCourses: HomeCoursePreview[];
  featuredTestimonial?: HomeFeaturedTestimonial | null;
}

/**
 * Client-side view for the redesigned home page. Receives server-resolved
 * translations and a small set of pre-shaped data (training items,
 * credentials, course preview, and a featured testimonial) so the
 * animation primitives can run without crossing the server/client boundary.
 */
export function HomeView({
  locale,
  trainingItems,
  credentials,
  featuredCourses,
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

        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-24 pt-16 sm:pb-32 sm:pt-24">
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
              className="max-w-3xl font-display text-4xl font-medium leading-snug tracking-tight text-foreground sm:text-5xl md:text-6xl"
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

          <FadeIn direction="up" delay={0.35} duration={0.8}>
            <div className="flex flex-wrap gap-3 pt-2">
              <MagneticButton>
                <Button asChild size="lg" shimmer className="rounded-sm">
                  <a href={`/${locale}/courses`}>
                    {t("hero.primaryCta")}
                    <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-sm border-foreground/40 bg-transparent text-foreground hover:bg-foreground/10"
                >
                  <a href={`/${locale}/contact`}>{t("hero.secondaryCta")}</a>
                </Button>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* What we offer — 2x2 grid of training items */}
      <section aria-labelledby="home-offerings-title">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-14 sm:py-20">
          <FadeIn direction="up">
            <div className="max-w-3xl">
              <h2
                id="home-offerings-title"
                className="font-sans text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl"
              >
                {t("offerings.title")}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
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

      {/* Featured courses — preview grid with a single prominent CTA.
          Hidden entirely when there are no featured courses so the page
          does not show an empty band. */}
      {featuredCourses.length > 0 ? (
        <section aria-labelledby="home-courses-title">
          <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-14 sm:py-20">
            <FadeIn direction="up">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <h2
                    id="home-courses-title"
                    className="font-sans text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl"
                  >
                    {t("courses.title")}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                    {t("courses.previewBody")}
                  </p>
                </div>
                <Button asChild variant="outline" className="rounded-sm">
                  <a href={`/${locale}/courses`}>
                    {t("courses.viewAllCta")}
                    <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </FadeIn>

            <StaggerChildren
              className="grid gap-6 sm:grid-cols-2"
              stagger={0.12}
              y={36}
            >
              {featuredCourses.map((course) => (
                <StaggerItem key={course.id} className="h-full">
                  <TiltCard className="h-full" maxTiltX={5} maxTiltY={5}>
                    <article className="flex h-full flex-col border border-border bg-background">
                      <div className="flex flex-1 flex-col gap-4 p-6">
                        <h3 className="font-sans text-xl font-medium leading-snug text-foreground">
                          {course.title}
                        </h3>
                        {course.description ? (
                          <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
                            {course.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-end gap-4 border-t border-border px-6 py-4">
                        <Button asChild size="default" className="min-h-11 rounded-sm">
                          <a href={`/${locale}/courses/${course.slug}`}>
                            {t("courses.previewReserve")}
                            <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </article>
                  </TiltCard>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      ) : null}

      {/* About Stephen — portrait + bio + credentials */}
      <section aria-labelledby="home-about-title">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-14 sm:py-20 md:grid-cols-5 md:gap-16">
          <FadeIn direction="left" className="md:col-span-2">
            <ImageReveal
              direction="right"
              duration={900}
              className="overflow-hidden rounded-sm border border-border"
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
              <h2
                id="home-about-title"
                className="font-sans text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl"
              >
                {t("experience.title")}
              </h2>
              <p className="text-base leading-7 text-muted-foreground sm:text-lg">
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
                <Button asChild variant="link" className="h-auto px-0 text-base">
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
      <section
        aria-labelledby="home-testimonials-title"
        className="border-t border-border"
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-14 sm:py-20">
          <FadeIn direction="up">
            <div className="max-w-2xl">
              <h2
                id="home-testimonials-title"
                className="font-sans text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl"
              >
                {t("testimonials.title")}
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground sm:text-lg">
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
                <Quote
                  aria-hidden
                  className="h-5 w-5 text-primary"
                />
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
                  <Button asChild variant="link" className="h-auto px-0 text-base">
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

      {/* Closing CTA — two pathways: courses and contact */}
      <section
        aria-labelledby="home-cta-title"
        className="border-t border-border"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-16 text-center sm:py-20">
          <FadeIn direction="up" className="flex flex-col items-center gap-6">
            <h2
              id="home-cta-title"
              className="font-sans text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl"
            >
              {t("cta.title")}
            </h2>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("cta.body")}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <MagneticButton>
                <Button asChild size="lg" shimmer className="rounded-sm">
                  <a href={`/${locale}/courses`}>
                    {t("cta.primaryCta")}
                    <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button asChild size="lg" variant="outline" className="rounded-sm">
                  <a href={`/${locale}/contact`}>{t("cta.secondaryCta")}</a>
                </Button>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
