import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Layers,
  Users,
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
import { ParallaxImage } from "@/components/animations/parallax-image";
import { CLINIKO_BOOKING_URL } from "@/lib/cliniko";

const HERO_IMAGE = "/assets/course-hands-on.jpg";
const INSTRUCTOR_PORTRAIT = "/assets/stephen-portrait.jpg";

export type CourseDetailSyllabusItem = { title: string; body?: string };

export interface CourseDetailViewProps {
  locale: Locale;
  course: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    price: number;
    priceLabel: string;
    durationLabel: string | null;
    seats: number;
    imageUrl: string | null;
    syllabus: CourseDetailSyllabusItem[];
  };
}

/**
 * Client-side view for the redesigned Course detail page. Receives the
 * server-resolved course data and renders a parallax hero, the animated
 * curriculum (StaggerChildren), an instructor callout, and a booking
 * CTA band that links out to the external Cliniko booking page in a new
 * tab.
 */
export function CourseDetailView({
  locale,
  course,
}: CourseDetailViewProps) {
  const t = useTranslations("courseDetail");

  const heroImage = course.imageUrl ?? HERO_IMAGE;

  const instructorCredentials =
    (t.raw("instructorCredentials") as unknown as string[]) ?? [];
  const defaultSyllabus =
    (t.raw("syllabusDefault") as unknown as string[]) ?? [];
  const syllabus =
    course.syllabus.length > 0
      ? course.syllabus.map((item) => item.title)
      : defaultSyllabus;

  return (
    <div className="text-foreground">
      {/* Hero — parallax image + animated copy */}
      <section
        aria-labelledby="course-detail-title"
        className="relative isolate overflow-hidden border-b border-border"
      >
        <ParallaxImage
          src={heroImage}
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

        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-24 pt-16 sm:pb-32 sm:pt-24">
          <FadeIn duration={0.7}>
            <Button
              asChild
              variant="ghost"
              size="default"
              className="-ml-3 min-h-11 text-foreground/80 hover:bg-transparent hover:text-foreground"
            >
              <a href={`/${locale}/courses`}>
                <ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />
                {t("back")}
              </a>
            </Button>
          </FadeIn>

          <AnimatedSection
            direction="up"
            distance={48}
            duration={0.9}
            delay={0.1}
            className="flex flex-col gap-6"
          >
            <h1
              id="course-detail-title"
              className="max-w-4xl font-display text-4xl font-medium leading-snug tracking-tight sm:text-5xl md:text-6xl"
            >
              {course.title}
            </h1>
            <p
              aria-label={t("priceLabel")}
              className="max-w-3xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            >
              {course.priceLabel}
            </p>
          </AnimatedSection>

          <FadeIn direction="up" delay={0.35} duration={0.8}>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="rounded-sm"
              >
                <a
                  href={CLINIKO_BOOKING_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {t("heroCta")}
                  <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Booking CTA — links out to Cliniko */}
      <section
        aria-labelledby="course-detail-booking-title"
        className="border-b border-border"
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-14 sm:py-20">
          <FadeIn direction="up">
            <div className="flex flex-col gap-3">
              <h2
                id="course-detail-booking-title"
                className="font-sans text-2xl font-semibold leading-snug tracking-tight sm:text-3xl"
              >
                {t("ctaTitle")}
              </h2>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {t("ctaBody")}
              </p>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.05}>
            <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-7 text-muted-foreground">
                {t("ctaFineprint")}
              </p>
              <Button
                asChild
                size="lg"
                className="min-h-11 rounded-sm sm:min-w-[14rem]"
              >
                <a
                  href={CLINIKO_BOOKING_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {t("bookCta")}
                  <ExternalLink aria-hidden className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Description + at-a-glance + sidebar CTA */}
      <section
        aria-labelledby="course-detail-body-title"
        className="border-b border-border"
      >
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-14 sm:py-20 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-8">
            <h2 id="course-detail-body-title" className="sr-only">
              {course.title}
            </h2>

            <FadeIn direction="up">
              <div className="flex flex-col gap-4">
                <h3 className="font-sans text-2xl font-semibold leading-snug text-foreground">
                  {t("overviewTitle")}
                </h3>
                {course.description ? (
                  <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                    {course.description}
                  </p>
                ) : (
                  <p className="text-base leading-7 text-muted-foreground">
                    {t("overviewEmpty")}
                  </p>
                )}
              </div>
            </FadeIn>

            <FadeIn direction="up">
              <div className="flex flex-col gap-5">
                <h3 className="font-sans text-2xl font-semibold leading-snug text-foreground">
                  {t("atAGlanceTitle")}
                </h3>
                <dl className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-start gap-3 border-t border-border pt-4">
                    <Clock
                      aria-hidden="true"
                      className="mt-1 h-5 w-5 shrink-0 text-secondary"
                    />
                    <div className="flex flex-col">
                      <dt className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        {t("durationLabel")}
                      </dt>
                      <dd className="mt-1 text-base font-medium text-foreground">
                        {course.durationLabel ?? t("durationTba")}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border-t border-border pt-4">
                    <Users
                      aria-hidden="true"
                      className="mt-1 h-5 w-5 shrink-0 text-secondary"
                    />
                    <div className="flex flex-col">
                      <dt className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        {t("maxParticipantsLabel")}
                      </dt>
                      <dd className="mt-1 text-base font-medium text-foreground">
                        {t("maxParticipantsValue", { seats: course.seats })}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border-t border-border pt-4">
                    <Layers
                      aria-hidden
                      className="mt-1 h-5 w-5 shrink-0 text-primary"
                    />
                    <div className="flex flex-col">
                      <dt className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        {t("priceLabel")}
                      </dt>
                      <dd className="mt-1 text-base font-semibold text-foreground">
                        {course.priceLabel}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>
            </FadeIn>
          </div>

          {/* Booking sidebar */}
          <aside
            aria-labelledby="course-detail-cta-title"
            className="lg:sticky lg:top-8 lg:self-start"
          >
            <FadeIn direction="left">
              <div className="overflow-hidden rounded-sm border border-border">
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={heroImage}
                    alt={t("imageAlt")}
                    fill
                    sizes="(max-width: 1024px) 100vw, 30vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-3 p-5">
                  <h2
                    id="course-detail-cta-title"
                    className="font-sans text-lg font-medium text-foreground"
                  >
                    {t("ctaTitle")}
                  </h2>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {t("ctaBody")}
                  </p>
                  <Button
                    asChild
                    size="default"
                    className="mt-1 min-h-11 w-full rounded-sm"
                  >
                    <a
                      href={CLINIKO_BOOKING_URL}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {t("bookCta")}
                      <ExternalLink aria-hidden className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    {t("ctaFineprint")}
                  </p>
                </div>
              </div>
            </FadeIn>
          </aside>
        </div>
      </section>

      {/* Animated syllabus */}
      <section
        aria-labelledby="course-detail-syllabus-title"
        className="border-b border-border"
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-14 sm:py-20">
          <FadeIn direction="up">
            <div className="max-w-3xl">
              <h2
                id="course-detail-syllabus-title"
                className="font-sans text-2xl font-semibold leading-snug tracking-tight sm:text-3xl"
              >
                {t("syllabusTitle")}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {t("syllabusIntro")}
              </p>
            </div>
          </FadeIn>

          <StaggerChildren
            className="grid gap-4 sm:grid-cols-2"
            stagger={0.1}
            y={28}
            amount={0.1}
          >
            {syllabus.map((item, index) => (
              <StaggerItem key={`${course.id}-syllabus-${index}`} className="h-full">
                <div className="flex h-full items-start gap-4 border-t border-border pt-5">
                  <span
                    aria-hidden
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-border text-primary"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="font-sans text-base font-medium leading-snug text-foreground sm:text-lg">
                      {item}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Closing CTA */}
      <section aria-labelledby="course-detail-closing-cta-title" className="border-b border-border">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-16 text-center sm:py-20">
          <FadeIn direction="up" className="flex flex-col items-center gap-6">
            <h2
              id="course-detail-closing-cta-title"
              className="font-sans text-2xl font-semibold leading-snug tracking-tight sm:text-3xl"
            >
              {t("cta.title")}
            </h2>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("cta.body")}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg" className="rounded-sm">
                <a href={`/${locale}/contact`}>
                  {t("cta.primaryCta")}
                  <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Instructor callout */}
      <section
        aria-labelledby="course-detail-instructor-title"
        className="border-b border-border"
      >
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-14 sm:py-20 md:grid-cols-5 md:items-center">
          <FadeIn direction="left" className="md:col-span-2">
            <figure className="overflow-hidden rounded-sm border border-border">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={INSTRUCTOR_PORTRAIT}
                  alt={t("instructorName")}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="border-t border-border px-5 py-4 text-xs uppercase tracking-widest text-muted-foreground">
                {t("instructorName")}
              </figcaption>
            </figure>
          </FadeIn>

          <AnimatedSection
            direction="right"
            delay={0.1}
            className="md:col-span-3"
          >
            <div className="flex flex-col gap-6">
              <h2
                id="course-detail-instructor-title"
                className="font-sans text-2xl font-semibold leading-snug tracking-tight sm:text-3xl"
              >
                {t("instructorName")}
              </h2>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {t("instructorBody")}
              </p>

              <ul className="mt-2 grid gap-x-10 gap-y-3 border-t border-border pt-5 sm:grid-cols-2">
                {(instructorCredentials ?? []).map((line, idx) => {
                  const Icon =
                    idx === 0
                      ? GraduationCap
                      : idx === 1
                      ? GraduationCap
                      : BookOpen;
                  return (
                    <li
                      key={`${course.id}-instructor-cred-${idx}`}
                      className="flex items-start gap-3 text-sm leading-7"
                    >
                      <Icon
                        aria-hidden
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      />
                      <span>{line}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="pt-2">
                <Button asChild size="lg" className="rounded-sm">
                  <a href={`/${locale}/about`}>
                    {t("instructorCta")}
                    <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
