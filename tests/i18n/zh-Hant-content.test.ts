import { describe, it, expect } from "vitest";
import messages from "@/messages/zh-Hant.json";

describe("zh-Hant content translations", () => {
  it("has no long English passages in about milestones", () => {
    const bodies = messages.about.milestones.map((m: { body: string }) => m.body);
    const untranslated = bodies.filter((text) => /[a-zA-Z]{10,}/.test(text));
    expect(untranslated).toEqual([]);
  });

  it("has no long English passages in about FAQ answers", () => {
    const answers = messages.about.faqs.map((f: { answer: string }) => f.answer);
    const untranslated = answers.filter((text) => /[a-zA-Z]{10,}/.test(text));
    expect(untranslated).toEqual([]);
  });

  it("uses localized weekday names in contact hours", () => {
    expect(messages.contact.hours).not.toMatch(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/i);
    expect(messages.contact.hours).toContain("星期");
  });
});
