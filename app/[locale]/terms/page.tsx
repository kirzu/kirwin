import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n.config";
import { getTermsDocument } from "@/lib/legal";
import { LegalPage } from "@/components/legal/legal-page";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = await getTranslations({ locale: params.locale, namespace: "footer" });
  return {
    title: t("links.terms"),
  };
}

export default async function TermsPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }
  const locale = params.locale as Locale;
  setRequestLocale(locale);

  const document = getTermsDocument(locale);

  return <LegalPage document={document} />;
}
