/**
 * Tests for the Stripe Checkout session creation flow.
 *
 * Two units under test:
 *   1. `createCheckoutSession` server action (`lib/actions/booking.ts`).
 *      We mock `@/lib/prisma` and `@/lib/stripe` so the real action runs
 *      against fake collaborators and we can drive every branch.
 *   2. `PaymentButton` client component (`components/payment-button.tsx`).
 *      The project runs Vitest in `environment: "node"`, so we render
 *      with `react-dom/server` and stub `next-intl`. We replace the
 *      server-action import via `vi.spyOn` on the module after import.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// ---------------------------------------------------------------------------
// Module mocks (vi.mock is hoisted).
// ---------------------------------------------------------------------------

const prismaMock = vi.hoisted(() => {
  return {
    booking: {
      findUnique: vi.fn(),
    },
  };
});

const stripeMock = vi.hoisted(() => {
  return {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock, default: prismaMock }));

vi.mock("@/lib/stripe", () => ({
  stripe: stripeMock,
  default: stripeMock,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    ...rest
  }: {
    children?: ReactNode;
    onClick?: (event: unknown) => void;
    disabled?: boolean;
  } & Record<string, unknown>) =>
    createElement(
      "button",
      { ...rest, disabled, onClick: onClick ? () => onClick({}) : undefined },
      children,
    ),
}));

// ---------------------------------------------------------------------------
// Imports (resolved after mocks are installed)
// ---------------------------------------------------------------------------

import { createCheckoutSession } from "@/lib/actions/booking";
import { PaymentButton } from "@/components/payment-button";

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXTAUTH_URL = "https://example.test";
  prismaMock.booking.findUnique.mockReset();
  stripeMock.checkout.sessions.create.mockReset();
});

function buildPendingBooking(overrides: Partial<{
  id: string;
  email: string;
  paymentStatus: string;
  price: number;
}> = {}) {
  return {
    id: overrides.id ?? "booking-abc",
    courseId: "course-1",
    name: "Alex",
    email: overrides.email ?? "alex@example.com",
    phone: "+852 1234 5678",
    status: "PENDING",
    paymentStatus: overrides.paymentStatus ?? "PENDING",
    notes: null,
    preferredDate: new Date("2026-04-15T10:00:00.000Z"),
    createdAt: new Date("2026-04-01T00:00:00.000Z"),
    updatedAt: new Date("2026-04-01T00:00:00.000Z"),
    course: {
      id: "course-1",
      title: "MFR Intensive",
      titleZh: "肌筋膜放鬆密集課程",
      price: overrides.price ?? 120000,
    },
    availability: {
      id: "slot-1",
      startDateTime: new Date("2026-04-15T10:00:00.000Z"),
    },
  };
}

// ===========================================================================
// Server action tests (uses real action, mocked deps)
// ===========================================================================

describe("createCheckoutSession - validation", () => {
  it("returns missingFields when bookingId is empty", async () => {
    const result = await createCheckoutSession({
      bookingId: "",
      email: "alex@example.com",
      locale: "en",
    });
    expect(result).toEqual({ status: "error", code: "missingFields" });
    expect(prismaMock.booking.findUnique).not.toHaveBeenCalled();
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("returns missingFields when email is empty", async () => {
    const result = await createCheckoutSession({
      bookingId: "booking-abc",
      email: "",
      locale: "en",
    });
    expect(result).toEqual({ status: "error", code: "missingFields" });
    expect(prismaMock.booking.findUnique).not.toHaveBeenCalled();
  });

  it("returns invalidLocale when locale is unsupported", async () => {
    const result = await createCheckoutSession({
      bookingId: "booking-abc",
      email: "alex@example.com",
      locale: "fr",
    });
    expect(result).toEqual({ status: "error", code: "invalidLocale" });
    expect(prismaMock.booking.findUnique).not.toHaveBeenCalled();
  });
});

describe("createCheckoutSession - booking lookup", () => {
  it("returns bookingNotFound when no row matches the supplied id", async () => {
    prismaMock.booking.findUnique.mockResolvedValueOnce(null);
    const result = await createCheckoutSession({
      bookingId: "missing",
      email: "alex@example.com",
      locale: "en",
    });
    expect(result).toEqual({ status: "error", code: "bookingNotFound" });
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("returns bookingNotFound when the email does not match", async () => {
    prismaMock.booking.findUnique.mockResolvedValueOnce(
      buildPendingBooking({ email: "someone-else@example.com" }),
    );
    const result = await createCheckoutSession({
      bookingId: "booking-abc",
      email: "alex@example.com",
      locale: "en",
    });
    expect(result).toEqual({ status: "error", code: "bookingNotFound" });
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("returns invalidPaymentStatus when paymentStatus is not PENDING", async () => {
    prismaMock.booking.findUnique.mockResolvedValueOnce(
      buildPendingBooking({ paymentStatus: "PAID" }),
    );
    const result = await createCheckoutSession({
      bookingId: "booking-abc",
      email: "alex@example.com",
      locale: "en",
    });
    expect(result).toEqual({ status: "error", code: "invalidPaymentStatus" });
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("returns invalidPrice when course price is zero", async () => {
    prismaMock.booking.findUnique.mockResolvedValueOnce(
      buildPendingBooking({ price: 0 }),
    );
    const result = await createCheckoutSession({
      bookingId: "booking-abc",
      email: "alex@example.com",
      locale: "en",
    });
    expect(result).toEqual({ status: "error", code: "invalidPrice" });
    expect(stripeMock.checkout.sessions.create).not.toHaveBeenCalled();
  });

  it("returns invalidPrice when course price is negative", async () => {
    prismaMock.booking.findUnique.mockResolvedValueOnce(
      buildPendingBooking({ price: -1 }),
    );
    const result = await createCheckoutSession({
      bookingId: "booking-abc",
      email: "alex@example.com",
      locale: "en",
    });
    expect(result).toEqual({ status: "error", code: "invalidPrice" });
  });
});

describe("createCheckoutSession - happy path", () => {
  it("creates a Stripe session and returns its url", async () => {
    prismaMock.booking.findUnique.mockResolvedValueOnce(buildPendingBooking());
    stripeMock.checkout.sessions.create.mockResolvedValueOnce({
      id: "cs_test_1",
      url: "https://stripe.test/cs_test_1",
    });

    const result = await createCheckoutSession({
      bookingId: "booking-abc",
      email: "alex@example.com",
      locale: "en",
    });

    expect(result).toEqual({
      status: "success",
      url: "https://stripe.test/cs_test_1",
    });
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledTimes(1);

    const call = stripeMock.checkout.sessions.create.mock.calls[0][0];
    expect(call.payment_method_types).toEqual(["card"]);
    expect(call.mode).toBe("payment");
    expect(call.client_reference_id).toBe("booking-abc");
    expect(call.customer_email).toBe("alex@example.com");
    expect(call.success_url).toBe(
      "https://example.test/en/payment/success?bookingId=booking-abc&email=alex%40example.com",
    );
    expect(call.cancel_url).toBe(
      "https://example.test/en/payment/cancel?bookingId=booking-abc&email=alex%40example.com",
    );
    expect(call.line_items).toHaveLength(1);
    const item = call.line_items[0];
    expect(item.quantity).toBe(1);
    expect(item.price_data.currency).toBe("hkd");
    expect(item.price_data.unit_amount).toBe(120000);
    expect(item.price_data.product_data.name).toBe("MFR Intensive");
  });

  it("builds zh-Hant localised return URLs and product name", async () => {
    prismaMock.booking.findUnique.mockResolvedValueOnce(buildPendingBooking());
    stripeMock.checkout.sessions.create.mockResolvedValueOnce({
      id: "cs_test_2",
      url: "https://stripe.test/cs_test_2",
    });

    await createCheckoutSession({
      bookingId: "booking-abc",
      email: "alex@example.com",
      locale: "zh-Hant",
    });

    const call = stripeMock.checkout.sessions.create.mock.calls[0][0];
    expect(call.success_url).toBe(
      "https://example.test/zh-Hant/payment/success?bookingId=booking-abc&email=alex%40example.com",
    );
    expect(call.cancel_url).toBe(
      "https://example.test/zh-Hant/payment/cancel?bookingId=booking-abc&email=alex%40example.com",
    );
    expect(call.line_items[0].price_data.product_data.name).toBe(
      "肌筋膜放鬆密集課程 (MFR Intensive)",
    );
  });

  it("returns generic error when Stripe omits the url", async () => {
    prismaMock.booking.findUnique.mockResolvedValueOnce(buildPendingBooking());
    stripeMock.checkout.sessions.create.mockResolvedValueOnce({
      id: "cs_test_3",
      url: null,
    });

    const result = await createCheckoutSession({
      bookingId: "booking-abc",
      email: "alex@example.com",
      locale: "en",
    });
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.code).toBe("generic");
    }
  });

  it("returns generic error when the Stripe SDK throws", async () => {
    prismaMock.booking.findUnique.mockResolvedValueOnce(buildPendingBooking());
    stripeMock.checkout.sessions.create.mockRejectedValueOnce(
      new Error("stripe unavailable"),
    );
    const result = await createCheckoutSession({
      bookingId: "booking-abc",
      email: "alex@example.com",
      locale: "en",
    });
    expect(result).toEqual({
      status: "error",
      code: "generic",
      message: "stripe unavailable",
    });
  });

  it("returns generic error with fallback message when a non-Error is thrown", async () => {
    prismaMock.booking.findUnique.mockResolvedValueOnce(buildPendingBooking());
    stripeMock.checkout.sessions.create.mockRejectedValueOnce("boom");
    const result = await createCheckoutSession({
      bookingId: "booking-abc",
      email: "alex@example.com",
      locale: "en",
    });
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.code).toBe("generic");
      expect(result.message).toBe("Unexpected error");
    }
  });
});

// ===========================================================================
// Component tests
// ===========================================================================

describe("PaymentButton", () => {
  it("renders the localised CTA label and forwards props through to a button", () => {
    const html = renderToStaticMarkup(
      createElement(PaymentButton, {
        bookingId: "booking-abc",
        email: "alex@example.com",
        locale: "en",
        courseTitle: "MFR Intensive",
        amount: 120000,
        currency: "hkd",
      }),
    );
    // next-intl stub returns the key path as the label.
    expect(html).toContain("cta");
    expect(html).toContain('data-testid="payment-button"');
  });

  it("renders disabled state when disabled prop is true", () => {
    const html = renderToStaticMarkup(
      createElement(PaymentButton, {
        bookingId: "booking-abc",
        email: "alex@example.com",
        locale: "en",
        courseTitle: "MFR Intensive",
        amount: 120000,
        currency: "hkd",
        disabled: true,
      }),
    );
    expect(html).toMatch(/<button[^>]*disabled/);
  });

  it("renders in the Chinese locale without throwing", () => {
    const html = renderToStaticMarkup(
      createElement(PaymentButton, {
        bookingId: "booking-abc",
        email: "alex@example.com",
        locale: "zh-Hant",
        courseTitle: "肌筋膜放鬆密集課程",
        amount: 120000,
        currency: "hkd",
      }),
    );
    expect(html).toContain("cta");
    expect(html).toContain('data-testid="payment-button"');
  });
});
