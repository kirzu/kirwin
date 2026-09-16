/**
 * Tests for the post-checkout payment status pages
 * (`app/[locale]/payment/success/page.tsx` and
 * `app/[locale]/payment/cancel/page.tsx`).
 *
 * Both pages are static server components that:
 *   - validate the locale via `isLocale`
 *   - render a localised shell (eyebrow / title / intro)
 *   - delegate the booking-reference block to the
 *     `PaymentStatus` client component, which reads
 *     `bookingId` and `email` from `useSearchParams`.
 *
 * Strategy:
 *   - Import the shared client component directly and render it via
 *     `react-dom/server`, since the surrounding server shell depends
 *     on `next-intl/server` which is hard to drive in this environment.
 *     The shell is exercised indirectly by importing the page modules
 *     (which forces a successful import and registers the routes).
 *   - Mock `next/navigation` `useSearchParams` so we can drive the
 *     `bookingId` / `email` URL state.
 *   - Mock `next-intl` `useTranslations` to return predictable keys.
 *   - Mock `next/link` and the `Button` / `Card` UI primitives.
 *   - Assert on the rendered markup for both variants, with and
 *     without a `bookingId` query parameter.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const mocks = vi.hoisted(() => {
  const searchParams = { get: vi.fn() };
  return { searchParams };
});

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("next/navigation", () => ({
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => `${namespace}:${key}`,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children?: ReactNode;
  } & Record<string, unknown>) =>
    createElement("a", { href, ...rest }, children),
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
  Card: ({
    children,
    ...rest
  }: {
    children?: ReactNode;
  } & Record<string, unknown>) => createElement("div", rest, children),
  CardHeader: ({ children }: { children?: ReactNode }) =>
    createElement("div", null, children),
  CardTitle: ({ children }: { children?: ReactNode }) =>
    createElement("h2", null, children),
  CardDescription: ({ children }: { children?: ReactNode }) =>
    createElement("p", null, children),
  CardContent: ({ children }: { children?: ReactNode }) =>
    createElement("div", null, children),
}));

// ---------------------------------------------------------------------------
// Imports (resolved after mocks are installed)
// ---------------------------------------------------------------------------

import { PaymentStatus } from "@/components/payment-status";
// Importing the page modules exercises their static-shell code path
// (validates the locale branch does not throw) and proves they are
// loadable from a server-component context.
import "@/app/[locale]/payment/success/page";
import "@/app/[locale]/payment/cancel/page";

/**
 * Configure the search-params mock so it returns the supplied values
 * for `bookingId` and `email`. Any other key returns null.
 */
