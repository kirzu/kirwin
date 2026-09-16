/**
 * Format a HKD price stored in cents (e.g. 180000 -> "HK$1,800").
 * We render as a whole-HKD amount so the listing reads naturally; sub-dollar
 * precision is intentionally omitted because seminars are priced in round
 * HKD figures. The currency is hard-coded to HKD because all courses ship
 * from Hong Kong.
 */
export function formatPriceHkd(cents: number): string {
  const dollars = Math.round(cents / 100);
  return new Intl.NumberFormat("en-HK", {
    style: "currency",
    currency: "HKD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars);
}

/**
 * Format a duration in minutes as a short human-readable label, e.g.
 * 240 -> "4 hr", 90 -> "1.5 hr", 60 -> "1 hr". Returns null when no
 * meaningful duration is available so the UI can fall back to a TBA copy.
 */
export function formatDuration(minutes: number | null | undefined): string | null {
  if (!minutes || minutes <= 0) return null;
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hr`;
  }
  return `${(minutes / 60).toFixed(1)} hr`;
}
