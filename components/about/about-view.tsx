"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Compass,
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
import { ParallaxImage } from "@/components/animations/parallax-image";
import { AnimatedStat } from "@/components/animations/count-up";
import { SplitText } from "@/components/animations/split-text";
import { ImageReveal } from "@/components/animations/image-reveal";
import { MagneticButton } from "@/components/animations/magnetic-button";

const milestoneIcons = [Compass, Target, Compass, Target] as const;

export type AboutMilestone = {
  year: string;
  title: string;
  body: string;
};

export type AboutFaq = { question: string; answer: string };

export interface AboutViewProps {
  locale: Locale;
  bioParagraphs: string[];
  credentials: string[];
  milestones: AboutMilestone[];
  faqs: AboutFaq[];
}

/**
 * Client-side view for the redesigned About page. Receives server-resolved
 * translations so the animation primitives can run without crossing the
 * server/client boundary. Includes a disclosure FAQ implemented with
 * lightweight state (no extra UI dependencies).
 */
export function AboutView({
  locale,
  bioParagraphs,
  credentials,
  milestones,
  faqs,
}: AboutViewProps) {
  const t = useTranslations("about");

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="text-foreground">
      {/* Hero — full-bleed parallax therapy image with overlay + animated copy */}
      <section
        aria-labelledby="about-hero-title"
        className="relative isolate overflow-hidden text-foreground"
      >
        <ParallaxImage
          src="/assets/about-therapy.jpg"
          alt=""
          aria-hidden
          priority
          speed={0.2}
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
              id="about-hero-title"
              className="max-w-3xl font-display text-4xl font-medium leading-snug tracking-tight sm:text-5xl md:text-6xl"
            >
              <SplitText
                text={t("title")}
                stagger={70}
                offset={24}
                duration={700}
              />
            </h1>
            <p className="max-w-2xl text-base leading-7 text-foreground/80 sm:text-lg">
              {t("intro")}
            </p>
          </AnimatedSection>

          <FadeIn direction="up" delay={0.35} duration={0.8}>
            <div className="flex flex-wrap gap-3 pt-2">
              <MagneticButton>
                <Button asChild size="lg" shimmer className="rounded-sm">
                  <a href={`/${locale}/courses`}>
                    {t("ctaPrimary")}
                    <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
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
                  <a href={`/${locale}/contact`}>{t("heroContactCta")}</a>
                </Button>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Biography — portrait + paragraphs + credentials */}
      <section
        aria-labelledby="about-bio-title"
        className="border-t border-border"
      >
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
                    src="/assets/therapy-session.jpg"
                    alt={t("imageAlt")}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    priority={false}
                    className="object-cover"
                  />
                </div>
                <figcaption className="border-t border-border px-5 py-4 text-xs uppercase tracking-widest text-muted-foreground">
                  {t("bioCaption")}
                </figcaption>
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
                id="about-bio-title"
                className="font-sans text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl"
              >
                Stephen Kirwin
              </h2>
              <div className="flex flex-col gap-5 text-base leading-7 text-muted-foreground sm:text-lg">
                {bioParagraphs.map((paragraph, index) => (
                  <p key={`about-bio-${index}`}>{paragraph}</p>
                ))}
              </div>

              <ul className="mt-2 grid gap-x-10 gap-y-3 border-t border-border pt-6 sm:grid-cols-2">
                {credentials.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 text-sm leading-7"
                  >
                    <span
                      aria-hidden
                      className="mt-3 h-1 w-4 shrink-0 bg-primary"
                    />
                    <AnimatedStat>{line}</AnimatedStat>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Modality approach + Wellness partners — flat two-column lists */}
      <section
        aria-labelledby="about-approach-title"
        className="border-t border-border"
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-14 sm:py-20 md:flex-row md:gap-16">
          <FadeIn direction="up" className="md:flex-1">
            <div className="flex flex-col gap-5">
              <h2
                id="about-approach-title"
                className="font-sans text-2xl font-semibold leading-snug tracking-tight sm:text-3xl"
              >
                {t("approachTitle")}
              </h2>
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                {t("approachBody")}
              </p>
              <ul className="mt-2 flex flex-col gap-2 border-t border-border pt-5">
                {(t.raw("modalities") as string[] | undefined)?.map(
                  (modality) => (
                    <li
                      key={modality}
                      className="flex items-start gap-3 text-sm leading-7"
                    >
                      <span
                        aria-hidden
                        className="mt-3 h-1 w-4 shrink-0 bg-secondary"
                      />
                      <span>{modality}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </FadeIn>

          <AnimatedSection
            direction="left"
            delay={0.1}
            className="md:flex-1"
          >
            <div className="flex flex-col gap-5">
              <h2 className="font-sans text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
                {t("partnersTitle")}
              </h2>
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                {t("partnersBody")}
              </p>
              <ul className="mt-2 flex flex-col gap-2 border-t border-border pt-5">
                {(t.raw("partners") as string[] | undefined)?.map((partner) => (
                  <li
                    key={partner}
                    className="flex items-start gap-3 text-sm leading-7"
                  >
                    <span
                      aria-hidden
                      className="mt-3 h-1 w-4 shrink-0 bg-primary"
                    />
                    <span>{partner}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Timeline / approach milestones — 2+2 asymmetric grid */}
      <section
        aria-labelledby="about-milestones-title"
        className="border-t border-border"
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-14 sm:py-20">
          <FadeIn direction="up">
            <div className="max-w-3xl">
              <h2
                id="about-milestones-title"
                className="font-sans text-2xl font-semibold leading-snug tracking-tight sm:text-3xl"
              >
                {t("milestonesTitle")}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {t("milestonesIntro")}
              </p>
            </div>
          </FadeIn>

          <StaggerChildren
            className="grid gap-6 md:grid-cols-2"
            stagger={0.12}
            y={32}
          >
            {milestones.map((milestone, index) => {
              const Icon = milestoneIcons[index % milestoneIcons.length];
              const isWide = index % 3 === 0;
              return (
                <StaggerItem
                  key={`${milestone.year}-${milestone.title}`}
                  className={`h-full ${isWide ? "md:col-span-2" : ""}`}
                >
                  <article className="flex h-full items-start gap-4 border-t border-border pt-5">
                    <Icon
                      aria-hidden
                      className="mt-0.5 h-5 w-5 shrink-0 text-secondary"
                    />
                    <div className="flex flex-col gap-2">
                      <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-secondary">
                        <Calendar aria-hidden className="h-3.5 w-3.5" />
                        {milestone.year}
                      </p>
                      <h3 className="font-sans text-xl font-medium leading-snug text-foreground">
                        {milestone.title}
                      </h3>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {milestone.body}
                      </p>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* FAQ */}
      <section
        aria-labelledby="about-faq-title"
        className="border-t border-border"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-14 sm:py-20">
          <FadeIn direction="up">
            <div className="max-w-3xl">
              <h2
                id="about-faq-title"
                className="font-sans text-2xl font-semibold leading-snug tracking-tight sm:text-3xl"
              >
                {t("faqTitle")}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {t("faqIntro")}
              </p>
            </div>
          </FadeIn>

          <StaggerChildren className="flex flex-col gap-3" stagger={0.08} y={20}>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <StaggerItem key={`faq-${index}`}>
                  <FaqItem
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={isOpen}
                    onToggle={() => setOpenFaq(isOpen ? null : index)}
                  />
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* Closing CTA */}
      <section aria-labelledby="about-cta-title" className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-14 sm:py-20">
          <FadeIn direction="up" className="flex flex-col gap-6">
            <h2
              id="about-cta-title"
              className="max-w-3xl font-sans text-2xl font-semibold leading-snug tracking-tight sm:text-3xl"
            >
              {t("ctaTitle")}
            </h2>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("ctaBody")}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <MagneticButton>
                <Button asChild size="lg" shimmer className="rounded-sm">
                  <a href={`/${locale}/courses`}>
                    {t("ctaPrimary")}
                    <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button asChild size="lg" variant="outline" className="rounded-sm">
                  <a href={`/${locale}/contact`}>{t("heroContactCta")}</a>
                </Button>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Lightweight disclosure that animates open/closed state via Tailwind's
 * grid-rows transition utility — no extra UI dependency required.
 */
function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: FaqItemProps) {
  return (
    <div className="overflow-hidden rounded-sm border border-border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-6 px-5 py-4 text-left transition-colors hover:bg-muted/40"
      >
        <span className="font-sans text-lg font-medium leading-snug sm:text-xl">
          {question}
        </span>
        <ChevronDown
          aria-hidden
          className={`h-5 w-5 shrink-0 text-primary transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid overflow-hidden border-t border-border transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="px-5 py-4 text-sm leading-7 text-muted-foreground sm:text-base">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
