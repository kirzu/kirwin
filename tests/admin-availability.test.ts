import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the Prisma client module. Each test sets its own implementation on
// the mock functions below. vi.mock is hoisted so this replacement is in
// effect before any module-level imports run.
vi.mock("@/lib/prisma", () => {
  const mock = {
    availability: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    course: {
      findMany: vi.fn(),
    },
  };
  return { prisma: mock, default: mock };
});

// Mock next/cache (revalidatePath) and next/navigation (redirect) so the
// actions can be exercised without Next.js request context.
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`__redirect__:${url}`);
  }),
}));

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getAvailabilities,
  getAvailabilityById,
  createCourseAvailability,
  updateAvailability,
  deleteAvailability,
} from "@/lib/actions/availability";

const mockedPrisma = prisma as unknown as {
  availability: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};
const mockedRevalidate = revalidatePath as unknown as ReturnType<typeof vi.fn>;
const mockedRedirect = redirect as unknown as ReturnType<typeof vi.fn>;

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAvailabilities", () => {
  it("returns prisma.availability.findMany result with course included", async () => {
    const rows = [
      {
        id: "a1",
        courseId: "c1",
        startDateTime: new Date("2026-01-01T10:00:00Z"),
        endDateTime: new Date("2026-01-01T11:00:00Z"),
        capacity: 8,
        bookedCount: 0,
        isAvailable: true,
        course: { id: "c1", title: "MFR", slug: "mfr" },
      },
    ];
    mockedPrisma.availability.findMany.mockResolvedValue(rows);

    const result = await getAvailabilities();

    expect(result).toEqual(rows);
    expect(mockedPrisma.availability.findMany).toHaveBeenCalledWith({
      orderBy: { startDateTime: "asc" },
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
    });
  });

  it("returns empty array when no availability rows exist", async () => {
    mockedPrisma.availability.findMany.mockResolvedValue([]);
    const result = await getAvailabilities();
    expect(result).toEqual([]);
  });
});

describe("getAvailabilityById", () => {
  it("returns a single availability with course included", async () => {
    const row = {
      id: "a1",
      courseId: "c1",
      startDateTime: new Date("2026-01-01T10:00:00Z"),
      endDateTime: new Date("2026-01-01T11:00:00Z"),
      capacity: 8,
      bookedCount: 0,
      isAvailable: true,
      course: { id: "c1", title: "MFR", slug: "mfr" },
    };
    mockedPrisma.availability.findUnique.mockResolvedValue(row);

    const result = await getAvailabilityById("a1");

    expect(result).toEqual(row);
    expect(mockedPrisma.availability.findUnique).toHaveBeenCalledWith({
      where: { id: "a1" },
      include: {
        course: {
          select: { id: true, title: true, slug: true },
        },
      },
    });
  });

  it("returns null when no availability matches the id", async () => {
    mockedPrisma.availability.findUnique.mockResolvedValue(null);
    const result = await getAvailabilityById("missing");
    expect(result).toBeNull();
    expect(mockedPrisma.availability.findUnique).toHaveBeenCalledWith({
      where: { id: "missing" },
      include: expect.any(Object),
    });
  });
});

