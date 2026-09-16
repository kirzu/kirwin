import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AvailabilityForm } from "@/components/admin/availability-form";
import {
  createCourseAvailability,
  getCoursesForSelect,
} from "@/lib/actions/availability";
import { isLocale, type Locale } from "@/i18n.config";
import { FadeIn } from "@/components/animations/fade-in";

export const dynamic = "force-dynamic";

export default async function NewAvailabilityPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const courses = await getCoursesForSelect();

  return (
    <div className="space-y-8">
      <FadeIn direction="up" duration={0.7}>
        <section className="relative overflow-hidden rounded-2xl border border-brand-sand/60 bg-gradient-to-br from-brand-50 via-background to-sage-50 px-6 py-8 md:px-8 md:py-10">
          <div
            aria-hidden
            className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sage-200/60 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-terracotta-200/60 blur-3xl"
          />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-sage-300/60 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-wider text-sage-700">
                <span className="h-1.5 w-1.5 rounded-full bg-sage-500" />
                New availability
              </span>
              <h1 className="font-display text-3xl tracking-tight text-brand-900 md:text-4xl">
                Create availability slot
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                Add a new bookable time slot for a course.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-sage-300 text-sage-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-sage-500 hover:bg-sage-50 hover:shadow-sm"
            >
              <Link href={`/${locale}/admin/availability`}>
                Back to availability
              </Link>
            </Button>
          </div>
        </section>
      </FadeIn>

      <AvailabilityForm
        courses={courses}
        action={createCourseAvailability}
        submitLabel="Create slot"
        locale={locale}
      />
    </div>
  );
}
