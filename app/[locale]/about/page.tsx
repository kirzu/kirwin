import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale, type Locale } from "@/i18n.config";
import {
  AboutView,
  type AboutFaq,
  type AboutMilestone,
} from "@/components/about/about-view";

/**
 * Per-locale metadata for the About page. Title and intro live in the
 * message catalogue so editors can localise them without touching code.
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = await getTranslations({ locale: params.locale, namespace: "about" });
  return {
    title: t("title"),
    description: t("intro"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "about" });

  const bioParagraphs = (t.raw("bio") as string[]) ?? [];
  const credentials = (t.raw("credentials") as string[]) ?? [];
  const milestones = (t.raw("milestones") as AboutMilestone[]) ?? [];
  const faqs = (t.raw("faqs") as AboutFaq[]) ?? [];

  return (
    <AboutView
      locale={locale}
      bioParagraphs={bioParagraphs}
      credentials={credentials}
      milestones={milestones}
      faqs={faqs}
    />
  );
}