describe("createCourseAvailability", () => {
  it("creates an availability and redirects to locale-aware admin list", async () => {
    mockedPrisma.availability.create.mockResolvedValue({
      course: { slug: "mfr-intensive" },
    });
    const form = fd({
      courseId: "c1",
      startDateTime: "2026-01-01T10:00:00Z",
      endDateTime: "2026-01-01T11:00:00Z",
      capacity: "8",
      isAvailable: "true",
      locale: "en",
    });

    await expect(createCourseAvailability(form)).rejects.toThrow(
      /__redirect__:\/en\/admin\/availability/,
    );

    expect(mockedPrisma.availability.create).toHaveBeenCalledOnce();
    expect(mockedPrisma.availability.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          courseId: "c1",
          capacity: 8,
          bookedCount: 0,
          isAvailable: true,
        }),
        include: { course: { select: { slug: true } } },
      }),
    );
    expect(mockedRevalidate).toHaveBeenCalledWith("/en/admin/availability");
    expect(mockedRevalidate).toHaveBeenCalledWith("/en/courses");
    expect(mockedRevalidate).toHaveBeenCalledWith("/en/courses/mfr-intensive");
    expect(mockedRedirect).toHaveBeenCalledWith("/en/admin/availability");
  });

  it("revalidates /courses/[slug] only when the related course exposes a slug", async () => {
    mockedPrisma.availability.create.mockResolvedValue({
      course: { slug: "another-course" },
    });
    const form = fd({
      courseId: "c1",
      startDateTime: "2026-02-01T10:00:00Z",
      endDateTime: "2026-02-01T11:00:00Z",
      capacity: "5",
      isAvailable: "on",
      locale: "zh-Hant",
    });

    await expect(createCourseAvailability(form)).rejects.toThrow(
      /__redirect__:\/zh-Hant\/admin\/availability/,
    );

    expect(mockedRevalidate).toHaveBeenCalledWith("/zh-Hant/admin/availability");
    expect(mockedRevalidate).toHaveBeenCalledWith("/zh-Hant/courses");
    expect(mockedRevalidate).toHaveBeenCalledWith("/zh-Hant/courses/another-course");
  });

  it("returns error when courseId is missing and does not create", async () => {
    const result = await createCourseAvailability(
      fd({
        startDateTime: "2026-01-01T10:00:00Z",
        endDateTime: "2026-01-01T11:00:00Z",
        capacity: "8",
        locale: "en",
      }),
    );
    expect(result).toEqual({ status: "error", message: "Course is required." });
    expect(mockedPrisma.availability.create).not.toHaveBeenCalled();
    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });

  it("returns error when startDateTime is missing", async () => {
    const result = await createCourseAvailability(
      fd({
        courseId: "c1",
        endDateTime: "2026-01-01T11:00:00Z",
        capacity: "8",
        locale: "en",
      }),
    );
    expect(result).toEqual({ status: "error", message: "Start date/time is required." });
    expect(mockedPrisma.availability.create).not.toHaveBeenCalled();
  });

  it("returns error when endDateTime is missing", async () => {
    const result = await createCourseAvailability(
      fd({
        courseId: "c1",
        startDateTime: "2026-01-01T10:00:00Z",
        capacity: "8",
        locale: "en",
      }),
    );
    expect(result).toEqual({ status: "error", message: "End date/time is required." });
    expect(mockedPrisma.availability.create).not.toHaveBeenCalled();
  });

  it("returns error when start >= end", async () => {
    const result = await createCourseAvailability(
      fd({
        courseId: "c1",
        startDateTime: "2026-01-01T11:00:00Z",
        endDateTime: "2026-01-01T11:00:00Z",
        capacity: "8",
        locale: "en",
      }),
    );
    expect(result).toEqual({
      status: "error",
      message: "Start date/time must be before end date/time.",
    });
    expect(mockedPrisma.availability.create).not.toHaveBeenCalled();
  });

  it("returns error when start is after end", async () => {
    const result = await createCourseAvailability(
      fd({
        courseId: "c1",
        startDateTime: "2026-01-01T12:00:00Z",
        endDateTime: "2026-01-01T11:00:00Z",
        capacity: "8",
        locale: "en",
      }),
    );
    expect(result).toEqual({
      status: "error",
      message: "Start date/time must be before end date/time.",
    });
    expect(mockedPrisma.availability.create).not.toHaveBeenCalled();
  });

  it("returns error when capacity <= 0", async () => {
    const result = await createCourseAvailability(
      fd({
        courseId: "c1",
        startDateTime: "2026-01-01T10:00:00Z",
        endDateTime: "2026-01-01T11:00:00Z",
        capacity: "0",
        locale: "en",
      }),
    );
    expect(result).toEqual({
      status: "error",
      message: "Capacity must be a positive integer.",
    });
    expect(mockedPrisma.availability.create).not.toHaveBeenCalled();
  });

  it("returns error when capacity is negative", async () => {
    const result = await createCourseAvailability(
      fd({
        courseId: "c1",
        startDateTime: "2026-01-01T10:00:00Z",
        endDateTime: "2026-01-01T11:00:00Z",
        capacity: "-3",
        locale: "en",
      }),
    );
    expect(result).toEqual({
      status: "error",
      message: "Capacity must be a positive integer.",
    });
    expect(mockedPrisma.availability.create).not.toHaveBeenCalled();
  });

  it("returns error and does not redirect when prisma.create throws", async () => {
    mockedPrisma.availability.create.mockRejectedValue(new Error("DB down"));
    const form = fd({
      courseId: "c1",
      startDateTime: "2026-01-01T10:00:00Z",
      endDateTime: "2026-01-01T11:00:00Z",
      capacity: "8",
      locale: "en",
    });

    const result = await createCourseAvailability(form);
    expect(result).toEqual({ status: "error", message: "DB down" });
    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });
});

