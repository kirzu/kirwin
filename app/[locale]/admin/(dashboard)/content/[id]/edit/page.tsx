import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContentSectionForm } from "@/components/admin/content-form";
import { getSectionById, updateSection } from "@/lib/actions/content";
import { isLocale, type Locale } from "@/i18n.config";
import { FadeIn } from "@/components/animations/fade-in";

export const dynamic = "force-dynamic";

type EditContentSectionPageProps = {
  params: { id: string; locale: string };
};

export default async function EditContentSectionPage({
  params,
}: EditContentSectionPageProps) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const section = await getSectionById(params.id);

  if (!section) {
    notFound();
  }

  const updateAction = updateSection.bind(null, section.id);

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
                Edit content section
              </span>
              <h1 className="font-display text-3xl tracking-tight text-brand-900 md:text-4xl">
                Edit content section
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                Update the content section below. Keys are immutable; create a
                new section if you need to rename.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-sage-300 text-sage-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-sage-500 hover:bg-sage-50 hover:shadow-sm"
            >
              <Link href={`/${locale}/admin/content`}>
                Back to content sections
              </Link>
            </Button>
          </div>
        </section>
      </FadeIn>

      <ContentSectionForm
        action={updateAction}
        submitLabel="Save changes"
        lockKey
        locale={locale}
        initialValues={{
          key: section.key,
          label: section.label,
          value: section.value,
          valueZh: section.valueZh,
        }}
      />
    </div>
  );
}
