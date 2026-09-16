"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugifyTitle } from "@/lib/utils/course-slug";

export type BlogPostActionResult = {
  status: "error";
  message: string;
};

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

function readLocale(formData: FormData): string {
  const raw = toStringOrNull(formData.get("locale"));
  return raw ?? "en";
}

function readRating(formData: FormData): {
  value: number | null;
  error: string | null;
} {
  const raw = toStringOrNull(formData.get("rating"));
  if (raw === null) return { value: null, error: null };
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) {
    return { value: null, error: "Rating must be a whole number between 1 and 5." };
  }
  return { value: parsed, error: null };
}

export type ParsedBlogPostInput = {
  slug: string;
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

function readBlogPostFormData(formData: FormData): {
  data: ParsedBlogPostInput;
  error: string | null;
} {
  const title = toStringOrNull(formData.get("title"));
  if (!title) {
    return {
      data: {
        slug: "",
        title: "",
        titleZh: null,
        excerpt: null,
        excerptZh: null,
        content: "",
        contentZh: null,
        rating: null,
        youtubeUrl: null,
        imageUrl: null,
        published: false,
      },
      error: "Client name is required.",
    };
  }

  const slugInput = toStringOrNull(formData.get("slug"));
  const slug = slugInput ? slugifyTitle(slugInput) : slugifyTitle(title);

  const content = toStringOrNull(formData.get("content"));
  if (!content) {
    return {
      data: {
        slug,
        title,
        titleZh: null,
        excerpt: null,
        excerptZh: null,
        content: "",
        contentZh: null,
        rating: null,
        youtubeUrl: null,
        imageUrl: null,
        published: false,
      },
      error: "Testimonial content is required.",
    };
  }

  const rating = readRating(formData);
  if (rating.error) {
    return {
      data: {
        slug,
        title,
        titleZh: null,
        excerpt: null,
        excerptZh: null,
        content,
        contentZh: null,
        rating: null,
        youtubeUrl: null,
        imageUrl: null,
        published: false,
      },
      error: rating.error,
    };
  }

  return {
    data: {
      slug,
      title,
      titleZh: toStringOrNull(formData.get("titleZh")),
      excerpt: toStringOrNull(formData.get("excerpt")),
      excerptZh: toStringOrNull(formData.get("excerptZh")),
      content,
      contentZh: toStringOrNull(formData.get("contentZh")),
      rating: rating.value,
      youtubeUrl: toStringOrNull(formData.get("youtubeUrl")),
      imageUrl: toStringOrNull(formData.get("imageUrl")),
      published: toBool(formData.get("published")),
    },
    error: null,
  };
}

export async function getPosts() {
  return prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPostById(id: string) {
  return prisma.blogPost.findUnique({ where: { id } });
}

/**
 * Create a new testimonial. On success, redirects to the locale-aware
 * admin testimonials list. On validation/server error, returns a
 * structured error result.
 */
export async function createPost(
  formData: FormData,
): Promise<BlogPostActionResult | void> {
  const locale = readLocale(formData);
  const { data, error } = readBlogPostFormData(formData);
  if (error) return { status: "error", message: error };

  try {
    await prisma.blogPost.create({ data });
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error ? err.message : "Failed to create testimonial.",
    };
  }

  revalidatePath(`/${locale}/testimonials`);
  revalidatePath(`/${locale}/admin/blog`);
  redirect(`/${locale}/admin/blog`);
}

/**
 * Update an existing testimonial. On success, redirects to the
 * locale-aware admin testimonials list. On validation/server error,
 * returns a structured error result.
 */
export async function updatePost(
  id: string,
  formData: FormData,
): Promise<BlogPostActionResult | void> {
  const locale = readLocale(formData);
  const { data, error } = readBlogPostFormData(formData);
  if (error) return { status: "error", message: error };

  try {
    await prisma.blogPost.update({ where: { id }, data });
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error ? err.message : "Failed to update testimonial.",
    };
  }

  revalidatePath(`/${locale}/testimonials`);
  revalidatePath(`/${locale}/admin/blog`);
  redirect(`/${locale}/admin/blog`);
}

/**
 * Delete a testimonial by id. On success, redirects to the locale-aware
 * admin testimonials list. Returns a structured error result on failure.
 */
export async function deletePost(
  id: string,
  localeOrFormData: string | FormData = "en",
): Promise<BlogPostActionResult | void> {
  const locale =
    typeof localeOrFormData === "string"
      ? localeOrFormData
      : readLocale(localeOrFormData);
  try {
    await prisma.blogPost.delete({ where: { id } });
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error ? err.message : "Failed to delete testimonial.",
    };
  }

  revalidatePath(`/${locale}/testimonials`);
  revalidatePath(`/${locale}/admin/blog`);
  redirect(`/${locale}/admin/blog`);
}
