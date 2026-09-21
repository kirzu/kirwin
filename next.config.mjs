import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n.ts");

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
};

export default withNextIntl(nextConfig);
