import { describe, it, expect } from "vitest";
import { formatPriceHkd, formatDuration } from "@/lib/format";

describe("formatPriceHkd", () => {
  it("formats cents as whole HKD with the HK$ symbol", () => {
    // 180000 cents -> HK$1,800
    expect(formatPriceHkd(180000)).toMatch(/^HK\$1,800$/);
  });

  it("rounds sub-dollar cents to the nearest dollar", () => {
    // 99950 cents rounds to HK$1,000 (rounding up from $999.50)
    expect(formatPriceHkd(99950)).toMatch(/^HK\$1,000$/);
  });

  it("formats zero as HK$0", () => {
    expect(formatPriceHkd(0)).toMatch(/^HK\$0$/);
  });

  it("formats large amounts with thousands separators", () => {
    // 12345600 cents -> HK$123,456
    expect(formatPriceHkd(12345600)).toMatch(/^HK\$123,456$/);
  });

  it("uses no decimal places (whole HKD only)", () => {
    const formatted = formatPriceHkd(150050);
    // Must not contain a decimal point.
    expect(formatted).not.toMatch(/\./);
  });
});

describe("formatDuration", () => {
  it("returns whole-hour label for exact multiples of 60", () => {
    expect(formatDuration(60)).toBe("1 hr");
    expect(formatDuration(120)).toBe("2 hr");
    expect(formatDuration(240)).toBe("4 hr");
  });

  it("returns one-decimal label for non-exact multiples", () => {
    expect(formatDuration(90)).toBe("1.5 hr");
    expect(formatDuration(30)).toBe("0.5 hr");
    expect(formatDuration(150)).toBe("2.5 hr");
  });

  it("returns null for zero", () => {
    expect(formatDuration(0)).toBeNull();
  });

  it("returns null for negative values", () => {
    expect(formatDuration(-30)).toBeNull();
  });

  it("returns null for nullish input", () => {
    expect(formatDuration(null)).toBeNull();
    expect(formatDuration(undefined)).toBeNull();
  });
});
