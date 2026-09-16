/**
 * Static i18n configuration: supported locales, the default locale, and
 * human-readable labels used by language switchers.
 *
 * This file is safe to import from both server and client code; it must
 * remain free of runtime side effects (no `next-intl/server` imports here).
 */
export const locales = ["en", "zh-Hant"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  "zh-Hant": "繁體中文",
};

/**
 * Convenience helper used by components and helpers that need to assert a
 * string is a supported locale without sprinkling `as Locale` casts around.
 */
export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
