import { describe, it, expect } from "vitest";
import { slugifyTitle } from "@/lib/utils/course-slug";

describe("slugifyTitle", () => {
  it("lowercases and replaces whitespace with hyphens", () => {
    expect(slugifyTitle("MFR Intensive")).toBe("mfr-intensive");
  });

  it("collapses consecutive whitespace into a single hyphen", () => {
    expect(slugifyTitle("MFR   Intensive")).toBe("mfr-intensive");
    expect(slugifyTitle("MFR\tIntensive")).toBe("mfr-intensive");
    expect(slugifyTitle("MFR\nIntensive")).toBe("mfr-intensive");
  });

  it("strips characters that are not [a-z0-9-]", () => {
    expect(slugifyTitle("MFR: A Hands-On Guide!")).toBe("mfr-a-hands-on-guide");
    expect(slugifyTitle("Price @ HK$1,800")).toBe("price-hk1800");
  });

  it("collapses repeated hyphens", () => {
    expect(slugifyTitle("a -- b")).toBe("a-b");
    expect(slugifyTitle("a - - - b")).toBe("a-b");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugifyTitle("---hello---")).toBe("hello");
    expect(slugifyTitle("   hello   ")).toBe("hello");
  });

  it("truncates to a maximum length of 80 characters", () => {
    const long = "a".repeat(120);
    expect(slugifyTitle(long).length).toBe(80);
  });

  it("falls back to a timestamp-based slug when the cleaned title is empty", () => {
    const out = slugifyTitle("!@#$%");
    expect(out).toMatch(/^course-\d+$/);
  });

  it("returns a timestamp-based slug for an empty input string", () => {
    const out = slugifyTitle("");
    expect(out).toMatch(/^course-\d+$/);
  });

  it("preserves digits within the title", () => {
    expect(slugifyTitle("Top 10 Stretches")).toBe("top-10-stretches");
  });

  it("handles titles with mixed CJK characters by stripping them", () => {
    // The slugifier is ASCII-only by design; CJK is removed.
    expect(slugifyTitle("筋膜放鬆 101")).toBe("101");
  });
});
