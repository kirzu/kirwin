import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale, type Locale } from "@/i18n.config";
import { prisma } from "@/lib/prisma";
import { formatDuration, formatPriceHkd } from "@/lib/format";
import {
  HomeView,
  type HomeCoursePreview,
  type HomeFeaturedTestimonial,
} from "@/components/home/home-view";

type TrainingItem = { title: string; body: string };

/**
 * Per-locale metadata for the home page. The site name/description live in
 * the message catalogue so editors can localise them without touching code.
 *
 * The page now leads with bodywork booking and surfaces seminars as a
 * secondary path, so the title is drawn from `home.choice.title` — the
 * "Two ways to work with Stephen" headline used by the choice cards.
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = await getTranslations({ locale: params.locale, namespace: "site" });
  const tChoice = await getTranslations({
    locale: params.locale,
    namespace: "home.choice",
  });
  return {
    title: tChoice("title"),
    description: t("description"),
  };
}

const PREVIEW_LIMIT = 3;

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

  // Pull a small slice of the most recently updated published courses so the
  // home page can render a featured seminars band without duplicating the
  // full listing logic.
  const previewCourses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { updatedAt: "desc" },
    take: PREVIEW_LIMIT,
    select: {
      id: true,
      slug: true,
      title: true,
      titleZh: true,
      description: true,
      descriptionZh: true,
      price: true,
      durationMinutes: true,
    },
  });

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
  const featuredCourses: HomeCoursePreview[] = previewCourses.map((course) => ({
    id: course.id,
    slug: course.slug,
    title:
      useChinese && course.titleZh ? course.titleZh : course.title,
    description:
      useChinese && course.descriptionZh
        ? course.descriptionZh
        : course.description,
    durationLabel: formatDuration(course.durationMinutes),
    priceLabel: formatPriceHkd(course.price),
  }));

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
      featuredCourses={featuredCourses}
      featuredTestimonial={featuredTestimonial}
    />
  );
}
