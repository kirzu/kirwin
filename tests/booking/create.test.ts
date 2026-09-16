import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Tests for `createBooking` server action in `lib/actions/booking.ts`.
 *
 * Strategy: mock `@/lib/prisma` so that the `$transaction` callback can be
 * invoked with a fake transaction client. We do not care about real SQL
 * here — only that the action correctly:
 *   - validates input (locale / fields / email / phone)
 *   - atomically increments bookedCount (via $executeRaw)
 *   - creates a Booking row with PENDING status
 *   - revalidates the right paths
 *   - returns the right error codes on each failure mode
 */

// ---------------------------------------------------------------------------
// Module mocks (vi.mock is hoisted so they install before any import below).
// ---------------------------------------------------------------------------

type TxMock = {
  $executeRaw: ReturnType<typeof vi.fn>;
  booking: { create: ReturnType<typeof vi.fn> };
  availability: { findUnique: ReturnType<typeof vi.fn> };
};

function createTxMock(): TxMock {
  return {
    $executeRaw: vi.fn(),
    booking: { create: vi.fn() },
    availability: { findUnique: vi.fn() },
  };
}

const tx = createTxMock();

vi.mock("@/lib/prisma", () => {
  const mock = {
    $transaction: vi.fn(async (cb: (tx: TxMock) => unknown) => cb(tx)),
    course: { findUnique: vi.fn() },
  };
  return { prisma: mock, default: mock };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createBooking } from "@/lib/actions/booking";

const mockedPrisma = prisma as unknown as {
  $transaction: ReturnType<typeof vi.fn>;
  course: { findUnique: ReturnType<typeof vi.fn> };
};
const mockedRevalidate = revalidatePath as unknown as ReturnType<typeof vi.fn>;

function fd(entries: Record<string, string | null>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) {
    if (v !== null) f.append(k, v);
  }
  return f;
}

const validForm = (): FormData =>
  fd({
    locale: "en",
    courseId: "course-1",
    availabilityId: "slot-1",
    name: "Alex Lee",
    email: "alex@example.com",
    phone: "+852 1234 5678",
    notes: "Looking forward to it.",
  });

beforeEach(() => {
  vi.clearAllMocks();
  tx.$executeRaw.mockResolvedValue(1);
  tx.availability.findUnique.mockResolvedValue({
    startDateTime: new Date("2026-04-15T10:00:00.000Z"),
  });
  tx.booking.create.mockResolvedValue({ id: "booking-abc" });
  mockedPrisma.course.findUnique.mockResolvedValue({ slug: "mfr-intensive" });
});

