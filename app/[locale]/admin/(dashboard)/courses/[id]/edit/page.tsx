import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CourseForm } from "@/components/admin/course-form";
import { getCourseById, updateCourse } from "@/lib/actions/courses";
import { isLocale, type Locale } from "@/i18n.config";
import { FadeIn } from "@/components/animations/fade-in";

export const dynamic = "force-dynamic";

type EditCoursePageProps = {
  params: { id: string; locale: string };
};

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const course = await getCourseById(params.id);

  if (!course) {
    notFound();
  }

  const updateAction = updateCourse.bind(null, course.id);

  return (
    <div className="space-y-8">
      <FadeIn direction="up" duration={0.7}>
        <section className="relative overflow-hidden rounded-2xl border border-brand-sand/60 bg-gradient-to-br from-brand-50 via-background to-sage-50 px-6 py-8 md:px-8 md:py-10">
          <div
            aria-hidden
            className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-terracotta-200/60 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-sage-200/60 blur-3xl"
          />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-terracotta-300/60 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-wider text-terracotta-700">
                <span className="h-1.5 w-1.5 rounded-full bg-terracotta-500" />
                Edit course
              </span>
              <h1 className="font-display text-3xl tracking-tight text-brand-900 md:text-4xl">
                Edit course
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                Update the course details below. Changes apply immediately.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-sage-300 text-sage-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-sage-500 hover:bg-sage-50 hover:shadow-sm"
            >
              <Link href={`/${locale}/admin/courses`}>Back to courses</Link>
            </Button>
          </div>
        </section>
      </FadeIn>

      <CourseForm
        action={updateAction}
        submitLabel="Save changes"
        locale={locale}
        initialValues={{
          title: course.title,
          titleZh: course.titleZh,
          description: course.description,
          descriptionZh: course.descriptionZh,
          price: course.price,
          durationMinutes: course.durationMinutes,
          maxParticipants: course.maxParticipants,
          published: course.published,
        }}
      />
    </div>
  );
}