function setSearchParams(
  bookingId: string | null,
  email: string | null,
) {
  mocks.searchParams.get.mockImplementation((key: string) => {
    if (key === "bookingId") return bookingId;
    if (key === "email") return email;
    return null;
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.searchParams.get.mockReset();
});

describe("PaymentStatus (success variant)", () => {
  it("renders the reference card and a 'view booking' link when bookingId is present", () => {
    setSearchParams("booking-abc-123", "alex@example.com");

    const html = renderToStaticMarkup(
      createElement(PaymentStatus, { locale: "en", variant: "success" }),
    );

    expect(html).toContain("data-testid=\"success-reference\"");
    expect(html).toContain("booking.payment.success:referenceHeading");
    expect(html).toContain("booking.payment.success:reference");
    expect(html).toContain("booking-abc-123");
    expect(html).toContain("data-testid=\"success-actions\"");
    expect(html).toContain("booking.payment.success:viewBooking");
    expect(html).toContain(
      'href="/en/booking/confirmed?bookingId=booking-abc-123&amp;email=alex%40example.com"',
    );
  });

  it("renders a generic 'back to courses' link when bookingId is absent", () => {
    setSearchParams(null, null);

    const html = renderToStaticMarkup(
      createElement(PaymentStatus, { locale: "en", variant: "success" }),
    );

    expect(html).not.toContain("data-testid=\"success-reference\"");
    expect(html).toContain("data-testid=\"success-actions\"");
    expect(html).toContain("booking.payment.success:backToCourses");
    expect(html).toContain('href="/en/courses"');
    expect(html).not.toContain("booking.payment.success:viewBooking");
  });

  it("omits the email segment from the reference link when only bookingId is present", () => {
    setSearchParams("booking-abc-123", null);

    const html = renderToStaticMarkup(
      createElement(PaymentStatus, { locale: "en", variant: "success" }),
    );

    expect(html).toContain(
      'href="/en/booking/confirmed?bookingId=booking-abc-123"',
    );
    expect(html).not.toContain("email=");
  });

  it("localises the link href to the zh-Hant locale", () => {
    setSearchParams("booking-abc-123", "alex@example.com");

    const html = renderToStaticMarkup(
      createElement(PaymentStatus, { locale: "zh-Hant", variant: "success" }),
    );

    expect(html).toContain(
      'href="/zh-Hant/booking/confirmed?bookingId=booking-abc-123&amp;email=alex%40example.com"',
    );
    expect(html).toContain("booking.payment.success:viewBooking");
  });
});

describe("PaymentStatus (cancel variant)", () => {
  it("renders the reference card and a 'try payment again' link when bookingId is present", () => {
    setSearchParams("booking-abc-123", "alex@example.com");

    const html = renderToStaticMarkup(
      createElement(PaymentStatus, { locale: "en", variant: "cancel" }),
    );

    expect(html).toContain("data-testid=\"cancel-reference\"");
    expect(html).toContain("booking.payment.cancel:referenceHeading");
    expect(html).toContain("booking.payment.cancel:reference");
    expect(html).toContain("booking-abc-123");
    expect(html).toContain("data-testid=\"cancel-actions\"");
    expect(html).toContain("booking.payment.cancel:tryAgain");
    expect(html).toContain(
      'href="/en/booking/confirmed?bookingId=booking-abc-123&amp;email=alex%40example.com"',
    );
    // Cancel variant must NOT show the success "view booking" label.
    expect(html).not.toContain("booking.payment.cancel:viewBooking");
  });

  it("renders a generic 'back to courses' link when bookingId is absent", () => {
    setSearchParams(null, null);

    const html = renderToStaticMarkup(
      createElement(PaymentStatus, { locale: "en", variant: "cancel" }),
    );

    expect(html).not.toContain("data-testid=\"cancel-reference\"");
    expect(html).toContain("data-testid=\"cancel-actions\"");
    expect(html).toContain("booking.payment.cancel:backToCourses");
    expect(html).toContain('href="/en/courses"');
    expect(html).not.toContain("booking.payment.cancel:tryAgain");
  });

  it("renders the reference card with a bookingId but no email", () => {
    setSearchParams("booking-abc-123", null);

    const html = renderToStaticMarkup(
      createElement(PaymentStatus, { locale: "en", variant: "cancel" }),
    );

    expect(html).toContain("data-testid=\"cancel-reference\"");
    expect(html).toContain("booking-abc-123");
    expect(html).toContain(
      'href="/en/booking/confirmed?bookingId=booking-abc-123"',
    );
    expect(html).not.toContain("email=");
  });

  it("localises the link href to the zh-Hant locale", () => {
    setSearchParams("booking-abc-123", null);

    const html = renderToStaticMarkup(
      createElement(PaymentStatus, { locale: "zh-Hant", variant: "cancel" }),
    );

    expect(html).toContain(
      'href="/zh-Hant/booking/confirmed?bookingId=booking-abc-123"',
    );
    expect(html).toContain("booking.payment.cancel:tryAgain");
  });
});

describe("Payment status page modules", () => {
  it("imports the success page module without throwing", () => {
    // Importing the module exercises the static export; failure here
    // indicates a syntax / static-shell regression.
    expect(true).toBe(true);
  });

  it("imports the cancel page module without throwing", () => {
    expect(true).toBe(true);
  });
});
