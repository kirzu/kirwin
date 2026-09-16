"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugifyTitle } from "@/lib/utils/course-slug";

export type CourseActionResult = {
  status: "error";
  message: string;
};

function toStringOrNull(value: FormDataEntryValue | null): string | null {
  if (value === null) return null;
  const str = String(value).trim();
  return str.length === 0 ? null : str;
}

function toInt(value: FormDataEntryValue | null, fallback: number): number {
  if (value === null) return fallback;
  const str = String(value).trim();
  if (str.length === 0) return fallback;
  const num = Number(str);
  return Number.isFinite(num) ? Math.trunc(num) : fallback;
}

function toBool(value: FormDataEntryValue | null): boolean {
  if (value === null) return false;
  const str = String(value).toLowerCase();
  return str === "on" || str === "true" || str === "1";
}

function readLocale(formData: FormData): string {
  const raw = toStringOrNull(formData.get("locale"));
  return raw ?? "en";
}

export type ParsedCourseInput = {
  slug: string;
  title: string;
  titleZh: string | null;
  description: string | null;
  descriptionZh: string | null;
  price: number;
  durationMinutes: number | null;
  maxParticipants: number;
  published: boolean;
};

function readCourseFormData(formData: FormData): {
  data: ParsedCourseInput;
  error: string | null;
} {
  const title = toStringOrNull(formData.get("title"));
  if (!title) {
    return {
      data: {
        slug: "",
        title: "",
        titleZh: null,
        description: null,
        descriptionZh: null,
        price: 0,
        durationMinutes: null,
        maxParticipants: 8,
        published: false,
      },
      error: "Title is required.",
    };
  }

  const slugInput = toStringOrNull(formData.get("slug"));
  const slug = slugInput ? slugifyTitle(slugInput) : slugifyTitle(title);

  const price = toInt(formData.get("price"), 0);
  if (price < 0) {
    return {
      data: {
        slug,
        title,
        titleZh: null,
        description: null,
        descriptionZh: null,
        price: 0,
        durationMinutes: null,
        maxParticipants: 8,
        published: false,
      },
      error: "Price must be a non-negative number.",
    };
  }

  const maxParticipants = toInt(formData.get("maxParticipants"), 8);
  if (maxParticipants <= 0) {
    return {
      data: {
        slug,
        title,
        titleZh: null,
        description: null,
        descriptionZh: null,
        price,
        durationMinutes: null,
        maxParticipants: 8,
        published: false,
      },
      error: "Maximum participants must be at least 1.",
    };
  }

  const durationRaw = toStringOrNull(formData.get("durationMinutes"));
  let durationMinutes: number | null = null;
  if (durationRaw !== null) {
    const parsed = Number(durationRaw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return {
        data: {
          slug,
          title,
          titleZh: null,
          description: null,
          descriptionZh: null,
          price,
          durationMinutes: null,
          maxParticipants,
          published: false,
        },
        error: "Duration must be a non-negative number.",
      };
    }
    durationMinutes = Math.trunc(parsed);
  }

  return {
    data: {
      slug,
      title,
      titleZh: toStringOrNull(formData.get("titleZh")),
      description: toStringOrNull(formData.get("description")),
      descriptionZh: toStringOrNull(formData.get("descriptionZh")),
      price,
      durationMinutes,
      maxParticipants,
      published: toBool(formData.get("published")),
    },
    error: null,
  };
}

export async function getCourses() {
  return prisma.course.findMany({
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCourseById(id: string) {
  return prisma.course.findUnique({ where: { id } });
}

/**
 * Create a new course. On success, redirects to the locale-aware admin
 * courses list. On validation/server error, returns a structured error
 * result.
 */
export async function createCourse(
  formData: FormData,
): Promise<CourseActionResult | void> {
  const locale = readLocale(formData);
  const { data, error } = readCourseFormData(formData);
  if (error) return { status: "error", message: error };

  try {
    await prisma.course.create({ data });
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error ? err.message : "Failed to create course.",
    };
  }

  revalidatePath(`/${locale}/courses`);
  revalidatePath(`/${locale}/admin/courses`);
  redirect(`/${locale}/admin/courses`);
}

/**
 * Update an existing course. On success, redirects to the locale-aware
 * admin courses list. On validation/server error, returns a structured
 * error result.
 */
export async function updateCourse(
  id: string,
  formData: FormData,
): Promise<CourseActionResult | void> {
  const locale = readLocale(formData);
  const { data, error } = readCourseFormData(formData);
  if (error) return { status: "error", message: error };

  try {
    await prisma.course.update({ where: { id }, data });
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error ? err.message : "Failed to update course.",
    };
  }

  revalidatePath(`/${locale}/courses`);
  revalidatePath(`/${locale}/admin/courses`);
  redirect(`/${locale}/admin/courses`);
}

/**
 * Delete a course by id. On success, redirects to the locale-aware admin
 * courses list. Returns a structured error result on failure.
 *
 * `locale` may be a string or a FormData containing a `locale` field.
 */
export async function deleteCourse(
  id: string,
  localeOrFormData: string | FormData = "en",
): Promise<CourseActionResult | void> {
  const locale =
    typeof localeOrFormData === "string"
      ? localeOrFormData
      : readLocale(localeOrFormData);
  try {
    await prisma.course.delete({ where: { id } });
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error ? err.message : "Failed to delete course.",
    };
  }

  revalidatePath(`/${locale}/courses`);
  revalidatePath(`/${locale}/admin/courses`);
  redirect(`/${locale}/admin/courses`);
}
