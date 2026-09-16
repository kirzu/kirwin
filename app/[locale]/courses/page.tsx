import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isLocale, type Locale } from "@/i18n.config";
import { prisma } from "@/lib/prisma";
import { formatDuration, formatPriceHkd } from "@/lib/format";
import {
  CoursesView,
  type CourseListItem,
} from "@/components/courses/courses-view";

/**
 * Per-locale metadata for the public courses listing. Title and subtitle
 * come from the message catalogue so editors can localise them without
 * touching code.
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = await getTranslations({ locale: params.locale, namespace: "courses" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function CoursesPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  setRequestLocale(locale);

  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      titleZh: true,
      description: true,
      descriptionZh: true,
      price: true,
      durationMinutes: true,
      maxParticipants: true,
      imageUrl: true,
    },
  });

  const useChinese = locale === "zh-Hant";

  const items: CourseListItem[] = courses.map((course) => ({
    id: course.id,
    slug: course.slug,
    title: useChinese && course.titleZh ? course.titleZh : course.title,
    description:
      useChinese && course.descriptionZh
        ? course.descriptionZh
        : course.description,
    priceLabel: formatPriceHkd(course.price),
    durationLabel: formatDuration(course.durationMinutes),
    seats: course.maxParticipants,
    imageUrl: course.imageUrl,
  }));

  return (
    <CoursesView
      locale={locale}
      courses={items}
      hasCourses={items.length > 0}
    />
  );
}
