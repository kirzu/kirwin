"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { locales, localeLabels, isLocale, type Locale } from "@/i18n.config";
import { cn } from "@/lib/utils";

/**
 * Minimal locale-aware navigation control.
 *
 * Renders one link per supported locale. The link target swaps the leading
 * locale segment in the current pathname so users stay on the same page
 * after switching languages. Paths that don't already carry a locale
 * segment fall back to the locale root.
 *
 * `variant` controls visual density:
 *   - `"header"` (default): compact pills for the desktop header.
 *   - `"drawer"`: larger pills (≥44px tall/wide) for the mobile menu.
 *
 * `showLabel` toggles the full language name vs the short locale code so
 * the mobile drawer can save space by showing only "EN" / "繁中" when
 * needed.
 */
export function LanguageSwitcher({
  ariaLabel,
  switchToTemplate,
  variant = "header",
  showLabel = true,
  onNavigate,
}: {
  ariaLabel: string;
  switchToTemplate: string;
  variant?: "header" | "drawer";
  showLabel?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "/";

  const targets = useMemo(() => {
    return locales.map((locale) => ({
      locale,
      label: localeLabels[locale],
      short: shortLocaleCode(locale),
      href: swapLocale(pathname, locale),
    }));
  }, [pathname]);

  const isDrawer = variant === "drawer";

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        isDrawer && "flex-col items-stretch gap-2"
      )}
      aria-label={ariaLabel}
    >
      {targets.map(({ locale, label, short, href }) => {
        return (
          <Link
            key={locale}
            href={href}
            onClick={onNavigate}
            aria-label={switchToTemplate.replace("{label}", label)}
            className={cn(
              "rounded-full border border-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-50",
              isDrawer
                ? "min-h-11 px-4 py-3 text-center text-sm font-medium text-zinc-800 dark:text-zinc-100"
                : "min-h-11 inline-flex items-center justify-center px-3 text-zinc-700"
            )}
          >
            {showLabel ? label : short}
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Short, locale-only code shown when the full language name would
 * overflow the mobile header. Matches the locale segments used in URLs.
 */
function shortLocaleCode(locale: Locale): string {
  if (locale === "zh-Hant") return "繁中";
  return locale.toUpperCase();
}

function swapLocale(pathname: string, target: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) {
    segments[0] = target;
    return `/${segments.join("/")}`;
  }
  return `/${target}`;
}
