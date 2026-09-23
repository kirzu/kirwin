"use client";

import {
  Activity,
  CircleDot,
  HeartPulse,
  Layers,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animations/animated-section";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/animations/stagger-children";
import { SectionEyebrow } from "@/components/animations/section-eyebrow";
import { type Locale } from "@/i18n.config";

/**
 * Reusable "Bodywork sessions" grid shared by the home page and the
 * /bookings page. Lists the six core therapeutic sessions Stephen
 * offers from the Wan Chai studio, each rendered as a luxe card with
 * a Lucide icon, title, and one-sentence description.
 *
 * `tone` lets each call site tint the section to match its surrounding
 * context (the home page uses a flat background; the bookings page
 * sits inside a `bg-muted/30` band so it uses the muted variant to
 * retain separation without introducing an extra gradient).
 *
 * Copy is resolved through `useTranslations("home.massageOptions")` or
 * `useTranslations("bookings.massageOptions")` based on the `namespace`
 * prop, so the same component is reused on both surfaces without
 * duplicating the dictionary.
 */
const ICONS: Record<string, LucideIcon> = {
  deepTissue: Layers,
  injuryRecovery: HeartPulse,
  fullBody: Activity,
  neuromuscular: Target,
  triggerPoint: CircleDot,
  myofascialRelease: Sparkles,
};

const ORDER = [
  "deepTissue",
  "injuryRecovery",
  "fullBody",
  "neuromuscular",
  "triggerPoint",
  "myofascialRelease",
] as const;

export interface MassageOptionsSectionProps {
  locale: Locale;
  /**
   * Which translation namespace to read the cards from.
   * `"home"` resolves `home.massageOptions.*`; `"bookings"` resolves
   * `bookings.massageOptions.*`. Both namespaces carry identical keys.
   */
  namespace: "home" | "bookings";
  /** Optional tone override for the surrounding band. */
  tone?: "default" | "muted";
  /**
   * Optional eyebrow override. When omitted, the translated
   * `{namespace}.massageOptions.eyebrow` value is used.
   */
  eyebrow?: string;
  /**
   * Optional heading override. When omitted, the translated
   * `{namespace}.massageOptions.title` value is used.
   */
  title?: string;
  /**
   * Optional intro override. When omitted, the translated
   * `{namespace}.massageOptions.intro` value is used.
   */
  intro?: string;
  /** Section id used by `aria-labelledby`. */
  ariaLabelledById: string;
  /**
   * Whether to render a CTA at the bottom of the section pointing at
   * the booking scheduler. Defaults to `true`.
   */
  showCta?: boolean;
  /** Override for the CTA label. */
  ctaLabel?: string;
}

export function MassageOptionsSection({
  locale,
  namespace,
  tone = "default",
  eyebrow,
  title,
  intro,
  ariaLabelledById,
  showCta = true,
  ctaLabel,
}: MassageOptionsSectionProps) {
  const t = useTranslations(`${namespace}.massageOptions`);
  const tCommon = useTranslations("common");

  return (
    <section
      aria-labelledby={ariaLabelledById}
      className={tone === "muted" ? "bg-muted/30" : undefined}
      data-testid={`massage-options-${namespace}`}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-14 sm:py-20">
        <FadeIn direction="up">
          <div className="max-w-2xl">
            <SectionEyebrow className="mb-3">{eyebrow ?? t("eyebrow")}</SectionEyebrow>
            <h2
              id={ariaLabelledById}
              className="font-display text-2xl font-medium leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl"
            >
              {title ?? t("title")}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              {intro ?? t("intro")}
            </p>
          </div>
        </FadeIn>

        <StaggerChildren
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.08}
          y={24}
        >
          {ORDER.map((key) => {
            const Icon = ICONS[key];
            return (
              <StaggerItem key={key} className="h-full">
                <article
                  data-testid={`massage-option-${key}`}
                  className="luxe-card flex h-full flex-col gap-4 rounded-2xl border border-border bg-background p-6"
                >
                  <span
                    aria-hidden
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-primary"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-sans text-lg font-medium leading-snug text-foreground">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {t(`${key}.description`)}
                  </p>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerChildren>

        {showCta ? (
          <AnimatedSection
            direction="up"
            distance={16}
            duration={0.7}
            delay={0.05}
            className="flex flex-col items-center gap-3 pt-2 text-center"
          >
            <Button asChild size="lg" className="min-h-11 rounded-sm">
              <a href={`/${locale}/bookings`} data-testid="massage-options-cta">
                {ctaLabel ?? tCommon("bookNow")}
              </a>
            </Button>
          </AnimatedSection>
        ) : null}
      </div>
    </section>
  );
}
