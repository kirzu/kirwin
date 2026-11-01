import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n.config";
import { alternatesFor } from "@/lib/seo";
import { BookingsView } from "@/components/bookings/bookings-view";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = await getTranslations({
    locale: params.locale,
    namespace: "bookings",
  });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: alternatesFor(params.locale, "/bookings"),
  };
}

export default async function BookingsPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }
  const locale = params.locale as Locale;

  setRequestLocale(locale);

  return <BookingsView locale={locale} />;
}
