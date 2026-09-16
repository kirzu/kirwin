"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type AvailabilityActionResult = {
  status: "error";
  message: string;
};

function readLocale(formData: FormData): string {
  const raw = formData.get("locale");
  if (raw === null) return "en";
  const str = String(raw).trim();
  return str.length === 0 ? "en" : str;
}

function toStringOrNull(value: FormDataEntryValue | null): string | null {
  if (value === null) return null;
  const str = String(value).trim();
  return str.length === 0 ? null : str;
}

function toBool(value: FormDataEntryValue | null): boolean {
  if (value === null) return false;
  const str = String(value).toLowerCase();
  return str === "on" || str === "true" || str === "1";
}

function toPositiveInt(value: FormDataEntryValue | null, fallback: number): number {
  if (value === null) return fallback;
  const str = String(value).trim();
  if (str.length === 0) return fallback;
  const num = Number(str);
  if (!Number.isFinite(num)) return fallback;
  return Math.trunc(num);
}

function toDate(value: FormDataEntryValue | null): Date | null {
  const str = toStringOrNull(value);
  if (!str) return null;
  const date = new Date(str);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export type ParsedAvailabilityInput = {
  courseId: string;
  startDateTime: Date;
  endDateTime: Date;
  capacity: number;
  isAvailable: boolean;
};

function readAvailabilityFormData(
  formData: FormData,
  previous?: ParsedAvailabilityInput,
): { data: ParsedAvailabilityInput; error: string | null } {
  const empty: ParsedAvailabilityInput = previous ?? {
    courseId: "",
    startDateTime: new Date(),
    endDateTime: new Date(),
    capacity: 1,
    isAvailable: true,
  };

  const courseId = toStringOrNull(formData.get("courseId"));
  if (!courseId) {
    return { data: empty, error: "Course is required." };
  }

  const startDateTime = toDate(formData.get("startDateTime"));
  if (!startDateTime) {
    return { data: { ...empty, courseId }, error: "Start date/time is required." };
  }

  const endDateTime = toDate(formData.get("endDateTime"));
  if (!endDateTime) {
    return { data: { ...empty, courseId, startDateTime }, error: "End date/time is required." };
  }

  if (startDateTime.getTime() >= endDateTime.getTime()) {
    return {
      data: { courseId, startDateTime, endDateTime, capacity: empty.capacity, isAvailable: true },
      error: "Start date/time must be before end date/time.",
    };
  }

  const capacity = toPositiveInt(formData.get("capacity"), 0);
  if (capacity <= 0) {
    return {
      data: { courseId, startDateTime, endDateTime, capacity: 0, isAvailable: true },
      error: "Capacity must be a positive integer.",
    };
  }

  return {
    data: {
      courseId,
      startDateTime,
      endDateTime,
      capacity,
      isAvailable: toBool(formData.get("isAvailable")),
    },
    error: null,
  };
}

export async function getAvailabilities() {
  return prisma.availability.findMany({
    orderBy: { startDateTime: "asc" },
    include: {
      course: {
        select: { id: true, title: true, slug: true },
      },
    },
  });
}

export async function getAvailabilityById(id: string) {
  return prisma.availability.findUnique({
    where: { id },
    include: {
      course: {
        select: { id: true, title: true, slug: true },
      },
    },
  });
}

export async function getCoursesForSelect() {
  return prisma.course.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, slug: true },
  });
}

function revalidateAvailabilityPaths(locale: string, courseSlug?: string | null) {
  revalidatePath(`/${locale}/admin/availability`);
  revalidatePath(`/${locale}/courses`);
  if (courseSlug) {
    revalidatePath(`/${locale}/courses/${courseSlug}`);
  }
}

export async function createCourseAvailability(
  formData: FormData,
): Promise<AvailabilityActionResult | void> {
  const locale = readLocale(formData);
  const { data, error } = readAvailabilityFormData(formData);
  if (error) return { status: "error", message: error };

  let created: { course: { slug: string } };
  try {
    created = await prisma.availability.create({
      data: {
        courseId: data.courseId,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        capacity: data.capacity,
        bookedCount: 0,
        isAvailable: data.isAvailable,
      },
      include: { course: { select: { slug: true } } },
    });
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error ? err.message : "Failed to create availability slot.",
    };
  }

  revalidateAvailabilityPaths(locale, created.course.slug);
  redirect(`/${locale}/admin/availability`);
}

export async function updateAvailability(
  id: string,
  formData: FormData,
): Promise<AvailabilityActionResult | void> {
  const locale = readLocale(formData);
  const { data, error } = readAvailabilityFormData(formData);
  if (error) return { status: "error", message: error };

  let updated: { course: { slug: string } };
  try {
    updated = await prisma.availability.update({
      where: { id },
      data: {
        courseId: data.courseId,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        capacity: data.capacity,
        isAvailable: data.isAvailable,
      },
      include: { course: { select: { slug: true } } },
    });
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error ? err.message : "Failed to update availability slot.",
    };
  }

  revalidateAvailabilityPaths(locale, updated.course.slug);
  redirect(`/${locale}/admin/availability`);
}

export async function deleteAvailability(
  id: string,
  localeOrFormData: string | FormData = "en",
): Promise<AvailabilityActionResult | void> {
  const locale =
    typeof localeOrFormData === "string"
      ? localeOrFormData
      : readLocale(localeOrFormData);

  let deleted: { course: { slug: string } };
  try {
    deleted = await prisma.availability.delete({
      where: { id },
      include: { course: { select: { slug: true } } },
    });
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error ? err.message : "Failed to delete availability slot.",
    };
  }

  revalidateAvailabilityPaths(locale, deleted.course.slug);
  redirect(`/${locale}/admin/availability`);
}
