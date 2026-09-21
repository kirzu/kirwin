import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Lora } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/i18n.config";
import { getMessages as loadLocaleMessages } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MainNav } from "@/components/main-nav";
import { MobileMenu } from "@/components/mobile-menu";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/**
 * Display serif for headings, hero copy, and decorative type. Wired into
 * `--font-display` so `font-display` (configured in `tailwind.config.js`)
 * resolves to Lora everywhere in the app.
 */
const lora = Lora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Per-locale metadata. The site name/description live in the message
 * catalogue so editors can update them without touching this file.
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = await getTranslations({ locale: params.locale, namespace: "site" });
  return {
    title: t("name"),
    description: t("description"),
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
    <html lang={locale} className={`${inter.variable} ${lora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <NextIntlClientProvider locale={locale} messages={messages as never}>
          <header className="sticky top-0 z-50 border-b border-zinc-200 bg-background dark:border-zinc-800">
            <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 text-sm sm:px-6">
              <a
                href={`/${locale}`}
                className="truncate font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                {tSite("name")}
              </a>
              <div className="hidden md:flex md:flex-1 md:items-center md:justify-end md:gap-6">
                <MainNav
                  locale={locale}
                  labels={{
                    home: t("home"),
                    about: t("about"),
                    courses: t("courses"),
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
                  testimonials: t("testimonials"),
                  contact: t("contact"),
                }}
                switcherLabel={tSwitcher("label")}
                switchToTemplate={tSwitcher("switchTo")}
              />
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-zinc-200 dark:border-zinc-800">
            <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 text-xs text-zinc-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span>
                {tFooter("copyright", { year: new Date().getFullYear() })}
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link
                  href={`/${locale}/privacy`}
                  className="transition-colors hover:text-primary"
                >
                  {tFooter("links.privacy")}
                </Link>
                <Link
                  href={`/${locale}/terms`}
                  className="transition-colors hover:text-primary"
                >
                  {tFooter("links.terms")}
                </Link>
                <Link
                  href={`/${locale}/admin`}
                  className="transition-colors hover:text-primary"
                >
                  {t("admin")}
                </Link>
              </div>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
