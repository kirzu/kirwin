"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n.config";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animations/animated-section";
import { FadeIn } from "@/components/animations/fade-in";
import { ParallaxImage } from "@/components/animations/parallax-image";
import {
  SplitText,
  MagneticButton,
  ImageReveal,
} from "@/components/animations";
import ContactForm from "@/app/[locale]/contact/contact-form";
import { CLINIKO_BOOKING_URL } from "@/lib/cliniko";

const INSTAGRAM_URL = "https://www.instagram.com/stephenkirwinbodyworks/";

const MAP_EMBED_SRC =
  "https://maps.google.com/maps?q=218+Jaffe+Road,+Suite+602,+Wan+Chai,+Hong+Kong&t=&z=15&ie=UTF8&iwloc=&output=embed";

export interface ContactViewProps {
  locale: Locale;
  phoneHref: string;
  emailHref: string;
  mapHref: string;
}

/**
 * Client-side view for the redesigned Contact page. Renders a smaller
 * hero, an inline list of contact details, a Google Maps iframe, and
 * the contact form.
 */
export function ContactView({ locale, phoneHref, emailHref, mapHref }: ContactViewProps) {
  const t = useTranslations("contact");

  const details = [
    { label: t("phoneLabel"), value: t("phoneValue"), href: phoneHref },
    { label: t("emailLabel"), value: t("emailValue"), href: emailHref },
    { label: t("locationLabel"), value: t("locationValue") },
    { label: t("hoursLabel"), value: t("hours") },
    {
      label: t("instagramLabel"),
      value: t("instagramHandle"),
      href: INSTAGRAM_URL,
      external: true,
    },
  ];

  return (
    <div className="text-foreground">
      {/* Hero — smaller, lighter overlay */}
      <section
        aria-labelledby="contact-hero-title"
        className="relative isolate overflow-hidden text-foreground"
      >
        <ImageReveal
          direction="right"
          duration={900}
          className="absolute inset-0 -z-10 h-full w-full"
        >
          <ParallaxImage
            src="/assets/therapy-session.jpg"
            alt=""
            aria-hidden
            priority
            speed={0.18}
            containerClassName="absolute inset-0 h-full w-full"
          />
        </ImageReveal>
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-background/70 dark:bg-background/50"
        />

        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 pb-16 pt-12 sm:pb-24 sm:pt-20">
          <AnimatedSection
            direction="up"
            distance={36}
            duration={0.8}
            delay={0.1}
            className="flex flex-col gap-4"
          >
            <h1
              id="contact-hero-title"
              className="max-w-3xl font-display text-4xl font-medium leading-snug tracking-tight sm:text-5xl md:text-6xl"
            >
              <SplitText text={t("title")} stagger={50} offset={20} duration={650} />
            </h1>
            <p className="max-w-2xl text-base leading-7 text-foreground/80 sm:text-lg">
              {t("intro")}
            </p>
          </AnimatedSection>

          <FadeIn direction="up" delay={0.3} duration={0.8}>
            <div className="flex flex-wrap gap-3 pt-2">
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

      {/* Details + form — two-column layout with animated reveal */}
      <section
        aria-labelledby="contact-details-title"
        className="border-t border-border"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-14 sm:py-20 lg:flex-row lg:gap-16">
          {/* Left column: contact details, hours, map */}
          <FadeIn direction="left" className="lg:basis-[44%]">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-4">
                <h2
                  id="contact-details-title"
                  className="font-sans text-2xl font-semibold leading-snug tracking-tight sm:text-3xl"
                >
                  {t("detailsTitle")}
                </h2>
                <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {t("detailsIntro")}
                </p>
              </div>

              <dl className="grid grid-cols-1 gap-x-10 gap-y-6 border-t border-border pt-5 sm:grid-cols-2">
                {details.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex flex-col"
                  >
                    <dt className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {detail.label}
                    </dt>
                    <dd className="mt-1 break-words text-sm font-medium leading-7 text-foreground sm:text-base">
                      {detail.href ? (
                        <a
                          href={detail.href}
                          target={detail.external ? "_blank" : undefined}
                          rel={detail.external ? "noreferrer noopener" : undefined}
                          className="transition-colors hover:text-primary"
                        >
                          {detail.value}
                        </a>
                      ) : (
                        detail.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Embedded map */}
              <FadeIn direction="up" delay={0.1}>
                <iframe
                  src={MAP_EMBED_SRC}
                  className="h-80 w-full border-0"
                  loading="lazy"
                  title={t("mapTitle")}
                />
                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {t("locationValue")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("hours")}
                  </p>
                  <div>
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-sm"
                    >
                      <a
                        href={mapHref}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {t("mapCta")}
                      </a>
                    </Button>
                  </div>
                </div>
              </FadeIn>
            </div>
          </FadeIn>

          {/* Right column: contact form */}
          <AnimatedSection
            direction="right"
            delay={0.1}
            className="lg:basis-[56%]"
          >
            <ContactForm locale={locale} />
          </AnimatedSection>
        </div>
      </section>

      {/* Closing CTA */}
      <section
        aria-labelledby="contact-cta-title"
        className="border-t border-border"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-16 text-center sm:py-20">
          <FadeIn direction="up" className="flex flex-col items-center gap-6">
            <h2
              id="contact-cta-title"
              className="font-sans text-2xl font-semibold leading-snug tracking-tight sm:text-3xl"
            >
              {t("cta.title")}
            </h2>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("cta.body")}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <MagneticButton>
                <Button asChild size="lg" className="rounded-sm">
                  <a
                    href={CLINIKO_BOOKING_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
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
