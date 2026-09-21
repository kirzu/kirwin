import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kirwinbodyworks.com";

/**
 * robots.txt served at `/robots.txt`.
 *
 * Allows every crawler and points them at the sitemap so search engines
 * can pick up the locale variants in one place.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL.replace(/\/$/, "")}/sitemap.xml`,
  };
}
