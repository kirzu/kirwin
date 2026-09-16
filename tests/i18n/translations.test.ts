import { describe, expect, it } from "vitest";
import enMessages from "../../messages/en.json";
import zhHantMessages from "../../messages/zh-Hant.json";

type JsonObject = Record<string, unknown>;

/**
 * Flatten a nested JSON object into an array of dotted leaf paths and their
 * values. Arrays are traversed with bracketed indices (e.g. `items[0].title`)
 * so they can be diffed against the parallel locale file.
 */
function flatten(
  input: unknown,
  prefix = "",
  acc: Array<{ path: string; value: unknown }> = [],
): Array<{ path: string; value: unknown }> {
  if (input === null || input === undefined) return acc;
  if (Array.isArray(input)) {
    input.forEach((item, index) => {
      flatten(item, `${prefix}[${index}]`, acc);
    });
    return acc;
  }
  if (typeof input === "object") {
    for (const [key, value] of Object.entries(input as JsonObject)) {
      flatten(value, prefix ? `${prefix}.${key}` : key, acc);
    }
    return acc;
  }
  acc.push({ path: prefix, value: input });
  return acc;
}

function indexByPath(
  messages: JsonObject,
): Map<string, unknown> {
  const map = new Map<string, unknown>();
  for (const { path, value } of flatten(messages)) {
    map.set(path, value);
  }
  return map;
}

/**
 * Pairs of (English leaf, Chinese leaf) that are intentionally identical:
 * brand strings, contact details, ICU placeholders, and proper nouns that
 * should not be "translated".
 */
const IDENTICAL_ALLOWED: ReadonlySet<string> = new Set([
  "courses.durationValue", // ICU template "{duration}" — must remain identical.
  "courseDetail.durationValue", // ICU template "{duration}" — must remain identical.
  "courses.dayEyebrow", // ICU template "Day {day}" — locale-invariant prefix.
  "contact.phoneValue", // "+852 0000 0000" — phone number, locale-invariant.
  "contact.emailValue", // Email address — locale-invariant.
  "contact.instagramLabel", // "Instagram" — proper noun.
  "contact.instagramHandle", // "@stephenkirwin.bodywork" — handle.
  "contact.fields.emailPlaceholder", // "[email protected]" — example placeholder.
  "contact.fields.phonePlaceholder", // "+852 0000 0000" — phone placeholder.
  "about.bioCaption", // "Stephen Kirwin" — proper name.
  "courseDetail.instructorName", // "Stephen Kirwin" — proper name.
  "blog.instructorName", // "Stephen Kirwin" — proper name.
  "footer.copyright", // Brand + ICU template — intentionally identical.
  // Proper-noun brand strings in the new About / Courses sections.
  "about.partners[0]", // "Aman Spas" — brand.
  "about.partners[1]", // "Six Senses Spas" — brand.
  "about.partners[2]", // "Conrad Spa" — brand.
  "about.partners[3]", // "Kamalaya Wellness Sanctuary (Thailand)" — brand.
  "about.partners[4]", // "Atmanjai Detox" — brand.
  "about.partners[5]", // "Phuket Cleanse (Thailand)" — brand.
  "about.partners[6]", // "Zenaya Spa & Wellness (Belgium)" — brand.
  "about.partners[7]", // "The Sanctuary Wellness (Hong Kong)" — brand.
  "about.partners[8]", // "Atsumi Healing Spa" — brand.
  "about.partners[9]", // "Trisara Spa" — brand.
  "about.milestones[1].year", // "1995–1998" — date range.
  "about.milestones[2].year", // "1998–2005" — date range.
  "home.testimonials.fallbackQuote", // Real client quote — kept verbatim.
  "home.testimonials.fallbackName", // "Alex" — proper name.
]);

describe("i18n message catalogues", () => {
  const enLeaves = flatten(enMessages);
  const zhLeaves = flatten(zhHantMessages);

  it("has the same number of leaf keys in en and zh-Hant", () => {
    expect(zhLeaves.length).toBe(enLeaves.length);
  });

  it("contains every English key in zh-Hant", () => {
    const zhByPath = indexByPath(zhHantMessages as JsonObject);
    const missing = enLeaves
      .map((leaf) => leaf.path)
      .filter((path) => !zhByPath.has(path));
    expect(missing).toEqual([]);
  });

  it("does not introduce extra keys in zh-Hant that do not exist in en", () => {
    const enByPath = indexByPath(enMessages as JsonObject);
    const extra = zhLeaves
      .map((leaf) => leaf.path)
      .filter((path) => !enByPath.has(path));
    expect(extra).toEqual([]);
  });

  it("uses non-empty string values for every leaf in zh-Hant", () => {
    const offenders = zhLeaves.filter(
      (leaf) => typeof leaf.value !== "string" || (leaf.value as string).trim() === "",
    );
    expect(offenders).toEqual([]);
  });

  it("does not leave untranslated English values in zh-Hant leaves", () => {
    const enByPath = indexByPath(enMessages as JsonObject);
    const offending: Array<{ path: string; value: unknown }> = [];

    for (const leaf of zhLeaves) {
      if (IDENTICAL_ALLOWED.has(leaf.path)) continue;
      const enValue = enByPath.get(leaf.path);
      if (enValue === undefined) continue; // covered by the key-coverage test.
      if (typeof leaf.value !== "string") continue;
      if (typeof enValue !== "string") continue;
      if (leaf.value === enValue) {
        offending.push({ path: leaf.path, value: leaf.value });
      }
    }

    expect(offending).toEqual([]);
  });
});
