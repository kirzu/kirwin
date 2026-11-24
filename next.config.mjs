import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n.ts");

/**
 * Baseline security headers, applied to every response.
 *
 * Note: the CSP is Report-Only on purpose — a strict policy would need
 * tuning against Stripe, the Cliniko scheduler and YouTube embeds before
 * it is enforced. Report-Only collects violations without breaking them.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.youtube.com https://www.youtube-nocookie.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://js.stripe.com https://checkout.stripe.com https://*.cliniko.com",
      "connect-src 'self' https://api.stripe.com https://*.cliniko.com",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com",
      "object-src 'none'",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    // Serve AVIF first, then WebP, then the original. Smaller payloads on
    // phones and older laptops without a noticeable quality loss.
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for 30 days; they live behind a hashed URL so
    // busting happens automatically when the source changes.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
