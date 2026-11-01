import { locales, type Locale } from "@/i18n.config";

/**
 * Single source of truth for absolute site URLs (metadataBase, og:url,
 * sitemap and robots).
 *
 * The canonical host is `www.` — the apex domain 308-redirects to it — so
 * every absolute URL we emit must use `www.`; pointing crawlers at a
 * redirecting URL is a duplicate-content smell. `NEXT_PUBLIC_SITE_URL` is
 * still honoured per environment (Vercel previews, localhost), but a value
 * on the bare apex is normalised to `www.` so production stays correct even
 * if the env var lags behind the DNS setup.
 */
const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kirwinbodyworks.com";

function canonicalHost(raw: string): string {
  try {
    const url = new URL(raw);
    if (url.hostname === "kirwinbodyworks.com") {
      url.hostname = "www.kirwinbodyworks.com";
    }
    return url.origin;
  } catch {
    // Not a parseable absolute URL — fall back to the raw value.
    return raw.replace(/\/$/, "");
  }
}

export const SITE_URL = canonicalHost(RAW_SITE_URL);

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