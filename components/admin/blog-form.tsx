"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn } from "@/components/animations/fade-in";

export type BlogPostFormValues = {
  id?: string;
  title: string;
  titleZh: string | null;
  excerpt: string | null;
  excerptZh: string | null;
  content: string;
  contentZh: string | null;
  rating: number | null;
  youtubeUrl: string | null;
  imageUrl: string | null;
  published: boolean;
};

type ActionResult = { status: "error"; message: string } | void;

type BlogPostFormProps = {
  initialValues?: Partial<BlogPostFormValues>;
  submitLabel: string;
  action: (formData: FormData) => Promise<ActionResult>;
  locale?: string;
};

const inputClass =
  "h-10 border-brand-sand/70 bg-background focus-visible:border-sage-500 focus-visible:ring-sage-500/40";
const textareaClass =
  "border-brand-sand/70 bg-background focus-visible:border-sage-500 focus-visible:ring-sage-500/40";
const sectionClass =
  "grid gap-5 rounded-2xl border border-brand-sand/60 bg-background p-5 shadow-sm md:p-6";

export function BlogPostForm({
  initialValues,
  submitLabel,
  action,
  locale = "en",
}: BlogPostFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const initialTitle = initialValues?.title ?? "";
  const initialTitleZh = initialValues?.titleZh ?? "";
  const initialExcerpt = initialValues?.excerpt ?? "";
  const initialExcerptZh = initialValues?.excerptZh ?? "";
  const initialContent = initialValues?.content ?? "";
  const initialContentZh = initialValues?.contentZh ?? "";
  const initialRating =
    typeof initialValues?.rating === "number" ? String(initialValues.rating) : "";
  const initialYoutubeUrl = initialValues?.youtubeUrl ?? "";
  const initialImageUrl = initialValues?.imageUrl ?? "";
  const initialPublished = initialValues?.published ?? false;

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const result = await action(formData);
      if (result && result.status === "error") {
        setError(result.message);
        setPending(false);
      }
    } catch (err) {
      setPending(false);
      setError(
        err instanceof Error ? err.message : "Unexpected error submitting form.",
      );
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error ? (
        <FadeIn direction="up" duration={0.5}>
          <div
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        </FadeIn>
      ) : null}

      <input type="hidden" name="locale" value={locale} />

      <FadeIn direction="up" delay={0.05}>
        <section
          aria-labelledby="blog-form-titles-heading"
          className={sectionClass}
        >
          <header className="space-y-1">
            <h2
              id="blog-form-titles-heading"
              className="font-display text-lg text-brand-900"
            >
              Client name
            </h2>
            <p className="text-xs text-muted-foreground">
              Provide the client name in English and Traditional Chinese.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Client name (English)</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={initialTitle}
                className={inputClass}
                placeholder="e.g. Alex Johnson"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="titleZh">Client name (繁體中文)</Label>
              <Input
                id="titleZh"
                name="titleZh"
                defaultValue={initialTitleZh}
                className={inputClass}
                placeholder="客戶中文姓名"
              />
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn direction="up" delay={0.1}>
        <section
          aria-labelledby="blog-form-excerpts-heading"
          className={sectionClass}
        >
          <header className="space-y-1">
            <h2
              id="blog-form-excerpts-heading"
              className="font-display text-lg text-brand-900"
            >
              Short pull quote
            </h2>
            <p className="text-xs text-muted-foreground">
              A short excerpt shown on testimonial cards.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="excerpt">Pull quote (English)</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                defaultValue={initialExcerpt}
                placeholder="Short pull quote shown in testimonial listings."
                className={textareaClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="excerptZh">Pull quote (繁體中文)</Label>
              <Textarea
                id="excerptZh"
                name="excerptZh"
                defaultValue={initialExcerptZh}
                placeholder="客戶中文簡引述"
                className={textareaClass}
              />
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn direction="up" delay={0.15}>
        <section
          aria-labelledby="blog-form-content-heading"
          className={sectionClass}
        >
          <header className="space-y-1">
            <h2
              id="blog-form-content-heading"
              className="font-display text-lg text-brand-900"
            >
              Full testimonial
            </h2>
            <p className="text-xs text-muted-foreground">
              The full testimonial text in both languages.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="content">Content (English)</Label>
              <Textarea
                id="content"
                name="content"
                required
                defaultValue={initialContent}
                placeholder="Full testimonial in English."
                className={`${textareaClass} min-h-[220px]`}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contentZh">Content (繁體中文)</Label>
              <Textarea
                id="contentZh"
                name="contentZh"
                defaultValue={initialContentZh}
                placeholder="客戶中文評價"
                className={`${textareaClass} min-h-[220px]`}
              />
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn direction="up" delay={0.18}>
        <section
          aria-labelledby="blog-form-media-heading"
          className={sectionClass}
        >
          <header className="space-y-1">
            <h2
              id="blog-form-media-heading"
              className="font-display text-lg text-brand-900"
            >
              Rating & media
            </h2>
            <p className="text-xs text-muted-foreground">
              Optional rating (1-5), YouTube link, and image used on the public
              testimonial card.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                min={1}
                max={5}
                step={1}
                defaultValue={initialRating}
                className={inputClass}
                placeholder="5"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="youtubeUrl">YouTube URL</Label>
              <Input
                id="youtubeUrl"
                name="youtubeUrl"
                type="url"
                defaultValue={initialYoutubeUrl}
                className={inputClass}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-3">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="text"
                defaultValue={initialImageUrl}
                className={inputClass}
                placeholder="/assets/testimonial-alex.jpg"
              />
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn direction="up" delay={0.2}>
        <section
          aria-labelledby="blog-form-publish-heading"
          className={sectionClass}
        >
          <header className="space-y-1">
            <h2
              id="blog-form-publish-heading"
              className="font-display text-lg text-brand-900"
            >
              Visibility
            </h2>
          </header>
          <div className="flex items-center gap-3 pt-1">
            <input
              id="published"
              name="published"
              type="checkbox"
              defaultChecked={initialPublished}
              className="h-4 w-4 rounded border-brand-sand/70 text-terracotta-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/50 focus-visible:ring-offset-2"
            />
            <Label htmlFor="published" className="cursor-pointer">
              Published (visible on the public testimonials page)
            </Label>
          </div>
        </section>
      </FadeIn>

      <FadeIn direction="up" delay={0.25}>
        <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-brand-sand/60 bg-gradient-to-r from-brand-50 via-background to-sage-50 p-4 shadow-sm">
          <Button
            asChild
            type="button"
            variant="outline"
            disabled={pending}
            className="border-sage-300 text-sage-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-sage-500 hover:bg-sage-50 hover:shadow-sm"
          >
            <Link href={`/${locale}/admin/blog`}>Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={pending}
            className="bg-terracotta-600 text-terracotta-50 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-terracotta-700 hover:shadow-md"
          >
            {pending ? "Saving..." : submitLabel}
          </Button>
        </div>
      </FadeIn>
    </form>
  );
}

export default BlogPostForm;
