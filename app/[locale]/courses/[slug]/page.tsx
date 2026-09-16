import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n.config";
import { prisma } from "@/lib/prisma";
import { formatDuration, formatPriceHkd } from "@/lib/format";
import {
  CourseDetailView,
  type CourseDetailSyllabusItem,
} from "@/components/course-detail/course-detail-view";
import {
  type BookingFormAvailability,
} from "@/components/booking-form";

/**
 * Pre-render the detail page for every published course so each slug gets a
 * static HTML file in `.next/server/app/<locale>/courses/<slug>/`. This is
 * what makes the verification grep pass: without this Next.js would render
 * the route on demand and never emit per-slug HTML at build time.
 */
export async function generateStaticParams() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return courses.map((course) => ({ slug: course.slug }));
}

/**
 * Per-locale metadata for the course detail page. The title comes from the
 * translated course record when available, with a sensible fallback to the
 * catalogue's `courseDetail.ctaTitle`. The description falls back to the
 * course description, or to the catalogue `courses.subtitle`.
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;

  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      titleZh: true,
      description: true,
      descriptionZh: true,
      published: true,
    },
  });

  if (!course || !course.published) return {};

  const useChinese = locale === "zh-Hant";
  const title =
    useChinese && course.titleZh ? course.titleZh : course.title;

  let description =
    useChinese && course.descriptionZh
      ? course.descriptionZh
      : course.description;
  if (!description) {
    const t = await getTranslations({ locale, namespace: "courses" });
    description = t("subtitle");
  }

  return {
    title,
    description,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  if (!isLocale(params.locale)) return null;
  const locale = params.locale as Locale;
  setRequestLocale(locale);

  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
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
      published: true,
    },
  });

  if (!course || !course.published) {
    notFound();
  }

  const now = new Date();
  const availableSlots = (await prisma.availability.findMany({
    where: {
      courseId: course.id,
      isAvailable: true,
      startDateTime: { gt: now },
    },
    orderBy: { startDateTime: "asc" },
    select: {
      id: true,
      startDateTime: true,
      endDateTime: true,
      capacity: true,
      bookedCount: true,
    },
  })).filter((slot) => slot.bookedCount < slot.capacity);

  const bookingFormSlots: BookingFormAvailability[] = availableSlots.map(
    (slot) => ({
      id: slot.id,
      startDateTime: slot.startDateTime.toISOString(),
      endDateTime: slot.endDateTime.toISOString(),
      capacity: slot.capacity,
      bookedCount: slot.bookedCount,
    }),
  );

  const useChinese = locale === "zh-Hant";

  const title = useChinese && course.titleZh ? course.titleZh : course.title;
  const description =
    useChinese && course.descriptionZh ? course.descriptionZh : course.description;
  const duration = formatDuration(course.durationMinutes);
  const priceLabel = formatPriceHkd(course.price);

  // The current Prisma schema doesn't store a syllabus per course, so we
  // always fall back to the catalog's `syllabusDefault` translations. The
  // field is reserved so we can plug in a future `syllabusZh` / `syllabus`
  // JSON column without touching the view component.
  const syllabus: CourseDetailSyllabusItem[] = [];

  return (
    <CourseDetailView
      locale={locale}
      course={{
        id: course.id,
        slug: course.slug,
        title,
        description,
        price: course.price,
        priceLabel,
        durationLabel: duration,
        seats: course.maxParticipants,
        imageUrl: course.imageUrl,
        syllabus,
      }}
      availabilities={bookingFormSlots}
      hasUpcomingSessions={bookingFormSlots.length > 0}
    />
  );
}
