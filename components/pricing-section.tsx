"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { type Locale } from "@/i18n.config";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/animations/stagger-children";
import { SectionEyebrow } from "@/components/animations/section-eyebrow";

/**
 * Reusable "Session fees" pricing section shared by the home page and
 * the /bookings page. Renders two quiet cards — single sessions and
 * ten-session packages — each carrying a definition list of session
 * lengths and their fees, plus a package-enquiry CTA pointing at the
 * contact page.
 *
 * Copy resolves through the shared `pricing.*` namespace so both
 * surfaces stay in sync without duplicating the dictionary.
 */

type PricingGroup = {
  headingKey: "singleHeading" | "packageHeading";
  testIdSuffix: "single" | "package";
  items: ReadonlyArray<{
    labelKey: "single60" | "single90" | "package60" | "package90";
    priceKey:
      | "priceSingle60"
      | "priceSingle90"
      | "pricePackage60"
      | "pricePackage90";
    testIdSuffix: "60" | "90";
  }>;
};

const GROUPS: ReadonlyArray<PricingGroup> = [
  {
    headingKey: "singleHeading",
    testIdSuffix: "single",
    items: [
      { labelKey: "single60", priceKey: "priceSingle60", testIdSuffix: "60" },
      { labelKey: "single90", priceKey: "priceSingle90", testIdSuffix: "90" },
    ],
  },
  {
    headingKey: "packageHeading",
    testIdSuffix: "package",
    items: [
      { labelKey: "package60", priceKey: "pricePackage60", testIdSuffix: "60" },
      { labelKey: "package90", priceKey: "pricePackage90", testIdSuffix: "90" },
    ],
  },
];

export interface PricingSectionProps {
  locale: Locale;
  /** Section id used by `aria-labelledby`. */
  ariaLabelledById: string;
  /** `data-testid` prefix so each surface can be targeted in tests. */
  testId: string;
}

export function PricingSection({
  locale,
  ariaLabelledById,
  testId,
}: PricingSectionProps) {
  const t = useTranslations("pricing");

  return (
    <section aria-labelledby={ariaLabelledById} data-testid={testId}>
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-14 sm:py-20">
        <FadeIn direction="up">
          <div className="max-w-2xl">
            <SectionEyebrow className="mb-3">{t("eyebrow")}</SectionEyebrow>
            <h2
              id={ariaLabelledById}
              className="font-display text-2xl font-medium leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl"
            >
              {t("title")}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("intro")}
            </p>
          </div>
        </FadeIn>

        <StaggerChildren
          className="grid gap-6 md:grid-cols-2"
          stagger={0.08}
          y={24}
        >
          {GROUPS.map((group) => (
            <StaggerItem key={group.headingKey} className="h-full">
              <article
                data-testid={`${testId}-${group.testIdSuffix}`}
                className="luxe-card flex h-full flex-col gap-4 rounded-2xl border border-border bg-background p-6 sm:p-8"
              >
                <h3 className="font-sans text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {t(group.headingKey)}
                </h3>
                <dl className="flex flex-col">
                  {group.items.map((item) => (
                    <div
                      key={item.labelKey}
                      data-testid={`${testId}-${group.testIdSuffix}-${item.testIdSuffix}`}
                      className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0"
                    >
                      <dt className="text-base leading-7 text-foreground">
                        {t(item.labelKey)}
                      </dt>
                      <dd className="font-display text-lg font-medium leading-snug text-foreground sm:text-xl">
                        {t(item.priceKey)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            </StaggerItem>
          ))}
        </StaggerChildren>

        <FadeIn direction="up" delay={0.05}>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              {t("footnote")}
            </p>
            <Button asChild variant="outline" className="min-h-11 rounded-sm">
              <a href={`/${locale}/contact`} data-testid={`${testId}-package-cta`}>
                {t("cta")}
                <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
