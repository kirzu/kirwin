"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/animations/fade-in";

export type AvailabilityFormValues = {
  courseId: string;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  isAvailable: boolean;
};

export type AvailabilityCourseOption = {
  id: string;
  title: string;
};

type ActionResult = { status: "error"; message: string } | void;

type AvailabilityFormProps = {
  courses: AvailabilityCourseOption[];
  initialValues?: Partial<AvailabilityFormValues>;
  submitLabel: string;
  action: (formData: FormData) => Promise<ActionResult>;
  locale?: string;
};

const inputClass =
  "h-10 border-brand-sand/70 bg-background focus-visible:border-sage-500 focus-visible:ring-sage-500/40";
const selectClass =
  "border-brand-sand/70 bg-background h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-sage-500 focus-visible:ring-2 focus-visible:ring-sage-500/40 transition-colors";
const sectionClass =
  "grid gap-5 rounded-2xl border border-brand-sand/60 bg-background p-5 shadow-sm md:p-6";

function toDatetimeLocal(value: string | undefined, fallback: Date): string {
  if (value) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return toLocalIso(d);
  }
  return toLocalIso(fallback);
}

function toLocalIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export function AvailabilityForm({
  courses,
  initialValues,
  submitLabel,
  action,
  locale = "en",
}: AvailabilityFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const now = new Date();
  const defaultEnd = new Date(now.getTime() + 60 * 60 * 1000);

  const initialCourseId = initialValues?.courseId ?? courses[0]?.id ?? "";
  const initialStart = toDatetimeLocal(initialValues?.startDateTime, now);
  const initialEnd = toDatetimeLocal(initialValues?.endDateTime, defaultEnd);
  const initialCapacity =
    initialValues?.capacity !== undefined && initialValues?.capacity !== null
      ? String(initialValues.capacity)
      : "8";
  const initialIsAvailable = initialValues?.isAvailable ?? true;

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
          aria-labelledby="availability-form-course-heading"
          className={sectionClass}
        >
          <header className="space-y-1">
            <h2
              id="availability-form-course-heading"
              className="font-display text-lg text-brand-900"
            >
              Course
            </h2>
            <p className="text-xs text-muted-foreground">
              Choose which course this time slot belongs to.
            </p>
          </header>
          <div className="flex flex-col gap-2">
            <Label htmlFor="courseId">Course</Label>
            <select
              id="courseId"
              name="courseId"
              required
              defaultValue={initialCourseId}
              className={selectClass}
            >
              {courses.length === 0 ? (
                <option value="" disabled>
                  No courses available
                </option>
              ) : null}
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </section>
      </FadeIn>

      <FadeIn direction="up" delay={0.1}>
        <section
          aria-labelledby="availability-form-window-heading"
          className={sectionClass}
        >
          <header className="space-y-1">
            <h2
              id="availability-form-window-heading"
              className="font-display text-lg text-brand-900"
            >
              Schedule
            </h2>
            <p className="text-xs text-muted-foreground">
              Define the start and end of this bookable window.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDateTime">Start date &amp; time</Label>
              <Input
                id="startDateTime"
                name="startDateTime"
                type="datetime-local"
                required
                defaultValue={initialStart}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDateTime">End date &amp; time</Label>
              <Input
                id="endDateTime"
                name="endDateTime"
                type="datetime-local"
                required
                defaultValue={initialEnd}
                className={inputClass}
              />
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn direction="up" delay={0.15}>
        <section
          aria-labelledby="availability-form-capacity-heading"
          className={sectionClass}
        >
          <header className="space-y-1">
            <h2
              id="availability-form-capacity-heading"
              className="font-display text-lg text-brand-900"
            >
              Capacity
            </h2>
            <p className="text-xs text-muted-foreground">
              Maximum seats and whether this slot is open for booking.
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="capacity">Capacity (max seats)</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                step="1"
                required
                defaultValue={initialCapacity}
                className={inputClass}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3">
                <input
                  id="isAvailable"
                  name="isAvailable"
                  type="checkbox"
                  defaultChecked={initialIsAvailable}
                  className="h-4 w-4 rounded border-brand-sand/70 text-terracotta-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/50 focus-visible:ring-offset-2"
                />
                <span className="text-sm font-medium">
                  Available for booking
                </span>
              </label>
            </div>
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
            <Link href={`/${locale}/admin/availability`}>Cancel</Link>
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

export default AvailabilityForm;
