"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Clock,
  Layers,
  Search,
  Users,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedSection } from "@/components/animations/animated-section";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/animations/stagger-children";
import { ParallaxImage } from "@/components/animations/parallax-image";
import {
  SplitText,
  MagneticButton,
  TiltCard,
} from "@/components/animations";
import { LineReveal, SectionEyebrow } from "@/components/animations";
import { CLINIKO_BOOKING_URL } from "@/lib/cliniko";

const HERO_IMAGE = "/assets/course-hands-on.jpg";
const FALLBACK_THUMB = "/assets/stephen-working.jpg";
const MAP_EMBED_SRC =
  "https://maps.google.com/maps?q=218+Jaffe+Road,+Suite+602,+Wan+Chai,+Hong+Kong&t=&z=15&ie=UTF8&iwloc=&output=embed";

export type CourseFilter = "all" | "halfDay" | "fullDay" | "multiDay";

const filterOrder: CourseFilter[] = ["all", "halfDay", "fullDay", "multiDay"];

export type CourseListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  priceLabel: string;
  durationLabel: string | null;
  seats: number;
  imageUrl: string | null;
};

export interface CoursesViewProps {
  locale: Locale;
  courses: CourseListItem[];
  hasCourses: boolean;
}

/**
 * Client-side view for the upcoming-seminars listing page. Receives the
 * server-resolved course list and renders a hero, a location band, the
 * CMS-managed upcoming-sessions grid (with search + filters), and a
 * closing CTA.
 */
