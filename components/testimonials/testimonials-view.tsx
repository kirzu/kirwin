"use client";

import * as React from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { Locale } from "@/i18n.config";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/animations/stagger-children";
import { useReducedMotion } from "@/components/animations/use-reduced-motion";

const CAROUSEL_AUTOPLAY_MS = 6000;
/** Minimum horizontal swipe distance (px) that triggers a slide change. */
const SWIPE_THRESHOLD = 40;


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
 * hero, a staggered 1/2-col grid of quote cards on desktop, and a
 * horizontal swipeable carousel (with prev/next arrows + auto-rotation)
 * on small screens. Falls back to the empty state when no testimonials
 * have been published.
 */
export function TestimonialsView({
  locale,
  testimonials,
}: TestimonialsViewProps) {
  const t = useTranslations("testimonials");
  const [activeVideoId, setActiveVideoId] = React.useState<string | null>(null);

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
            <TestimonialsGrid
              testimonials={testimonials}
              onPlay={(id) => setActiveVideoId(id)}
            />
          )}
        </div>
      </section>

      <Dialog
        open={activeVideoId !== null}
        onOpenChange={(open) => !open && setActiveVideoId(null)}
      >
        <DialogContent className="max-w-4xl border-none bg-black p-0 shadow-2xl">
          <DialogTitle className="sr-only">
            {t("videoDialogTitle")}
          </DialogTitle>
          {activeVideoId && (
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                title={t("videoDialogTitle")}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="h-full w-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

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
  onPlay: () => void;
}

/**
 * Layout switcher: renders the staggered 2-column grid on `md+` and a
 * horizontal swipeable carousel on small screens. Both share the same
 * `TestimonialCard` so the visual design stays consistent across
 * breakpoints.
 *
 * Carousel behaviour:
 *  - Auto-advances every {@link CAROUSEL_AUTOPLAY_MS} ms.
 *  - Pauses on hover and resumes on leave.
 *  - Auto-rotate is skipped entirely when the user prefers reduced
 *    motion — visitors who turn off animation still get manual arrow
 *    controls and swipe gestures.
 *  - Swipe gestures handled via `onPointerDown`/`onPointerMove`/
 *    `onPointerUp` so they work with both touch and mouse drags.
 */
function TestimonialsGrid({
  testimonials,
  onPlay,
}: {
  testimonials: TestimonialListItem[];
  onPlay: (youtubeId: string | null) => void;
}) {
  const t = useTranslations("testimonials");
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  const goTo = React.useCallback(
    (next: number) => {
      const len = testimonials.length;
      if (len === 0) return;
      setActiveIndex(((next % len) + len) % len);
    },
    [testimonials.length],
  );

  const advance = React.useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  // Auto-rotate. Skipped when reduced motion is preferred or when the
  // pointer is over the carousel.
  React.useEffect(() => {
    if (reducedMotion) return;
    if (isPaused) return;
    if (testimonials.length < 2) return;
    const id = window.setInterval(advance, CAROUSEL_AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [advance, isPaused, reducedMotion, testimonials.length]);

  // Swipe gesture plumbing.
  const pointerStartX = React.useRef<number | null>(null);
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = event.clientX;
  };
  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current == null) return;
    const delta = event.clientX - pointerStartX.current;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      goTo(activeIndex + (delta < 0 ? 1 : -1));
    }
    pointerStartX.current = null;
  };
  const handlePointerCancel = () => {
    pointerStartX.current = null;
  };

  return (
    <>
      {/* Desktop / tablet grid — uses the existing staggered reveal. */}
      <StaggerChildren
        className="hidden gap-8 md:grid md:grid-cols-2"
        stagger={0.12}
        y={32}
      >
        {testimonials.map((testimonial) => (
          <StaggerItem key={testimonial.id} className="h-full">
            <TestimonialCard
              testimonial={testimonial}
              onPlay={() =>
                onPlay(extractYouTubeId(testimonial.youtubeUrl))
              }
            />
          </StaggerItem>
        ))}
      </StaggerChildren>

      {/* Mobile carousel — single card at a time with prev/next + swipe. */}
      {testimonials.length > 0 ? (
        <div
          className="md:hidden"
          aria-roledescription="carousel"
          aria-label={t("title")}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
        >
          <div
            className="relative overflow-hidden"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onPointerLeave={handlePointerCancel}
          >
            <div
              className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{
                transform: `translateX(-${activeIndex * 100}%)`,
                willChange: "transform",
              }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full shrink-0 px-1"
                  aria-roledescription="slide"
                  aria-label={`${activeIndex + 1} / ${testimonials.length}`}
                >
                  <TestimonialCard
                    testimonial={testimonial}
                    onPlay={() =>
                      onPlay(extractYouTubeId(testimonial.youtubeUrl))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => goTo(activeIndex - 1)}
              aria-label={t("previous")}
              disabled={testimonials.length < 2}
              className="min-h-11 min-w-11 rounded-sm"
            >
              <ChevronLeft aria-hidden className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2" aria-hidden>
              {testimonials.map((testimonial, idx) => (
                <button
                  key={testimonial.id}
                  type="button"
                  onClick={() => goTo(idx)}
                  aria-label={`${idx + 1} / ${testimonials.length}`}
                  aria-current={idx === activeIndex ? "true" : undefined}
                  className={`h-2.5 w-2.5 rounded-full transition-colors duration-200 ${
                    idx === activeIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                />
              ))}
            </div>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => goTo(activeIndex + 1)}
              aria-label={t("next")}
              disabled={testimonials.length < 2}
              className="min-h-11 min-w-11 rounded-sm"
            >
              <ChevronRight aria-hidden className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

/**
 * Single testimonial card: 5-star rating, large pull quote, author
 * name, and (when available) a clickable video thumbnail that opens the
 * YouTube video in a clean modal player.
 */
function TestimonialCard({ testimonial, onPlay }: TestimonialCardProps) {
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
        <button
          type="button"
          onClick={onPlay}
          className="group relative aspect-video w-full overflow-hidden rounded-sm border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={t("playVideo", { name: testimonial.title })}
        >
          {testimonial.imageUrl ? (
            <Image
              src={testimonial.imageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20" />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-transform motion-safe:group-hover:scale-110">
              <Play className="ml-1 h-6 w-6 fill-current" aria-hidden />
            </span>
          </span>
        </button>
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