describe("createBooking - validation", () => {
  it("returns invalidLocale when locale is missing", async () => {
    const result = await createBooking(
      fd({
        courseId: "course-1",
        availabilityId: "slot-1",
        name: "Alex",
        email: "alex@example.com",
        phone: "+852 1234 5678",
      }),
    );
    expect(result).toEqual({ status: "error", code: "invalidLocale" });
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("returns invalidLocale when locale is unsupported", async () => {
    const result = await createBooking(
      fd({
        locale: "fr",
        courseId: "course-1",
        availabilityId: "slot-1",
        name: "Alex",
        email: "alex@example.com",
        phone: "+852 1234 5678",
      }),
    );
    expect(result).toEqual({ status: "error", code: "invalidLocale" });
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("returns missingFields when courseId is missing", async () => {
    const form = validForm();
    form.delete("courseId");
    const result = await createBooking(form);
    expect(result).toEqual({ status: "error", code: "missingFields" });
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("returns missingFields when availabilityId is missing", async () => {
    const form = validForm();
    form.delete("availabilityId");
    const result = await createBooking(form);
    expect(result).toEqual({ status: "error", code: "missingFields" });
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("returns missingFields when name is missing", async () => {
    const form = validForm();
    form.delete("name");
    const result = await createBooking(form);
    expect(result).toEqual({ status: "error", code: "missingFields" });
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("returns missingFields when email is missing", async () => {
    const form = validForm();
    form.delete("email");
    const result = await createBooking(form);
    expect(result).toEqual({ status: "error", code: "missingFields" });
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("returns missingFields when phone is missing", async () => {
    const form = validForm();
    form.delete("phone");
    const result = await createBooking(form);
    expect(result).toEqual({ status: "error", code: "missingFields" });
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("returns invalidEmail when email format is bad", async () => {
    const result = await createBooking(
      fd({
        locale: "en",
        courseId: "course-1",
        availabilityId: "slot-1",
        name: "Alex",
        email: "not-an-email",
        phone: "+852 1234 5678",
      }),
    );
    expect(result).toEqual({ status: "error", code: "invalidEmail" });
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("returns invalidPhone when phone is too short", async () => {
    const result = await createBooking(
      fd({
        locale: "en",
        courseId: "course-1",
        availabilityId: "slot-1",
        name: "Alex",
        email: "alex@example.com",
        phone: "123",
      }),
    );
    expect(result).toEqual({ status: "error", code: "invalidPhone" });
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });
});

describe("createBooking - happy path", () => {
  it("atomically increments bookedCount, creates a PENDING booking, and revalidates paths", async () => {
    const result = await createBooking(validForm());

    expect(result).toEqual({ status: "success", bookingId: "booking-abc" });

    // The transaction callback ran exactly once.
    expect(mockedPrisma.$transaction).toHaveBeenCalledOnce();
    // The atomic seat reservation executed against the transaction client.
    expect(tx.$executeRaw).toHaveBeenCalledOnce();
    // The availability row is fetched inside the transaction so the
    // preferredDate is recorded on the new booking.
    expect(tx.availability.findUnique).toHaveBeenCalledWith({
      where: { id: "slot-1" },
      select: { startDateTime: true },
    });
    // Booking created inside the transaction with PENDING defaults and the
    // preferredDate copied from the availability row.
    expect(tx.booking.create).toHaveBeenCalledWith({
      data: {
        courseId: "course-1",
        name: "Alex Lee",
        email: "alex@example.com",
        phone: "+852 1234 5678",
        status: "PENDING",
        paymentStatus: "PENDING",
        notes: "Looking forward to it.",
        preferredDate: new Date("2026-04-15T10:00:00.000Z"),
      },
      select: { id: true },
    });

    // Course slug fetched for revalidation.
    expect(mockedPrisma.course.findUnique).toHaveBeenCalledWith({
      where: { id: "course-1" },
      select: { slug: true },
    });

    // All three locale-aware paths revalidated.
    expect(mockedRevalidate).toHaveBeenCalledWith("/en/courses");
    expect(mockedRevalidate).toHaveBeenCalledWith(
      "/en/courses/mfr-intensive",
    );
    expect(mockedRevalidate).toHaveBeenCalledWith("/en/admin/bookings");
  });

  it("treats empty notes as null", async () => {
    const form = validForm();
    form.set("notes", "");
    const result = await createBooking(form);
    expect(result).toEqual({ status: "success", bookingId: "booking-abc" });
    expect(tx.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ notes: null }),
      }),
    );
  });

  it("works in zh-Hant and revalidates locale-prefixed paths", async () => {
    const form = validForm();
    form.set("locale", "zh-Hant");
    mockedPrisma.course.findUnique.mockResolvedValue({ slug: "mfr" });

    const result = await createBooking(form);
    expect(result).toEqual({ status: "success", bookingId: "booking-abc" });
    expect(mockedRevalidate).toHaveBeenCalledWith("/zh-Hant/courses");
    expect(mockedRevalidate).toHaveBeenCalledWith("/zh-Hant/courses/mfr");
    expect(mockedRevalidate).toHaveBeenCalledWith("/zh-Hant/admin/bookings");
  });

  it("falls back to null preferredDate when the availability row cannot be found", async () => {
    tx.availability.findUnique.mockResolvedValueOnce(null);
    const result = await createBooking(validForm());
    expect(result).toEqual({ status: "success", bookingId: "booking-abc" });
    expect(tx.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ preferredDate: null }),
      }),
    );
  });
});

describe("createBooking - capacity failures", () => {
  it("returns noSeats when the atomic increment finds zero rows", async () => {
    tx.$executeRaw.mockResolvedValue(0);
    const result = await createBooking(validForm());

    expect(result).toEqual({ status: "error", code: "noSeats" });
    // No booking was created, no slug lookup, no revalidation.
    expect(tx.booking.create).not.toHaveBeenCalled();
    expect(mockedPrisma.course.findUnique).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("returns noSeats when availability row already has bookedCount == capacity", async () => {
    // Realistic emulation of the SQL guard failing because the slot is full.
    tx.$executeRaw.mockResolvedValue(0);
    const result = await createBooking(validForm());
    expect(result).toEqual({ status: "error", code: "noSeats" });
    expect(tx.booking.create).not.toHaveBeenCalled();
  });
});

describe("createBooking - error handling", () => {
  it("returns generic error when the transaction throws", async () => {
    mockedPrisma.$transaction.mockRejectedValueOnce(
      new Error("Database unavailable"),
    );
    const result = await createBooking(validForm());
    expect(result).toEqual({
      status: "error",
      code: "generic",
      message: "Database unavailable",
    });
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("returns generic error with fallback message when a non-Error is thrown", async () => {
    mockedPrisma.$transaction.mockRejectedValueOnce("boom");
    const result = await createBooking(validForm());
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.code).toBe("generic");
      expect(result.message).toBe("Unexpected error");
    }
  });
});
