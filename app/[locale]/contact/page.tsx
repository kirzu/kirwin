import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale, type Locale } from "@/i18n.config";
import { ContactView } from "@/components/contact/contact-view";

/**
 * Per-locale metadata for the contact page. Title and intro come from the
 * message catalogue so editors can localise them without touching code.
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = await getTranslations({ locale: params.locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("intro"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "contact" });

  const phoneHref = `tel:${t("phoneValue").replace(/[^+\d]/g, "")}`;
  const emailHref = `mailto:${t("emailValue")}`;
  // Use Google Maps search URL so the destination always resolves to a
  // pin on the practice address without needing a Places API key.
  const mapQuery = encodeURIComponent(t("locationValue"));
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <ContactView
      locale={locale}
      phoneHref={phoneHref}
      emailHref={emailHref}
      mapHref={mapHref}
    />
  );
}
