"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { locales, type Locale } from "@/i18n.config";
import { CLINIKO_BOOKING_URL } from "@/lib/cliniko";

/**
 * Sticky bottom call-to-action bar shown only on small viewports.
 *
 * Hidden on admin routes (anything under `/{locale}/admin`) so the
 * public-only booking link doesn't follow staff around the back office.
 */
export function MobileBookingCta() {
  const t = useTranslations("mobileBookingCta");
  const pathname = usePathname() ?? "";

  const locale = locales.find((l) => pathname.startsWith(`/${l}/`));
  if (locale && isAdminPath(pathname, locale)) return null;

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-background/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:border-zinc-800">
      <a
        href={CLINIKO_BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-full items-center justify-center rounded-sm bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {t("label")}
      </a>
    </div>
  );
}

function isAdminPath(pathname: string, locale: Locale): boolean {
  return pathname === `/${locale}/admin` || pathname.startsWith(`/${locale}/admin/`);
}
