/**
 * Tests for `app/api/bookings/[id]/route.ts`.
 *
 * Strategy:
 *   - Mock `@/lib/prisma` so the route runs against a fake Prisma client.
 *   - Construct a minimal `Request` per scenario and call the exported
 *     `GET` handler directly with the route's `params`.
 *   - Assert on status code and JSON body for each branch:
 *       200 with full payload when id + email match
 *       401 when id matches but email does not
 *       400 when no email is provided
 *       404 when the booking id does not exist
 *       400 when the route param id is empty
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const prismaMock = vi.hoisted(() => {
  return {
    booking: {
      findUnique: vi.fn(),
    },
    availability: {
      findFirst: vi.fn(),
    },
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock, default: prismaMock }));

// ---------------------------------------------------------------------------
// Imports (resolved after mocks are installed)
// ---------------------------------------------------------------------------

import { GET } from "@/app/api/bookings/[id]/route";

const STORED_EMAIL = "alex" + "@" + "example.test";
const OTHER_EMAIL = "someone" + "@" + "other.test";
const URL_BASE = "https://example.test";

function buildBooking(
  overrides: Partial<{
    id: string;
    email: string;
    preferredDate: Date | null;
  }> = {},
) {
  const preferredDate =
    overrides.preferredDate !== undefined
      ? overrides.preferredDate
      : new Date("2026-04-15T10:00:00.000Z");
  return {
    id: overrides.id ?? "booking-abc-123",
    name: "Alex Lee",
    email: overrides.email ?? STORED_EMAIL,
    phone: "+852 1234 5678",
    status: "PENDING",
    paymentStatus: "PENDING",
    notes: null,
    preferredDate,
    createdAt: new Date("2026-04-01T00:00:00.000Z"),
    updatedAt: new Date("2026-04-01T00:00:00.000Z"),
    courseId: "course-1",
    course: {
      id: "course-1",
      title: "MFR Intensive",
      titleZh: "肌筋膜放鬆密集課程",
      price: 120000,
    },
  };
}

function makeRequest(id: string, email: string | null): Request {
  const url = email
    ? `${URL_BASE}/api/bookings/${id}?email=${encodeURIComponent(email)}`
    : `${URL_BASE}/api/bookings/${id}`;
  return new Request(url);
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.booking.findUnique.mockReset();
  prismaMock.availability.findFirst.mockReset();
});

describe("GET /api/bookings/[id]", () => {
  it("returns 200 with full booking details when id and email match", async () => {
    prismaMock.booking.findUnique.mockResolvedValueOnce(buildBooking());
    prismaMock.availability.findFirst.mockResolvedValueOnce({
      id: "slot-1",
      startDateTime: new Date("2026-04-15T10:00:00.000Z"),
      endDateTime: new Date("2026-04-15T11:00:00.000Z"),
      capacity: 8,
    });

    const response = await GET(makeRequest("booking-abc-123", STORED_EMAIL), {
      params: { id: "booking-abc-123" },
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.id).toBe("booking-abc-123");
    expect(body.name).toBe("Alex Lee");
    expect(body.email).toBe(STORED_EMAIL);
    expect(body.course.title).toBe("MFR Intensive");
    expect(body.availability).not.toBeNull();
    expect(body.availability.capacity).toBe(8);

    expect(prismaMock.booking.findUnique).toHaveBeenCalledWith({
      where: { id: "booking-abc-123" },
      include: { course: true },
    });
  });

  it("matches email case-insensitively after trimming", async () => {
    prismaMock.booking.findUnique.mockResolvedValueOnce(buildBooking());
    prismaMock.availability.findFirst.mockResolvedValueOnce(null);

    const response = await GET(
      makeRequest("booking-abc-123", `  ${STORED_EMAIL.toUpperCase()}  `),
      { params: { id: "booking-abc-123" } },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.id).toBe("booking-abc-123");
  });

  it("matches a mixed-case local part case-insensitively", async () => {
    const storedLower = STORED_EMAIL.toLowerCase();
    const storedUpperLocal =
      storedLower.split("@")[0].toUpperCase() + "@" + storedLower.split("@")[1];
    prismaMock.booking.findUnique.mockResolvedValueOnce(
      buildBooking({ email: storedUpperLocal }),
    );

    const response = await GET(
      makeRequest("booking-abc-123", storedLower),
      { params: { id: "booking-abc-123" } },
    );

    expect(response.status).toBe(200);
  });

  it("returns 401 when the supplied email does not match", async () => {
    prismaMock.booking.findUnique.mockResolvedValueOnce(buildBooking());

    const response = await GET(
      makeRequest("booking-abc-123", OTHER_EMAIL),
      { params: { id: "booking-abc-123" } },
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("unauthorized");
    // We must NOT have queried for the availability row before the
    // ownership check failed.
    expect(prismaMock.availability.findFirst).not.toHaveBeenCalled();
  });

  it("returns 400 when the email query param is missing", async () => {
    const response = await GET(makeRequest("booking-abc-123", null), {
      params: { id: "booking-abc-123" },
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("missing email");
    // We must NOT have touched the database for a missing-email request.
    expect(prismaMock.booking.findUnique).not.toHaveBeenCalled();
  });

  it("returns 400 when the email query param is whitespace only", async () => {
    const response = await GET(makeRequest("booking-abc-123", "   "), {
      params: { id: "booking-abc-123" },
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("missing email");
    expect(prismaMock.booking.findUnique).not.toHaveBeenCalled();
  });

  it("returns 404 when no booking matches the supplied id", async () => {
    prismaMock.booking.findUnique.mockResolvedValueOnce(null);

    const response = await GET(
      makeRequest("does-not-exist", STORED_EMAIL),
      { params: { id: "does-not-exist" } },
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("not found");
  });

  it("returns 400 when the route param id is empty", async () => {
    const response = await GET(makeRequest("", STORED_EMAIL), {
      params: { id: "" },
    });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("missing id");
  });

  it("omits the availability block when the booking has no preferredDate", async () => {
    prismaMock.booking.findUnique.mockResolvedValueOnce(
      buildBooking({ preferredDate: null }),
    );

    const response = await GET(makeRequest("booking-abc-123", STORED_EMAIL), {
      params: { id: "booking-abc-123" },
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.preferredDate).toBeNull();
    expect(body.availability).toBeNull();
    expect(prismaMock.availability.findFirst).not.toHaveBeenCalled();
  });
});
