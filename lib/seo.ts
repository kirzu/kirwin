import { locales, type Locale } from "@/i18n.config";

/**
 * Single source of truth for absolute site URLs (metadataBase, og:url,
 * sitemap and robots).
 *
 * The canonical host is `www.` — the apex domain 308-redirects to it — so
 * every absolute URL we emit must use `www.` to avoid pointing crawlers at
 * a redirect. Override per environment with `NEXT_PUBLIC_SITE_URL` (Vercel
 * preview deployments), otherwise the production default is used.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kirwinbodyworks.com"
).replace(/\/$/, "");

/**
 * Canonical + hreflang `alternates` for a public page.
 *
 * `path` is the locale-less path: `""` for the home page, `"/about"`,
 * `"/courses/my-seminar"`, etc. Returns relative hrefs, which Next resolves
 * against `metadataBase` (see `generateMetadata` in the locale layout).
 */
export function alternatesFor(locale: Locale, path = "") {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  return {
    canonical: `/${locale}${clean}`,
    languages: Object.fromEntries(
      locales.map((alt) => [alt, `/${alt}${clean}`]),
    ),
  };
}