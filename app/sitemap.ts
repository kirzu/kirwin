import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/i18n.config";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kirwinbodyworks.com";

const PUBLIC_ROUTES = [
  "",
  "/about",
  "/courses",
  "/bookings",
  "/testimonials",
  "/contact",
  "/privacy",
  "/terms",
] as const;

/**
 * sitemap.xml served at `/sitemap.xml`.
 *
 * Emits one entry per public page × supported locale. The home page is
 * weighted slightly higher (`priority: 1.0`) and the rest settle on
 * `0.8` — a sensible default for a content-driven marketing site.
 *
 * `changeFrequency` is `weekly` for everything because the catalogue
 * (courses, testimonials, availability) updates on roughly that cadence.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL.replace(/\/$/, "");
  return locales.flatMap((locale) =>
    PUBLIC_ROUTES.map((route) => {
      const isHome = route === "";
      const path = route === "" ? "" : route;
      return {
        url: `${base}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: isHome ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((alt) => [
              alt,
              `${base}/${alt}${path}`,
            ]),
          ),
        },
      };
    }),
  );
}

// Silence unused-import warning while keeping `defaultLocale` available
// for future per-locale priority tweaks.
void defaultLocale;
