/**
 * Tests for `app/api/stripe/webhook/route.ts`.
 *
 * Strategy:
 *   - Mock `@/lib/prisma` so the route runs against a fake Prisma client.
 *   - Mock `@/lib/stripe` so we can control `webhooks.constructEventAsync`
 *     and the signature verification behaviour.
 *   - Construct a minimal `Request` per scenario and call the exported
 *     `POST` handler directly.
 *   - Assert on status code and JSON body for each branch.
 *
 * Covered cases:
 *   - missing webhook secret  -> 400
 *   - missing stripe-signature -> 400
 *   - signature verification failure -> 400
 *   - `checkout.session.completed` with valid booking -> updates
 *     `paymentStatus` to PAID and `status` to CONFIRMED -> 200
 *   - `checkout.session.completed` with unknown booking -> 404
 *   - `checkout.session.expired` -> updates `paymentStatus` to FAILED -> 200
 *   - unhandled event type -> 200 with acknowledged receipt
 *   - handler-thrown error -> 500
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const prismaMock = vi.hoisted(() => {
  return {
    booking: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
});

const stripeMock = vi.hoisted(() => {
  return {
    constructEventAsync: vi.fn(),
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock, default: prismaMock }));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEventAsync: stripeMock.constructEventAsync,
    },
  },
  default: {
    webhooks: {
      constructEventAsync: stripeMock.constructEventAsync,
    },
  },
}));

// ---------------------------------------------------------------------------
// Imports (resolved after mocks are installed)
// ---------------------------------------------------------------------------

import { POST } from "@/app/api/stripe/webhook/route";

const URL = "https://example.test/api/stripe/webhook";
const SECRET = "whsec_test_secret";

function makeRequest(options: {
  body?: string;
  signature?: string | null;
} = {}): Request {
  const headers = new Headers();
  if (options.signature !== null && options.signature !== undefined) {
    headers.set("stripe-signature", options.signature);
  }
  return new Request(URL, {
    method: "POST",
    headers,
    body: options.body ?? "{}",
  });
}

function completedEvent(bookingId: string) {
  return {
    id: "evt_completed_1",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_1",
        client_reference_id: bookingId,
      },
    },
  };
}

function expiredEvent(bookingId: string) {
  return {
    id: "evt_expired_1",
    type: "checkout.session.expired",
    data: {
      object: {
        id: "cs_test_2",
        client_reference_id: bookingId,
      },
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.booking.findUnique.mockReset();
  prismaMock.booking.update.mockReset();
  stripeMock.constructEventAsync.mockReset();
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
});

describe("POST /api/stripe/webhook", () => {
  it("returns 400 when STRIPE_WEBHOOK_SECRET is not configured", async () => {
    const original = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    try {
      const response = await POST(
        makeRequest({ signature: "t=1,v1=abc" }),
      );
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("webhook not configured");
      expect(stripeMock.constructEventAsync).not.toHaveBeenCalled();
    } finally {
      process.env.STRIPE_WEBHOOK_SECRET = original;
    }
  });

  it("returns 400 when the stripe-signature header is missing", async () => {
    const response = await POST(makeRequest({ signature: null }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("missing signature");
    expect(stripeMock.constructEventAsync).not.toHaveBeenCalled();
  });

  it("returns 400 when signature verification fails", async () => {
    stripeMock.constructEventAsync.mockRejectedValueOnce(
      new Error("signature mismatch"),
    );
    const response = await POST(
      makeRequest({ body: '{"id":"evt_x"}', signature: "t=1,v1=bad" }),
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("invalid signature");
    expect(stripeMock.constructEventAsync).toHaveBeenCalledTimes(1);
    expect(prismaMock.booking.findUnique).not.toHaveBeenCalled();
  });

  it("marks booking as PAID and CONFIRMED on checkout.session.completed", async () => {
    stripeMock.constructEventAsync.mockResolvedValueOnce(
      completedEvent("booking-abc-123"),
    );
    prismaMock.booking.findUnique.mockResolvedValueOnce({
      id: "booking-abc-123",
      paymentStatus: "PENDING",
      status: "PENDING",
    });
    prismaMock.booking.update.mockResolvedValueOnce({
      id: "booking-abc-123",
      paymentStatus: "PAID",
      status: "CONFIRMED",
    });

    const response = await POST(
      makeRequest({ signature: "t=1,v1=good" }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.received).toBe(true);

    expect(prismaMock.booking.findUnique).toHaveBeenCalledWith({
      where: { id: "booking-abc-123" },
    });
    expect(prismaMock.booking.update).toHaveBeenCalledWith({
      where: { id: "booking-abc-123" },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
      },
    });
  });

  it("returns 404 when checkout.session.completed references an unknown booking", async () => {
    stripeMock.constructEventAsync.mockResolvedValueOnce(
      completedEvent("does-not-exist"),
    );
    prismaMock.booking.findUnique.mockResolvedValueOnce(null);

    const response = await POST(
      makeRequest({ signature: "t=1,v1=good" }),
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("booking not found");
    expect(prismaMock.booking.update).not.toHaveBeenCalled();
  });

  it("marks booking paymentStatus as FAILED on checkout.session.expired", async () => {
    stripeMock.constructEventAsync.mockResolvedValueOnce(
      expiredEvent("booking-abc-123"),
    );
    prismaMock.booking.findUnique.mockResolvedValueOnce({
      id: "booking-abc-123",
      paymentStatus: "PENDING",
      status: "PENDING",
    });
    prismaMock.booking.update.mockResolvedValueOnce({
      id: "booking-abc-123",
      paymentStatus: "FAILED",
      status: "PENDING",
    });

    const response = await POST(
      makeRequest({ signature: "t=1,v1=good" }),
    );

    expect(response.status).toBe(200);
    expect(prismaMock.booking.update).toHaveBeenCalledWith({
      where: { id: "booking-abc-123" },
      data: {
        paymentStatus: "FAILED",
      },
    });
    // status must NOT be touched on expiry.
    const updateCall = prismaMock.booking.update.mock.calls[0][0];
    expect(updateCall.data).not.toHaveProperty("status");
  });

  it("returns 404 when checkout.session.expired references an unknown booking", async () => {
    stripeMock.constructEventAsync.mockResolvedValueOnce(
      expiredEvent("does-not-exist"),
    );
    prismaMock.booking.findUnique.mockResolvedValueOnce(null);

    const response = await POST(
      makeRequest({ signature: "t=1,v1=good" }),
    );

    expect(response.status).toBe(404);
    expect(prismaMock.booking.update).not.toHaveBeenCalled();
  });

  it("returns 200 and does not touch the database for an unhandled event type", async () => {
    stripeMock.constructEventAsync.mockResolvedValueOnce({
      id: "evt_unhandled_1",
      type: "customer.created",
      data: { object: { id: "cus_1" } },
    });

    const response = await POST(
      makeRequest({ signature: "t=1,v1=good" }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.received).toBe(true);
    expect(prismaMock.booking.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.booking.update).not.toHaveBeenCalled();
  });

  it("returns 500 when the handler throws unexpectedly", async () => {
    stripeMock.constructEventAsync.mockResolvedValueOnce(
      completedEvent("booking-abc-123"),
    );
    // Booking lookup itself throws to simulate database failure.
    prismaMock.booking.findUnique.mockRejectedValueOnce(
      new Error("database down"),
    );

    const response = await POST(
      makeRequest({ signature: "t=1,v1=good" }),
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("handler failed");
    expect(prismaMock.booking.update).not.toHaveBeenCalled();
  });
});
