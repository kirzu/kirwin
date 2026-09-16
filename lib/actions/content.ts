"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type ContentSectionActionResult = {
  status: "error";
  message: string;
};

function toStringOrNull(value: FormDataEntryValue | null): string | null {
  if (value === null) return null;
  const str = String(value).trim();
  return str.length === 0 ? null : str;
}

// Keys are dotted identifiers like `home.hero.title`. Allowed chars:
// lowercase letters, digits, dots, and hyphens.
const KEY_PATTERN = /^[a-z0-9.-]+$/;

function isValidKey(key: string): boolean {
  if (!KEY_PATTERN.test(key)) return false;
  // Must contain at least one letter so that empty dot-only keys are invalid.
  return /[a-z]/.test(key);
}

function readLocale(formData: FormData): string {
  const raw = toStringOrNull(formData.get("locale"));
  return raw ?? "en";
}

export type ParsedContentSectionInput = {
  key: string;
  label: string;
  value: string;
  valueZh: string | null;
};

function readContentSectionFormData(formData: FormData): {
  data: ParsedContentSectionInput;
  error: string | null;
} {
  const keyRaw = toStringOrNull(formData.get("key"));
  const label = toStringOrNull(formData.get("label"));
  const value = toStringOrNull(formData.get("value"));

  const empty = (): ParsedContentSectionInput => ({
    key: keyRaw ?? "",
    label: label ?? "",
    value: value ?? "",
    valueZh: toStringOrNull(formData.get("valueZh")),
  });

  if (!keyRaw) {
    return { data: empty(), error: "Key is required." };
  }
  if (!isValidKey(keyRaw)) {
    return {
      data: empty(),
      error:
        "Key may only contain lowercase letters, digits, dots, and hyphens.",
    };
  }
  if (!label) {
    return { data: empty(), error: "Label is required." };
  }
  if (!value) {
    return { data: empty(), error: "Value is required." };
  }

  return {
    data: {
      key: keyRaw,
      label,
      value,
      valueZh: toStringOrNull(formData.get("valueZh")),
    },
    error: null,
  };
}

export async function getSections() {
  return prisma.contentSection.findMany({
    orderBy: { key: "asc" },
  });
}

export async function getSectionById(id: string) {
  return prisma.contentSection.findUnique({ where: { id } });
}

/**
 * Create a new content section. On success, redirects to the locale-aware
 * admin content list. On validation/server error, returns a structured
 * error result.
 */
export async function createSection(
  formData: FormData,
): Promise<ContentSectionActionResult | void> {
  const locale = readLocale(formData);
  const { data, error } = readContentSectionFormData(formData);
  if (error) return { status: "error", message: error };

  try {
    await prisma.contentSection.create({ data });
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error
          ? err.message
          : "Failed to create content section.",
    };
  }

  revalidatePath(`/${locale}/admin/content`);
  redirect(`/${locale}/admin/content`);
}

/**
 * Update an existing content section. The `key` field is intentionally not
 * editable here to keep references stable; if a rename is needed, delete
 * and recreate. On success, redirects to the locale-aware admin content
 * list. On validation/server error, returns a structured error result.
 */
export async function updateSection(
  id: string,
  formData: FormData,
): Promise<ContentSectionActionResult | void> {
  const locale = readLocale(formData);
  const { data, error } = readContentSectionFormData(formData);
  if (error) return { status: "error", message: error };

  try {
    await prisma.contentSection.update({
      where: { id },
      data: {
        label: data.label,
        value: data.value,
        valueZh: data.valueZh,
      },
    });
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error
          ? err.message
          : "Failed to update content section.",
    };
  }

  revalidatePath(`/${locale}/admin/content`);
  redirect(`/${locale}/admin/content`);
}

/**
 * Delete a content section by id. On success, redirects to the locale-aware
 * admin content list. Returns a structured error result on failure.
 */
export async function deleteSection(
  id: string,
  localeOrFormData: string | FormData = "en",
): Promise<ContentSectionActionResult | void> {
  const locale =
    typeof localeOrFormData === "string"
      ? localeOrFormData
      : readLocale(localeOrFormData);
  try {
    await prisma.contentSection.delete({ where: { id } });
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error
          ? err.message
          : "Failed to delete content section.",
    };
  }

  revalidatePath(`/${locale}/admin/content`);
  redirect(`/${locale}/admin/content`);
}
