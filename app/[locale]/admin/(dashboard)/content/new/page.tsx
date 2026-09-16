import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContentSectionForm } from "@/components/admin/content-form";
import { createSection } from "@/lib/actions/content";
import { isLocale, type Locale } from "@/i18n.config";
import { FadeIn } from "@/components/animations/fade-in";

export const dynamic = "force-dynamic";

export default function NewContentSectionPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
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
                New content section
              </span>
              <h1 className="font-display text-3xl tracking-tight text-brand-900 md:text-4xl">
                Create content section
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                Add a reusable site content block. Keys must be unique and
                cannot be changed after creation.
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
        action={createSection}
        submitLabel="Create section"
        locale={locale}
      />
    </div>
  );
}
