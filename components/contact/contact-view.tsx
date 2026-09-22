"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, MessageCircle } from "lucide-react";
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
import { SectionEyebrow } from "@/components/animations";
import ContactForm from "@/app/[locale]/contact/contact-form";
import { CLINIKO_BOOKING_URL } from "@/lib/cliniko";

const INSTAGRAM_URL = "https://www.instagram.com/stephenkirwinbodyworks/";

/**
 * WhatsApp deep link for the contact grid. Uses the same number as the
 * phone number and the floating WhatsApp button so visitors reach
 * Stephen on the channel they expect.
 */
const WHATSAPP_HREF = "https://wa.me/85269065503";

// OpenStreetMap embed centred on 218 Jaffe Road, Wan Chai, Hong Kong.
// The previous `maps.google.com/maps?q=...&output=embed` URL 404s, so we
// use OSM's iframe-friendly export endpoint instead. The bbox brackets
// the marker so the pin is visible without panning.
const MAP_EMBED_SRC =
  "https://www.openstreetmap.org/export/embed.html?bbox=114.171%2C22.276%2C114.181%2C22.282&layer=mapnik&marker=22.2786%2C114.1765";

export interface ContactViewProps {
  locale: Locale;
  phoneHref: string;
  emailHref: string;
  mapHref: string;
}

/**
 * Client-side view for the Contact page. Renders a premium, spacious
 * single-column layout: a full-bleed hero, a wide contact details grid,
 * a full-width map, a full-width contact form, and a closing CTA.
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
    {
      label: t("whatsappLabel"),
      value: t("whatsappHandle"),
      href: WHATSAPP_HREF,
      external: true,
    },
  ];

  return (
    <div className="text-foreground">
      {/* Hero — premium, single CTA, wide content */}
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

        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 pb-16 pt-12 sm:pb-24 sm:pt-20">
          <AnimatedSection
            direction="up"
            distance={36}
            duration={0.8}
            delay={0.1}
            className="flex flex-col gap-4"
          >
            <SectionEyebrow className="text-foreground/70">
              {t("detailsEyebrow")}
            </SectionEyebrow>
            <h1
              id="contact-hero-title"
              className="max-w-4xl font-display text-3xl font-medium leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              <SplitText text={t("title")} stagger={50} offset={20} duration={650} />
            </h1>
            <p className="max-w-3xl text-base leading-7 text-foreground/80 sm:text-lg md:text-xl">
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
              <Button asChild size="lg" variant="outline" className="rounded-sm">
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-testid="contact-whatsapp-cta"
                >
                  <MessageCircle aria-hidden="true" className="mr-2 h-4 w-4" />
                  {t("whatsappCta")}
                </a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Contact details — full-width, spacious grid */}
      <section aria-labelledby="contact-details-title">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32">
          <FadeIn direction="up" className="flex flex-col gap-4">
            <SectionEyebrow>{t("detailsEyebrow")}</SectionEyebrow>
            <h2
              id="contact-details-title"
              className="max-w-4xl font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-5xl"
            >
              {t("detailsTitle")}
            </h2>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg lg:text-xl">
              {t("detailsIntro")}
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.1} className="mt-14">
            <dl className="grid grid-cols-1 gap-x-16 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {details.map((detail) => (
                <div key={detail.label} className="flex flex-col gap-2">
                  <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {detail.label}
                  </dt>
                  <dd className="break-words text-lg font-medium leading-7 text-foreground sm:text-xl">
                    {detail.href ? (
                      <a
                        href={detail.href}
                        target={detail.external ? "_blank" : undefined}
                        rel={detail.external ? "noreferrer noopener" : undefined}
                        className="link-underline inline-flex items-center gap-2 transition-colors hover:text-primary"
                      >
                        {detail.label === t("whatsappLabel") ? (
                          <MessageCircle aria-hidden="true" className="h-4 w-4" />
                        ) : null}
                        {detail.value}
                      </a>
                    ) : (
                      detail.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </FadeIn>
        </div>
      </section>

      {/* Map — full-width, wide container */}
      <section aria-labelledby="contact-map-title">
        <div className="mx-auto max-w-7xl px-6 pb-20 sm:pb-28 lg:pb-32">
          <FadeIn direction="up" className="overflow-hidden rounded-2xl border border-border shadow-sm">
            <iframe
              src={MAP_EMBED_SRC}
              className="h-[24rem] w-full border-0 sm:h-[28rem] lg:h-[32rem]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t("mapTitle")}
            />
          </FadeIn>

          <FadeIn direction="up" delay={0.1} className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-lg font-medium leading-7 text-foreground sm:text-xl">
                {t("locationValue")}
              </p>
              <p className="text-base leading-7 text-muted-foreground">
                {t("hours")}
              </p>
            </div>
            <Button asChild variant="outline" size="lg" className="rounded-sm self-start sm:self-auto">
              <a
                href={mapHref}
                target="_blank"
                rel="noreferrer noopener"
              >
                {t("mapCta")}
              </a>
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* Contact form — full-width, below the map */}
      <section aria-labelledby="contact-form-title">
        <div className="mx-auto max-w-7xl px-6 pb-20 sm:pb-28 lg:pb-32">
          <FadeIn direction="up" className="flex flex-col gap-4">
            <SectionEyebrow>{t("detailsEyebrow")}</SectionEyebrow>
            <h2
              id="contact-form-title"
              className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-5xl"
            >
              {t("formTitle")}
            </h2>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg lg:text-xl">
              {t("formIntro")}
            </p>
          </FadeIn>

          <AnimatedSection
            direction="up"
            delay={0.1}
            className="mt-12"
          >
            <ContactForm locale={locale} />
          </AnimatedSection>
        </div>
      </section>

      {/* Closing CTA — centered, wide */}
      <section aria-labelledby="contact-cta-title">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center sm:py-28 lg:py-32">
          <FadeIn direction="up" className="flex flex-col items-center gap-6">
            <h2
              id="contact-cta-title"
              className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-5xl"
            >
              {t("cta.title")}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg lg:text-xl">
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
