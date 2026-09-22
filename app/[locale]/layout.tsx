import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/i18n.config";
import { getMessages as loadLocaleMessages } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MainNav } from "@/components/main-nav";
import { HeaderBookNow } from "@/components/header-book-now";
import { MobileMenu } from "@/components/mobile-menu";
import { CookieBanner } from "@/components/cookie-banner";
import { MobileBookingCta } from "@/components/mobile-booking-cta";
import { FloatingBookNow } from "@/components/floating-book-now";
import { ScrollProgress } from "@/components/scroll-progress";
import { FilmGrain } from "@/components/film-grain";
import { PageTransition } from "@/components/page-transition";
import { Instagram } from "lucide-react";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/**
 * Display sans for headings, hero copy, and decorative type. Manrope is a
 * modern geometric sans that pairs well with Inter. Wired into
 * `--font-display` so `font-display` (configured in `tailwind.config.js`)
 * resolves to Manrope everywhere in the app.
 */
const display = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kirwinbodyworks.com";

/**
 * Per-locale metadata. The site name/description live in the message
 * catalogue so editors can update them without touching this file.
 *
 * Open Graph / Twitter defaults are also resolved here so social share
 * cards pick up the site name, description, and portrait without each
 * page having to redefine them.
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = await getTranslations({ locale: params.locale, namespace: "site" });
  const name = t("name");
  const description = t("description");
  return {
    metadataBase: new URL(SITE_URL),
    title: name,
    description,
    openGraph: {
      title: name,
      description,
      url: `/${params.locale}`,
      siteName: name,
      locale: params.locale.replace("-", "_"),
      type: "website",
      images: [
        {
          url: "/assets/stephen-portrait.jpg",
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: ["/assets/stephen-portrait.jpg"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }
  const locale = params.locale as Locale;

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  const messages = await loadLocaleMessages(locale);
  const t = await getTranslations({ locale, namespace: "nav" });
  const tSite = await getTranslations({ locale, namespace: "site" });
  const tSwitcher = await getTranslations({
    locale,
    namespace: "languageSwitcher",
  });
  const tFooter = await getTranslations({ locale, namespace: "footer" });

  return (
    <html lang={locale} className={`${inter.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <NextIntlClientProvider locale={locale} messages={messages as never}>
          <ScrollProgress />
          <header className="sticky top-0 z-50 border-b border-zinc-200 bg-background dark:border-zinc-800">
            <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 text-sm sm:px-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <HeaderBookNow locale={locale} />
                <a
                  href={`/${locale}`}
                  className="truncate font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
                >
                  {tSite("name")}
                </a>
              </div>
              <div className="hidden md:flex md:flex-1 md:items-center md:justify-end md:gap-6">
                <MainNav
                  locale={locale}
                  labels={{
                    home: t("home"),
                    about: t("about"),
                    courses: t("courses"),
                    bookings: t("bookings"),
                    testimonials: t("testimonials"),
                    contact: t("contact"),
                  }}
                />
                <LanguageSwitcher
                  ariaLabel={tSwitcher("label")}
                  switchToTemplate={tSwitcher("switchTo")}
                />
              </div>
              <MobileMenu
                locale={locale}
                navLabels={{
                  home: t("home"),
                  about: t("about"),
                  courses: t("courses"),
                  bookings: t("bookings"),
                  testimonials: t("testimonials"),
                  contact: t("contact"),
                }}
                switcherLabel={tSwitcher("label")}
                switchToTemplate={tSwitcher("switchTo")}
              />
            </nav>
          </header>
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <footer className="border-t border-zinc-200 dark:border-zinc-800">
            <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 text-xs text-zinc-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span>
                {tFooter("copyright", { year: new Date().getFullYear() })}
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <a
                  href="https://www.instagram.com/stephenkirwinbodyworks/"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={tFooter("social.instagramLabel")}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-zinc-500 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:text-zinc-400"
                  data-testid="footer-instagram"
                >
                  <Instagram aria-hidden="true" className="h-5 w-5" />
                </a>
                {/* TODO: add Facebook and LinkedIn icon links here once their
                 * URLs are provided. Keep the same lucide icon + target/rel
                 * pattern as the Instagram link above.
                 */}
                <Link
                  href={`/${locale}/privacy`}
                  className="link-underline transition-colors hover:text-primary"
                >
                  {tFooter("links.privacy")}
                </Link>
                <Link
                  href={`/${locale}/terms`}
                  className="link-underline transition-colors hover:text-primary"
                >
                  {tFooter("links.terms")}
                </Link>
              </div>
            </div>
          </footer>
          <MobileBookingCta />
          <FloatingBookNow />
          <CookieBanner />
          {/* Subtle, fixed film-grain overlay. Sits above page content
           * but below fixed interactive surfaces (header, modals). The
           * overlay is static, so no reduced-motion handling is needed. */}
          <FilmGrain opacity={0.05} zIndex={1} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
