"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n.config";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/animations/stagger-children";

export type TestimonialListItem = {
  id: string;
  slug: string;
  title: string;
  content: string;
  rating: number | null;
  youtubeUrl: string | null;
  imageUrl: string | null;
};

export interface TestimonialsViewProps {
  locale: Locale;
  testimonials: TestimonialListItem[];
}

/**
 * Client-side view for the public testimonials page. Renders a soft
 * hero, a staggered 1/2-col grid of quote cards, and an empty state
 * when no testimonials have been published.
 */
export function TestimonialsView({
  locale,
  testimonials,
}: TestimonialsViewProps) {
  const t = useTranslations("testimonials");

  return (
    <div className="text-foreground">
      {/* Hero — plain editorial intro on the shared background */}
      <section
        aria-labelledby="testimonials-hero-title"
        className="border-b border-border"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-14 text-center sm:py-20">
          <FadeIn direction="up" delay={0.1}>
            <h1
              id="testimonials-hero-title"
              className="font-display text-4xl font-medium leading-snug tracking-tight sm:text-5xl md:text-6xl"
            >
              {t("title")}
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.2}>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("subtitle")}
            </p>
          </FadeIn>
          <FadeIn direction="up" delay={0.3} duration={0.8}>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg" className="rounded-sm">
                <a href={`/${locale}/courses`}>
                  {t("heroCta")}
                  <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials grid */}
      <section aria-labelledby="testimonials-list-title">
        <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
          <h2 id="testimonials-list-title" className="sr-only">
            {t("title")}
          </h2>

          {testimonials.length === 0 ? (
            <FadeIn direction="up">
              <p className="mx-auto max-w-md text-center text-base leading-7 text-muted-foreground">
                {t("empty")}
              </p>
            </FadeIn>
          ) : (
            <StaggerChildren
              className="grid gap-8 sm:grid-cols-2"
              stagger={0.12}
              y={32}
            >
              {testimonials.map((testimonial) => (
                <StaggerItem key={testimonial.id} className="h-full">
                  <TestimonialCard testimonial={testimonial} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section
        aria-labelledby="testimonials-cta-title"
        className="border-t border-border"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-16 text-center sm:py-20">
          <FadeIn direction="up" className="flex flex-col items-center gap-6">
            <h2
              id="testimonials-cta-title"
              className="font-sans text-2xl font-semibold leading-snug tracking-tight sm:text-3xl"
            >
              {t("cta.title")}
            </h2>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("cta.body")}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg" className="rounded-sm">
                <a href={`/${locale}/courses`}>
                  {t("cta.primaryCta")}
                  <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

interface TestimonialCardProps {
  testimonial: TestimonialListItem;
}

/**
 * Single testimonial card: 5-star rating, large pull quote, author
 * name, and (when available) an embedded YouTube video so visitors can
 * hear the story directly from the client.
 */
function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const t = useTranslations("testimonials");

  const rating = Math.max(0, Math.min(5, testimonial.rating ?? 5));
  const youtubeId = extractYouTubeId(testimonial.youtubeUrl);

  return (
    <article className="flex h-full flex-col gap-6 border-t border-border pt-6">
      <div className="flex items-center gap-1 text-primary">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} filled={i < rating} />
        ))}
        <span className="sr-only">{t("ratingLabel")}</span>
      </div>

      <p className="font-display text-lg leading-snug tracking-tight text-foreground sm:text-xl">
        {testimonial.content}
      </p>

      <p className="mt-auto text-sm font-medium text-foreground">
        {testimonial.title}
      </p>

      {youtubeId ? (
        <div className="aspect-video overflow-hidden rounded-sm border border-border">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title={`YouTube video for ${testimonial.title}`}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full"
          />
        </div>
      ) : null}
    </article>
  );
}

/**
 * Pull a YouTube video id out of a watch URL (`?v=ID`, also tolerating
 * extra query params) or a short share URL (`youtu.be/ID`). Returns
 * `null` when no recognisable id can be extracted.
 */
function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.replace(/^\/+/, "").split("/")[0];
      return id || null;
    }
    if (
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "youtube.com" ||
      parsed.hostname === "m.youtube.com"
    ) {
      const id = parsed.searchParams.get("v");
      if (id) return id;
      const segments = parsed.pathname.split("/").filter(Boolean);
      const embedIndex = segments.findIndex((s) => s === "embed" || s === "shorts" || s === "live");
      if (embedIndex >= 0 && segments[embedIndex + 1]) {
        return segments[embedIndex + 1];
      }
    }
  } catch {
    return null;
  }
  return null;
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78L1.58 7.62l5.82-.85L10 1.5z"
      />
    </svg>
  );
}

export default TestimonialsView;
