import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n.config";
import { getPosts } from "@/lib/actions/blog";
import { ORIGINAL_TESTIMONIALS } from "@/lib/testimonials";
import {
  TestimonialsView,
  type TestimonialListItem,
} from "@/components/testimonials/testimonials-view";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = await getTranslations({
    locale: params.locale,
    namespace: "testimonials",
  });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function TestimonialsPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }
  const locale = params.locale as Locale;

  setRequestLocale(locale);

  const posts = await getPosts();
  const dbTestimonials: TestimonialListItem[] = posts
    .filter((p) => p.published)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      content: p.content,
      rating: p.rating,
      youtubeUrl: p.youtubeUrl,
      imageUrl: p.imageUrl,
    }));

  // Merge original testimonials with CMS-managed ones. Database entries with
  // matching slugs take precedence so the admin can edit them later.
  const dbSlugs = new Set(dbTestimonials.map((t) => t.slug));
  const testimonials: TestimonialListItem[] = [
    ...dbTestimonials,
    ...ORIGINAL_TESTIMONIALS.filter((t) => !dbSlugs.has(t.slug)),
  ];

  return <TestimonialsView locale={locale} testimonials={testimonials} />;
}