describe("updateAvailability", () => {
  it("updates an availability and redirects locale-aware", async () => {
    mockedPrisma.availability.update.mockResolvedValue({
      course: { slug: "mfr-intensive" },
    });
    const form = fd({
      courseId: "c1",
      startDateTime: "2026-01-01T10:00:00Z",
      endDateTime: "2026-01-01T11:30:00Z",
      capacity: "10",
      isAvailable: "true",
      locale: "en",
    });

    await expect(updateAvailability("a1", form)).rejects.toThrow(
      /__redirect__:\/en\/admin\/availability/,
    );

    expect(mockedPrisma.availability.update).toHaveBeenCalledWith({
      where: { id: "a1" },
      data: {
        courseId: "c1",
        startDateTime: new Date("2026-01-01T10:00:00Z"),
        endDateTime: new Date("2026-01-01T11:30:00Z"),
        capacity: 10,
        isAvailable: true,
      },
      include: { course: { select: { slug: true } } },
    });
    expect(mockedRevalidate).toHaveBeenCalledWith("/en/admin/availability");
    expect(mockedRevalidate).toHaveBeenCalledWith("/en/courses/mfr-intensive");
    expect(mockedRedirect).toHaveBeenCalledWith("/en/admin/availability");
  });

  it("returns error when validation fails and does not update", async () => {
    const result = await updateAvailability(
      "a1",
      fd({
        courseId: "c1",
        startDateTime: "2026-01-01T12:00:00Z",
        endDateTime: "2026-01-01T11:00:00Z",
        capacity: "8",
        locale: "en",
      }),
    );
    expect(result).toEqual({
      status: "error",
      message: "Start date/time must be before end date/time.",
    });
    expect(mockedPrisma.availability.update).not.toHaveBeenCalled();
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("returns error and does not redirect when prisma.update throws", async () => {
    mockedPrisma.availability.update.mockRejectedValue(new Error("not found"));
    const form = fd({
      courseId: "c1",
      startDateTime: "2026-01-01T10:00:00Z",
      endDateTime: "2026-01-01T11:00:00Z",
      capacity: "8",
      locale: "zh-Hant",
    });

    const result = await updateAvailability("a1", form);
    expect(result).toEqual({ status: "error", message: "not found" });
    expect(mockedRedirect).not.toHaveBeenCalled();
  });
});

describe("deleteAvailability", () => {
  it("deletes an availability with locale string and redirects", async () => {
    mockedPrisma.availability.delete.mockResolvedValue({
      course: { slug: "mfr-intensive" },
    });

    await expect(deleteAvailability("a1", "en")).rejects.toThrow(
      /__redirect__:\/en\/admin\/availability/,
    );

    expect(mockedPrisma.availability.delete).toHaveBeenCalledWith({
      where: { id: "a1" },
      include: { course: { select: { slug: true } } },
    });
    expect(mockedRevalidate).toHaveBeenCalledWith("/en/admin/availability");
    expect(mockedRevalidate).toHaveBeenCalledWith("/en/courses");
    expect(mockedRevalidate).toHaveBeenCalledWith("/en/courses/mfr-intensive");
    expect(mockedRedirect).toHaveBeenCalledWith("/en/admin/availability");
  });

  it("deletes an availability when locale is provided via FormData", async () => {
    mockedPrisma.availability.delete.mockResolvedValue({
      course: { slug: "another-course" },
    });
    const form = fd({ locale: "zh-Hant" });

    await expect(deleteAvailability("a1", form)).rejects.toThrow(
      /__redirect__:\/zh-Hant\/admin\/availability/,
    );

    expect(mockedPrisma.availability.delete).toHaveBeenCalledWith({
      where: { id: "a1" },
      include: { course: { select: { slug: true } } },
    });
    expect(mockedRevalidate).toHaveBeenCalledWith("/zh-Hant/admin/availability");
    expect(mockedRevalidate).toHaveBeenCalledWith("/zh-Hant/courses/another-course");
  });

  it("defaults locale to 'en' when no locale is supplied", async () => {
    mockedPrisma.availability.delete.mockResolvedValue({
      course: { slug: "mfr-intensive" },
    });

    await expect(deleteAvailability("a1")).rejects.toThrow(
      /__redirect__:\/en\/admin\/availability/,
    );

    expect(mockedRevalidate).toHaveBeenCalledWith("/en/admin/availability");
    expect(mockedRedirect).toHaveBeenCalledWith("/en/admin/availability");
  });

  it("returns error and does not redirect when prisma.delete throws", async () => {
    mockedPrisma.availability.delete.mockRejectedValue(new Error("FK constraint"));
    const result = await deleteAvailability("a1", "en");
    expect(result).toEqual({ status: "error", message: "FK constraint" });
    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(mockedRevalidate).not.toHaveBeenCalled();
  });
});
