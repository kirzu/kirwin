import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale, type Locale } from "@/i18n.config";
import { prisma } from "@/lib/prisma";
import {
  HomeView,
  type HomeFeaturedTestimonial,
} from "@/components/home/home-view";

type TrainingItem = { title: string; body: string };

/**
 * Per-locale metadata for the home page. The site name/description live in
 * the message catalogue so editors can localise them without touching code.
 *
 * The page leads with bodywork booking, so the title is drawn from
 * `home.hero.title` — the massage-focused headline.
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = await getTranslations({ locale: params.locale, namespace: "site" });
  const tHero = await getTranslations({
    locale: params.locale,
    namespace: "home.hero",
  });
  return {
    title: tHero("title"),
    description: t("description"),
  };
}

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "home" });

  const trainingItems = (t.raw("training.items") as TrainingItem[]) ?? [];
  const credentials = (t.raw("experience.credentials") as string[]) ?? [];

  // Featured testimonial — first published BlogPost repurposed for
  // testimonials (per the D033 plan). Prefer the locale-specific
  // title/content when available, but always use the original image.
  // Only surface the teaser when the post has a usable image (so the
  // card has a portrait to render).
  const testimonialPost = await prisma.blogPost.findFirst({
    where: {
      published: true,
      NOT: { imageUrl: null },
    },
    orderBy: { updatedAt: "desc" },
    select: {
      title: true,
      titleZh: true,
      content: true,
      contentZh: true,
      imageUrl: true,
    },
  });

  const useChinese = locale === "zh-Hant";

  const featuredTestimonial: HomeFeaturedTestimonial | null = testimonialPost
    ? {
        name: useChinese && testimonialPost.titleZh
          ? testimonialPost.titleZh
          : testimonialPost.title,
        quote: useChinese && testimonialPost.contentZh
          ? testimonialPost.contentZh
          : testimonialPost.content,
        imageUrl: testimonialPost.imageUrl,
      }
    : null;

  return (
    <HomeView
      locale={locale}
      trainingItems={trainingItems}
      credentials={credentials}
      featuredTestimonial={featuredTestimonial}
    />
  );
}
