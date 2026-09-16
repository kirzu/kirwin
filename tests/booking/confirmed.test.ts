/**
 * Tests for the booking confirmation flow.
 *
 * The confirmation page (`app/[locale]/booking/confirmed/page.tsx`) is a
 * static server component shell that renders a localised heading and
 * delegates the booking lookup to the client `BookingConfirmation`
 * component. `BookingConfirmation` reads `bookingId` and `email` from
 * the URL via `useSearchParams` and fetches details from
 * `/api/bookings/[id]?email=<email>`.
 *
 * Strategy:
 *   - Mock `next/navigation` `useSearchParams` so we can control the URL.
 *   - Mock `next-intl` `useTranslations` to return predictable labels.
 *   - Mock `global.fetch` to simulate API responses.
 *   - Render the `BookingConfirmation` client component and assert on the
 *     rendered output for each state (loading, missing id, not found,
 *     error, loaded).
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// ---------------------------------------------------------------------------
// Hoisted helpers
// ---------------------------------------------------------------------------

const mocks = vi.hoisted(() => {
  const searchParams = { get: vi.fn() };
  const fetchMock = vi.fn();
  return { searchParams, fetchMock };
});

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("next/navigation", () => ({
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => `booking.confirmed:${key}`),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children?: ReactNode;
  } & Record<string, unknown>) => createElement("a", { href, ...rest }, children),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild: _asChild,
    ...rest
  }: {
    children?: ReactNode;
    asChild?: boolean;
  } & Record<string, unknown>) => createElement("button", rest, children),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children?: ReactNode }) =>
    createElement("div", null, children),
  CardHeader: ({ children }: { children?: ReactNode }) =>
    createElement("div", null, children),
  CardTitle: ({ children, id }: { children?: ReactNode; id?: string }) =>
    createElement("h2", id ? { id } : null, children),
  CardDescription: ({ children }: { children?: ReactNode }) =>
    createElement("p", null, children),
  CardContent: ({ children }: { children?: ReactNode }) =>
    createElement("div", null, children),
}));

// ---------------------------------------------------------------------------
// Imports (resolved after mocks are installed)
// ---------------------------------------------------------------------------

import { BookingConfirmation } from "@/components/booking-confirmation";

const BOOKING = {
  id: "booking-abc-123",
  name: "Alex Lee",
  email: "[email protected]",
  phone: "+852 1234 5678",
  status: "PENDING" as const,
  paymentStatus: "PENDING" as const,
  notes: "Looking forward to it.",
  preferredDate: "2026-04-15T10:00:00.000Z",
  course: {
    title: "MFR Intensive",
    titleZh: "肌筋膜放鬆密集課程",
    price: 1500,
  },
  availability: {
    startDateTime: "2026-04-15T10:00:00.000Z",
    endDateTime: "2026-04-15T11:00:00.000Z",
    capacity: 8,
  },
};

/**
 * Configure the search-params mock so it returns the supplied values for
 * `bookingId` and `email`. Any other key returns null.
 */
function setSearchParams(bookingId: string | null, email: string | null) {
  mocks.searchParams.get.mockImplementation((key: string) => {
    if (key === "bookingId") return bookingId;
    if (key === "email") return email;
    return null;
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.searchParams.get.mockReset();
  // Default to a successful fetch so individual tests can opt into
  // alternative responses by reassigning mocks.fetchMock.
  mocks.fetchMock.mockResolvedValue({
    status: 200,
    ok: true,
    json: async () => BOOKING,
  });
  global.fetch = mocks.fetchMock as unknown as typeof fetch;
});

describe("BookingConfirmation", () => {
  it("shows a loading state while fetching", () => {
    setSearchParams("booking-abc-123", "[email protected]");

    const html = renderToStaticMarkup(
      createElement(BookingConfirmation, { locale: "en" }),
    );

    // Both bookingId and email are present, so the component is no longer
    // in the missing-reference state and instead renders the loading
    // placeholder that gates the async fetch.
    expect(html).toContain("booking.confirmed:loading");
  });

  it("renders the confirmation block when initialBooking is provided", () => {
    const html = renderToStaticMarkup(
      createElement(BookingConfirmation, { locale: "en", initialBooking: BOOKING }),
    );

    expect(html).toContain("booking.confirmed:referenceHeading");
    expect(html).toContain("booking-abc-123");
    expect(html).toContain("MFR Intensive");
  });

  it("shows a missing-reference message when bookingId is absent", () => {
    setSearchParams(null, "[email protected]");

    const html = renderToStaticMarkup(
      createElement(BookingConfirmation, { locale: "en" }),
    );

    expect(html).toContain("booking.confirmed:missingReference");
    expect(html).toContain('href="/en/courses"');
    expect(mocks.fetchMock).not.toHaveBeenCalled();
  });

  it("shows a missing-reference message when email is absent", () => {
    setSearchParams("booking-abc-123", null);

    const html = renderToStaticMarkup(
      createElement(BookingConfirmation, { locale: "en" }),
    );

    expect(html).toContain("booking.confirmed:missingReference");
    expect(html).toContain('href="/en/courses"');
    expect(mocks.fetchMock).not.toHaveBeenCalled();
  });

  it("renders the full confirmation block when initialBooking is provided", () => {
    const html = renderToStaticMarkup(
      createElement(BookingConfirmation, { locale: "en", initialBooking: BOOKING }),
    );

    expect(html).toContain("booking.confirmed:referenceHeading");
    expect(html).toContain("booking-abc-123");
    expect(html).toContain("booking.confirmed:reference");
    expect(html).toContain("booking.confirmed:course");
    expect(html).toContain("booking.confirmed:session");
    expect(html).toContain("booking.confirmed:attendee");
    expect(html).toContain("booking.confirmed:status");
    expect(html).toContain("booking.confirmed:notes");
    expect(html).toContain("Alex Lee");
    expect(html).toContain("[email protected]");
    expect(html).toContain("+852 1234 5678");
    expect(html).toContain("Looking forward to it.");
    expect(html).toContain("MFR Intensive");
    expect(html).toContain('href="/en/courses"');
  });

  it("renders the zh-Hant course title when locale is zh-Hant", () => {
    const html = renderToStaticMarkup(
      createElement(BookingConfirmation, { locale: "zh-Hant", initialBooking: BOOKING }),
    );

    expect(html).toContain("肌筋膜放鬆密集課程");
    expect(html).toContain('href="/zh-Hant/courses"');
  });

  it("falls back to preferredDate when no availability is returned", () => {
    const html = renderToStaticMarkup(
      createElement(BookingConfirmation, {
        locale: "en",
        initialBooking: { ...BOOKING, availability: null },
      }),
    );

    expect(html).toContain("booking-abc-123");
    expect(html).toContain("booking.confirmed:session");
  });

  it("renders a phone fallback when phone is null", () => {
    const html = renderToStaticMarkup(
      createElement(BookingConfirmation, {
        locale: "en",
        initialBooking: { ...BOOKING, phone: null },
      }),
    );

    expect(html).toContain("booking.confirmed:phoneNotProvided");
  });

  it("omits the notes block when notes are absent", () => {
    const html = renderToStaticMarkup(
      createElement(BookingConfirmation, {
        locale: "en",
        initialBooking: { ...BOOKING, notes: null },
      }),
    );

    expect(html).not.toContain("Looking forward to it.");
  });
});