export function CoursesView({ locale, courses, hasCourses }: CoursesViewProps) {
  const t = useTranslations("courses");

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CourseFilter>("all");

  const matchesFilter = (
    course: CourseListItem,
    activeFilter: CourseFilter
  ): boolean => {
    if (activeFilter === "all") return true;
    const minutes = courseToMinutes(course);
    if (minutes == null) return false;
    switch (activeFilter) {
      case "halfDay":
        return minutes < 240;
      case "fullDay":
        return minutes >= 240 && minutes <= 480;
      case "multiDay":
        return minutes > 480;
      default:
        return true;
    }
  };

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return courses.filter((course) => {
      if (!matchesFilter(course, filter)) return false;
      if (!normalized) return true;
      return (
        course.title.toLowerCase().includes(normalized) ||
        (course.description?.toLowerCase().includes(normalized) ?? false)
      );
    });
  }, [courses, filter, query]);

  const isFiltered = hasCourses && filteredCourses.length === 0;
  const noPublished = !hasCourses;

  return (
    <div className="text-foreground">
      {/* Hero — parallax image + lighter gradient overlay */}
      <section
        aria-labelledby="courses-hero-title"
        className="relative isolate overflow-hidden text-foreground"
      >
        <ParallaxImage
          src={HERO_IMAGE}
          alt=""
          aria-hidden
          priority
          speed={0.18}
          containerClassName="absolute inset-0 -z-10 h-full w-full"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-background/70 dark:bg-background/50"
        />

        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 pb-24 pt-16 sm:pb-32 sm:pt-24">
          <AnimatedSection
            direction="up"
            distance={48}
            duration={0.9}
            delay={0.1}
            className="flex flex-col gap-6"
          >
            <h1
              id="courses-hero-title"
              className="max-w-3xl font-display text-4xl font-medium leading-snug tracking-tight sm:text-5xl md:text-6xl"
            >
              {t("title")}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-foreground/80 sm:text-lg">
              {t("subtitle")}
            </p>
          </AnimatedSection>

          <FadeIn direction="up" delay={0.35} duration={0.8}>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="rounded-sm">
                <a href={`/${locale}/contact`}>
                  {t("heroSecondaryCta")}
                  <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Location band — embedded Google Map iframe */}
      <section
        aria-labelledby="courses-location-title"
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-20 sm:py-28 lg:py-32">
          <LineReveal className="-mb-6" />
          <FadeIn direction="up" className="flex flex-col items-center gap-4 text-center">
            <SectionEyebrow className="mb-1">{t("locationEyebrow")}</SectionEyebrow>
            <h2
              id="courses-location-title"
              className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-5xl"
            >
              {t("locationTitle")}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("locationAddress")}
            </p>
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {t("locationHours")}
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.05}>
            <iframe
              src={MAP_EMBED_SRC}
              className="h-80 w-full border-0"
              loading="lazy"
              title={t("mapTitle")}
            />
          </FadeIn>
        </div>
      </section>

      {/* Search + filters + listing (CMS courses) */}
      <section
        aria-labelledby="courses-listing-title"
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-20 sm:py-28 lg:py-32">
          <LineReveal className="-mb-6" />
          <FadeIn direction="up">
            <div className="flex flex-col gap-3">
              <SectionEyebrow className="mb-1">{t("listingEyebrow")}</SectionEyebrow>
              <h2
                id="courses-listing-title"
                className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-5xl"
              >
                {t("upcomingTitle")}
              </h2>
            </div>
          </FadeIn>

          <FadeIn direction="up">
            <div className="flex flex-col gap-5">
              <div className="relative w-full max-w-md">
                <label htmlFor="courses-search" className="sr-only">
                  {t("searchLabel")}
                </label>
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="courses-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="h-12 rounded-sm border-border bg-background pl-11 pr-11 text-base focus-visible:ring-primary"
                />
                {query.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label={t("clearFilters")}
                    className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-sm bg-muted text-muted-foreground transition-colors hover:bg-muted/70"
                  >
                    <X aria-hidden className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div
                role="tablist"
                aria-label={t("searchLabel")}
                className="flex flex-wrap items-center gap-2"
              >
                {filterOrder.map((value) => {
                  const isActive = filter === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setFilter(value)}
                      className={`min-h-11 rounded-sm border px-4 py-3 text-xs font-medium uppercase tracking-widest transition-colors sm:text-sm ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      }`}
                    >
                      {t(`filters.${value}`)}
                    </button>
                  );
                })}
              </div>

              {hasCourses ? (
                <p
                  aria-live="polite"
                  className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
                >
                  {t("resultsCount", { count: filteredCourses.length })}
                </p>
              ) : null}
            </div>
          </FadeIn>

          {noPublished ? (
            <FadeIn direction="up" delay={0.05}>
              <div className="border-t border-border pt-5">
                <p className="text-base leading-7 text-muted-foreground">
                  {t("empty")}
                </p>
              </div>
            </FadeIn>
          ) : isFiltered ? (
            <FadeIn direction="up" delay={0.05}>
              <div className="flex flex-col gap-3 border-t border-border pt-5">
                <h3 className="font-sans text-lg font-medium text-foreground">
                  {t("emptyTitle")}
                </h3>
                <p className="text-sm leading-7 text-muted-foreground">
                  {t("emptyBody")}
                </p>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-sm"
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                    }}
                  >
                    {t("clearFilters")}
                    <X aria-hidden className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </FadeIn>
          ) : (
            <StaggerChildren
              className="grid gap-6 sm:grid-cols-2"
              stagger={0.1}
              y={32}
              amount={0.1}
            >
              {filteredCourses.map((course) => (
                <StaggerItem key={course.id} className="h-full">
                  <TiltCard className="h-full" maxTiltX={4} maxTiltY={4}>
                    <CourseCardItem
                      course={course}
                      locale={locale}
                      titleSlot={t("viewDetails")}
                      bookCtaLabel={t("bookCta")}
                      priceLabel={t("priceLabel")}
                      durationLabel={t("durationLabel")}
                      seatsLabel={t("maxParticipantsValue", { seats: course.seats })}
                      seatsSrLabel={t("maxParticipantsLabel")}
                      emptyDurationLabel={t("durationTba")}
                    />
                  </TiltCard>
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section aria-labelledby="courses-cta-title">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center sm:py-28 lg:py-32">
          <LineReveal className="-mb-6" />
          <FadeIn direction="up" className="flex flex-col items-center gap-6">
            <h2
              id="courses-cta-title"
              className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-5xl"
            >
              <SplitText
                text={t("ctaTitle")}
                stagger={50}
                offset={20}
                duration={650}
              />
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("ctaBody")}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <MagneticButton>
                <Button asChild size="lg" shimmer className="rounded-sm">
                  <a href={`/${locale}/contact`}>
                    {t("ctaPrimary")}
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

interface CourseCardItemProps {
  course: CourseListItem;
  locale: Locale;
  titleSlot: string;
  bookCtaLabel: string;
  priceLabel: string;
  durationLabel: string;
  seatsLabel: string;
  seatsSrLabel: string;
  emptyDurationLabel: string;
}

/**
 * Two-column "split row" course card. Duration and price sit on a single
 * line; the price chip on the image and the duplicate price in the
 * footer have both been removed.
 */
function CourseCardItem({
  course,
  locale,
  titleSlot,
  bookCtaLabel,
  priceLabel,
  durationLabel,
  seatsLabel,
  seatsSrLabel,
  emptyDurationLabel,
}: CourseCardItemProps) {
  const thumb = course.imageUrl ?? FALLBACK_THUMB;
  return (
    <article className="luxe-card luxe-card--hover group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition-[box-shadow,transform] duration-300 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:focus-within:-translate-y-0.5">
      <div className="grid h-full grid-rows-1 sm:grid-cols-[120px_1fr] md:grid-cols-[160px_1fr]">
        <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-auto sm:h-full">
          <Image
            src={thumb}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, 160px"
            className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04]"
          />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="font-sans text-lg font-medium leading-snug text-foreground">
            {course.title}
          </h3>
          {course.description ? (
            <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">
              {course.description}
            </p>
          ) : null}
          <dl className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock
                aria-hidden
                className="h-4 w-4 shrink-0 text-secondary"
              />
              <dt className="sr-only">{durationLabel}</dt>
              <dd>{course.durationLabel ?? emptyDurationLabel}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Users
                aria-hidden
                className="h-4 w-4 shrink-0 text-secondary"
              />
              <dt className="sr-only">{seatsSrLabel}</dt>
              <dd>{seatsLabel}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Layers
                aria-hidden
                className="h-4 w-4 shrink-0 text-primary"
              />
              <dt className="sr-only">{priceLabel}</dt>
              <dd className="font-semibold text-foreground">
                {course.priceLabel}
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="default" className="min-h-11 rounded-sm">
              <a href={`/${locale}/courses/${course.slug}`}>
                {titleSlot}
                <ArrowRight aria-hidden className="ml-2 h-3.5 w-3.5" />
              </a>
            </Button>
            <Button
              asChild
              size="default"
              variant="outline"
              className="min-h-11 rounded-sm"
            >
              <a
                href={CLINIKO_BOOKING_URL}
                target="_blank"
                rel="noreferrer noopener"
              >
                {bookCtaLabel}
                <ArrowRight aria-hidden className="ml-2 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Derive a numeric minutes value from a course's already-formatted
 * duration label. Falls back to null when the label is missing so the
 * filter logic can skip it instead of guessing.
 */
function courseToMinutes(course: CourseListItem): number | null {
  const label = course.durationLabel;
  if (!label) return null;
  const match = label.match(/([\d.]+)\s*hr/);
  if (!match) return null;
  const hours = Number(match[1]);
  if (!Number.isFinite(hours)) return null;
  return Math.round(hours * 60);
}
