import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlogPostForm } from "@/components/admin/blog-form";
import { getPostById, updatePost } from "@/lib/actions/blog";
import { isLocale, type Locale } from "@/i18n.config";
import { FadeIn } from "@/components/animations/fade-in";

export const dynamic = "force-dynamic";

type EditBlogPostPageProps = {
  params: { id: string; locale: string };
};

export default async function EditBlogPostPage({
  params,
}: EditBlogPostPageProps) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "en";
  const post = await getPostById(params.id);

  if (!post) {
    notFound();
  }

  const updateAction = updatePost.bind(null, post.id);

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
                Edit testimonial
              </span>
              <h1 className="font-display text-3xl tracking-tight text-brand-900 md:text-4xl">
                Edit testimonial
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                Update the testimonial details below. Changes apply immediately.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-sage-300 text-sage-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-sage-500 hover:bg-sage-50 hover:shadow-sm"
            >
              <Link href={`/${locale}/admin/blog`}>Back to testimonials</Link>
            </Button>
          </div>
        </section>
      </FadeIn>

      <BlogPostForm
        action={updateAction}
        submitLabel="Save changes"
        locale={locale}
        initialValues={{
          title: post.title,
          titleZh: post.titleZh,
          excerpt: post.excerpt,
          excerptZh: post.excerptZh,
          content: post.content,
          contentZh: post.contentZh,
          rating: post.rating,
          youtubeUrl: post.youtubeUrl,
          imageUrl: post.imageUrl,
          published: post.published,
        }}
      />
    </div>
  );
}
