"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn } from "@/components/animations/fade-in";

export type CourseFormValues = {
  id?: string;
  title: string;
  titleZh: string | null;
  description: string | null;
  descriptionZh: string | null;
  price: number;
  durationMinutes: number | null;
  maxParticipants: number;
  published: boolean;
};

type ActionResult = { status: "error"; message: string } | void;

type CourseFormProps = {
  initialValues?: Partial<CourseFormValues>;
  submitLabel: string;
  // Form data action or course update action with bound id
  action: (formData: FormData) => Promise<ActionResult>;
  locale?: string;
};

const inputClass =
  "h-10 border-brand-sand/70 bg-background focus-visible:border-sage-500 focus-visible:ring-sage-500/40";
const numericInputClass =
  "h-10 border-brand-sand/70 bg-background focus-visible:border-sage-500 focus-visible:ring-sage-500/40";
const sectionClass =
  "grid gap-5 rounded-2xl border border-brand-sand/60 bg-background p-5 shadow-sm md:p-6";

export function CourseForm({
  initialValues,
  submitLabel,
  action,
  locale = "en",
}: CourseFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const initialTitle = initialValues?.title ?? "";
  const initialTitleZh = initialValues?.titleZh ?? "";
  const initialDescription = initialValues?.description ?? "";
  const initialDescriptionZh = initialValues?.descriptionZh ?? "";
  const initialPrice =
    initialValues?.price !== undefined && initialValues?.price !== null
      ? String(initialValues.price)
      : "0";
  const initialDuration =
    initialValues?.durationMinutes !== undefined &&
    initialValues?.durationMinutes !== null
      ? String(initialValues.durationMinutes)
      : "";
  const initialMax =
    initialValues?.maxParticipants !== undefined &&
    initialValues?.maxParticipants !== null
      ? String(initialValues.maxParticipants)
      : "8";
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
          aria-labelledby="course-form-titles-heading"
          className={sectionClass}
        >
          <header className="space-y-1">
            <h2
              id="course-form-titles-heading"
              className="font-display text-lg text-brand-900"
            >
              Titles
            </h2>
            <p className="text-xs text-muted-foreground">
              Provide the course name in English and Traditional Chinese.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title (English)</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={initialTitle}
                className={inputClass}
                placeholder="e.g. Myofascial Release Intensive"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="titleZh">Title (繁體中文)</Label>
              <Input
                id="titleZh"
                name="titleZh"
                defaultValue={initialTitleZh}
                className={inputClass}
                placeholder="課程中文標題"
              />
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn direction="up" delay={0.1}>
        <section
          aria-labelledby="course-form-descriptions-heading"
          className={sectionClass}
        >
          <header className="space-y-1">
            <h2
              id="course-form-descriptions-heading"
              className="font-display text-lg text-brand-900"
            >
              Descriptions
            </h2>
            <p className="text-xs text-muted-foreground">
              Short summaries shown on the listing page.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description (English)</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={initialDescription}
                placeholder="Short summary shown on the listing page."
                className="border-brand-sand/70 bg-background focus-visible:border-sage-500 focus-visible:ring-sage-500/40"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="descriptionZh">Description (繁體中文)</Label>
              <Textarea
                id="descriptionZh"
                name="descriptionZh"
                defaultValue={initialDescriptionZh}
                placeholder="課程中文簡介"
                className="border-brand-sand/70 bg-background focus-visible:border-sage-500 focus-visible:ring-sage-500/40"
              />
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn direction="up" delay={0.15}>
        <section
          aria-labelledby="course-form-details-heading"
          className={sectionClass}
        >
          <header className="space-y-1">
            <h2
              id="course-form-details-heading"
              className="font-display text-lg text-brand-900"
            >
              Pricing &amp; capacity
            </h2>
            <p className="text-xs text-muted-foreground">
              Set the price, duration, and maximum participants for this
              course.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Price (cents, HKD)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={initialPrice}
                className={numericInputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="durationMinutes">Duration (minutes)</Label>
              <Input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                min="0"
                step="1"
                defaultValue={initialDuration}
                className={numericInputClass}
                placeholder="e.g. 120"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="maxParticipants">Max participants</Label>
              <Input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                min="1"
                step="1"
                required
                defaultValue={initialMax}
                className={numericInputClass}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <input
              id="published"
              name="published"
              type="checkbox"
              defaultChecked={initialPublished}
              className="h-4 w-4 rounded border-brand-sand/70 text-terracotta-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/50 focus-visible:ring-offset-2"
            />
            <Label htmlFor="published" className="cursor-pointer">
              Published (visible on the public courses page)
            </Label>
          </div>
        </section>
      </FadeIn>

      <FadeIn direction="up" delay={0.2}>
        <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-brand-sand/60 bg-gradient-to-r from-brand-50 via-background to-sage-50 p-4 shadow-sm">
          <Button
            asChild
            type="button"
            variant="outline"
            disabled={pending}
            className="border-sage-300 text-sage-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-sage-500 hover:bg-sage-50 hover:shadow-sm"
          >
            <Link href={`/${locale}/admin/courses`}>Cancel</Link>
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

export default CourseForm;
