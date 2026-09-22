"use client";

import { CalendarCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { locales, type Locale } from "@/i18n.config";
import { useReducedMotion } from "@/components/animations/use-reduced-motion";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

/**
 * WhatsApp direct-chat deep link. The number is the same one displayed
 * on the contact page so visitors reach Stephen on the channel they
 * recognise from the contact grid.
 *
 * Format: international, no spaces or leading `+`. The `wa.me` short
 * link works in WhatsApp on both mobile and desktop.
 */
const WHATSAPP_HREF = "https://wa.me/85269065503";

/**
 * Persistent floating action surfaces shown on every public page.
 *
 * Two complementary surfaces:
 *   1. A pill-shaped primary "Book now" button anchored to the bottom
 *      right. Links to the in-app `/bookings` route (the embedded
 *      Cliniko scheduler).
 *   2. A small circular WhatsApp icon anchored to the bottom left so
 *      visitors can open a direct chat without leaving the site.
 *
 * Both are suppressed on admin routes (`/{locale}/admin/*`) so the
 * public-only CTAs do not follow staff around the back office. The
 * pattern mirrors `MobileBookingCta`, which uses the same admin-path
 * check.
 *
 * Z-index ordering:
 *   - The mobile sticky bar (`MobileBookingCta`) uses `z-40`.
 *   - We use `z-50` here so the floating button always sits above the
 *     sticky bar even when both are visible on small viewports.
 *
 * Motion:
 *   - The fade/lift hover transition is wrapped in `motion-safe:` so it
 *     is fully suppressed under `prefers-reduced-motion: reduce`.
 */
export function FloatingBookNow() {
  const pathname = usePathname() ?? "";
  const reducedMotion = useReducedMotion();
  const t = useTranslations("floatingActions");
  const tCommon = useTranslations("common");

  const locale = locales.find((l) => pathname.startsWith(`/${l}/`));
  if (locale && isAdminPath(pathname, locale)) return null;

  const bookingsHref = locale ? `/${locale}/bookings` : "/bookings";
  const bookNowLabel = tCommon("bookNow");

  return (
    <>
      {/* WhatsApp — bottom left, small circular icon button */}
      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={t("whatsappLabel")}
        data-testid="floating-whatsapp"
        className={[
          "fixed bottom-6 left-6 z-50 inline-flex h-12 w-12 items-center justify-center",
          "rounded-full border border-zinc-200 bg-background text-foreground",
          "shadow-[0_8px_24px_-8px_rgba(63,42,22,0.35)]",
          "transition-[transform,box-shadow,background-color] duration-200 ease-luxury",
          reducedMotion
            ? ""
            : "motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
          "hover:bg-primary hover:text-primary-foreground hover:border-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "dark:border-zinc-800",
        ].join(" ")}
      >
        <WhatsAppIcon aria-hidden="true" className="h-5 w-5" />
      </a>

      {/* Book now — bottom right, primary pill button */}
      <a
        href={bookingsHref}
        aria-label={t("bookLabel")}
        data-testid="floating-book-now"
        className={[
          "fixed bottom-6 right-6 z-50 inline-flex h-12 items-center gap-2 rounded-full",
          "bg-primary px-6 text-sm font-semibold text-primary-foreground",
          "shadow-[0_10px_28px_-10px_rgba(180,94,62,0.55)]",
          "transition-[transform,box-shadow,background-color] duration-200 ease-luxury",
          reducedMotion
            ? ""
            : "motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
          "hover:bg-primary/90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ].join(" ")}
      >
        <CalendarCheck aria-hidden="true" className="h-4 w-4" />
        <span className="whitespace-nowrap">{bookNowLabel}</span>
      </a>
    </>
  );
}

function isAdminPath(pathname: string, locale: Locale): boolean {
  return pathname === `/${locale}/admin` || pathname.startsWith(`/${locale}/admin/`);
}
