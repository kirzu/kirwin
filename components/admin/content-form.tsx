"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn } from "@/components/animations/fade-in";

export type ContentSectionFormValues = {
  id?: string;
  key: string;
  label: string;
  value: string;
  valueZh: string | null;
};

type ActionResult = { status: "error"; message: string } | void;

type ContentSectionFormProps = {
  initialValues?: Partial<ContentSectionFormValues>;
  submitLabel: string;
  action: (formData: FormData) => Promise<ActionResult>;
  lockKey?: boolean;
  locale?: string;
};

const inputClass =
  "h-10 border-brand-sand/70 bg-background focus-visible:border-sage-500 focus-visible:ring-sage-500/40";
const textareaClass =
  "border-brand-sand/70 bg-background focus-visible:border-sage-500 focus-visible:ring-sage-500/40";
const sectionClass =
  "grid gap-5 rounded-2xl border border-brand-sand/60 bg-background p-5 shadow-sm md:p-6";

export function ContentSectionForm({
  initialValues,
  submitLabel,
  action,
  lockKey = false,
  locale = "en",
}: ContentSectionFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const initialKey = initialValues?.key ?? "";
  const initialLabel = initialValues?.label ?? "";
  const initialValue = initialValues?.value ?? "";
  const initialValueZh = initialValues?.valueZh ?? "";

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
        err instanceof Error
          ? err.message
          : "Unexpected error submitting form.",
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
          aria-labelledby="content-form-identity-heading"
          className={sectionClass}
        >
          <header className="space-y-1">
            <h2
              id="content-form-identity-heading"
              className="font-display text-lg text-brand-900"
            >
              Identity
            </h2>
            <p className="text-xs text-muted-foreground">
              Dotted identifier and human-readable label for this section.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                name="key"
                required
                readOnly={lockKey}
                disabled={lockKey}
                defaultValue={initialKey}
                className={`${inputClass} ${
                  lockKey ? "bg-muted font-mono text-sm" : "font-mono text-sm"
                }`}
                placeholder="e.g. home.hero.title"
                aria-describedby="key-help"
              />
              <p id="key-help" className="text-xs text-muted-foreground">
                Dotted identifier. Lowercase letters, digits, dots, and hyphens
                only. {lockKey ? "Cannot be changed after creation." : ""}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                name="label"
                required
                defaultValue={initialLabel}
                className={inputClass}
                placeholder="e.g. Home Hero Title"
              />
              <p className="text-xs text-muted-foreground">
                Human-readable name shown in the admin listing.
              </p>
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn direction="up" delay={0.1}>
        <section
          aria-labelledby="content-form-value-heading"
          className={sectionClass}
        >
          <header className="space-y-1">
            <h2
              id="content-form-value-heading"
              className="font-display text-lg text-brand-900"
            >
              Content value
            </h2>
            <p className="text-xs text-muted-foreground">
              The actual content shown on the public site.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="value">Value (English)</Label>
              <Textarea
                id="value"
                name="value"
                required
                defaultValue={initialValue}
                placeholder="English content value"
                className={`${textareaClass} min-h-[140px]`}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="valueZh">Value (繁體中文)</Label>
              <Textarea
                id="valueZh"
                name="valueZh"
                defaultValue={initialValueZh}
                placeholder="中文內容"
                className={`${textareaClass} min-h-[140px]`}
              />
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn direction="up" delay={0.15}>
        <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-brand-sand/60 bg-gradient-to-r from-brand-50 via-background to-sage-50 p-4 shadow-sm">
          <Button
            asChild
            type="button"
            variant="outline"
            disabled={pending}
            className="border-sage-300 text-sage-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-sage-500 hover:bg-sage-50 hover:shadow-sm"
          >
            <Link href={`/${locale}/admin/content`}>Cancel</Link>
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

export default ContentSectionForm;
