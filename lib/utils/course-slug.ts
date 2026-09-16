const SLUG_MAX_LENGTH = 80;

/**
 * Convert a course title into a URL-safe slug. Falls back to a generated
 * timestamp-based slug if the cleaned title is empty.
 */
export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, SLUG_MAX_LENGTH);

  if (base.length > 0) return base;
  return `course-${Date.now()}`;
}
