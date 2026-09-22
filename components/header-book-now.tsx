"use client";

import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { type Locale } from "@/i18n.config";

/**
 * Small "Book now" pill rendered in the far-left of the public site
 * header, before the site title/logo. Sits on every public page so the
 * primary booking CTA is always one tap away, regardless of which
 * section the visitor is reading.
 *
 * Layout contract:
 *   - On `sm` and up the pill shows the visible "Book now" label.
 *   - Below `sm` (mobile) the label collapses to keep the header
 *     compact — the calendar icon remains so the affordance is still
 *     obvious.
 *   - Always rendered as a link to `/{locale}/bookings` so the click
 *     lands on the embedded Cliniko scheduler rather than bouncing to
 *     an external URL.
 *
 * The pill is intentionally smaller than the floating action surface
 * (`FloatingBookNow`) so it does not compete with it visually.
 */
export function HeaderBookNow({ locale }: { locale: Locale }) {
  const t = useTranslations("header");
  const tCommon = useTranslations("common");

  return (
    <Link
      href={`/${locale}/bookings`}
      aria-label={t("bookNowLabel")}
      data-testid="header-book-now"
      className={[
        "inline-flex h-11 items-center justify-center gap-2 rounded-full",
        "border border-zinc-200 bg-background px-4 text-sm font-semibold",
        "text-foreground",
        "transition-[transform,background-color,border-color,color] duration-200 ease-luxury",
        "motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0",
        "hover:border-primary hover:text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "dark:border-zinc-800",
      ].join(" ")}
    >
      <CalendarCheck aria-hidden="true" className="h-4 w-4" />
      <span className="hidden sm:inline whitespace-nowrap">
        {tCommon("bookNow")}
      </span>
    </Link>
  );
}
