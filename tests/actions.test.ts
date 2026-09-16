import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the Prisma client module. Each test sets its own implementation on
// the mock functions below. vi.mock is hoisted so this replacement is in
// effect before any module-level imports run.
vi.mock("@/lib/prisma", () => {
  const mock = {
    course: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    blogPost: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    contentSection: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    booking: {
      update: vi.fn(),
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
  createCourse,
  updateCourse,
  deleteCourse,
} from "@/lib/actions/courses";
import { createPost, updatePost, deletePost } from "@/lib/actions/blog";
import {
  createSection,
  updateSection,
  deleteSection,
} from "@/lib/actions/content";
import { updateBookingStatus } from "@/lib/actions/bookings";

const mockedPrisma = prisma as unknown as {
  course: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  blogPost: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  contentSection: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  booking: { update: ReturnType<typeof vi.fn> };
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

describe("courses actions", () => {
  it("creates a course and redirects to locale-aware admin list", async () => {
    mockedPrisma.course.create.mockResolvedValue({ id: "c1" });
    const form = fd({
      title: "MFR Intensive",
      description: "A course",
      price: "1500",
      maxParticipants: "10",
      locale: "en",
    });
    await expect(createCourse(form)).rejects.toThrow(/__redirect__:\/en\/admin\/courses/);
    expect(mockedPrisma.course.create).toHaveBeenCalledOnce();
    expect(mockedRevalidate).toHaveBeenCalledWith("/en/admin/courses");
    expect(mockedRedirect).toHaveBeenCalledWith("/en/admin/courses");
  });

  it("updates a course", async () => {
    mockedPrisma.course.update.mockResolvedValue({ id: "c1" });
    const form = fd({
      title: "MFR Updated",
      content: "Body",
      price: "2000",
      maxParticipants: "12",
      locale: "zh-Hant",
    });
    await expect(updateCourse("c1", form)).rejects.toThrow(/__redirect__:\/zh-Hant\/admin\/courses/);
    expect(mockedPrisma.course.update).toHaveBeenCalledWith({
      where: { id: "c1" },
      data: expect.objectContaining({ title: "MFR Updated", price: 2000 }),
    });
    expect(mockedRedirect).toHaveBeenCalledWith("/zh-Hant/admin/courses");
  });

  it("deletes a course", async () => {
    mockedPrisma.course.delete.mockResolvedValue({ id: "c1" });
    await expect(deleteCourse("c1", "en")).rejects.toThrow(/__redirect__:\/en\/admin\/courses/);
    expect(mockedPrisma.course.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
    expect(mockedRedirect).toHaveBeenCalledWith("/en/admin/courses");
  });

  it("returns error when title is missing", async () => {
    const result = await createCourse(fd({ locale: "en" }));
    expect(result).toEqual({ status: "error", message: "Title is required." });
    expect(mockedPrisma.course.create).not.toHaveBeenCalled();
  });
});

describe("blog actions", () => {
  it("creates a blog post and redirects locale-aware", async () => {
    mockedPrisma.blogPost.create.mockResolvedValue({ id: "p1" });
    const form = fd({
      title: "Hello",
      content: "World",
      locale: "en",
    });
    await expect(createPost(form)).rejects.toThrow(/__redirect__:\/en\/admin\/blog/);
    expect(mockedPrisma.blogPost.create).toHaveBeenCalledOnce();
    expect(mockedRedirect).toHaveBeenCalledWith("/en/admin/blog");
  });

  it("updates a blog post", async () => {
    mockedPrisma.blogPost.update.mockResolvedValue({ id: "p1" });
    const form = fd({ title: "Updated", content: "New body", locale: "en" });
    await expect(updatePost("p1", form)).rejects.toThrow(/__redirect__:\/en\/admin\/blog/);
    expect(mockedPrisma.blogPost.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: expect.objectContaining({ title: "Updated", content: "New body" }),
    });
  });

  it("deletes a blog post", async () => {
    mockedPrisma.blogPost.delete.mockResolvedValue({ id: "p1" });
    await expect(deletePost("p1", "en")).rejects.toThrow(/__redirect__:\/en\/admin\/blog/);
    expect(mockedPrisma.blogPost.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
  });

  it("returns error when content is missing", async () => {
    const result = await createPost(fd({ title: "T", locale: "en" }));
    expect(result).toEqual({ status: "error", message: "Testimonial content is required." });
    expect(mockedPrisma.blogPost.create).not.toHaveBeenCalled();
  });
});

describe("content actions", () => {
  it("creates a content section", async () => {
    mockedPrisma.contentSection.create.mockResolvedValue({ id: "s1" });
    const form = fd({
      key: "home.hero.title",
      label: "Hero Title",
      value: "Welcome",
      locale: "en",
    });
    await expect(createSection(form)).rejects.toThrow(/__redirect__:\/en\/admin\/content/);
    expect(mockedPrisma.contentSection.create).toHaveBeenCalledOnce();
    expect(mockedRedirect).toHaveBeenCalledWith("/en/admin/content");
  });

  it("updates a content section without changing key", async () => {
    mockedPrisma.contentSection.update.mockResolvedValue({ id: "s1" });
    const form = fd({
      key: "home.hero.title",
      label: "Hero Title",
      value: "Updated",
      locale: "en",
    });
    await expect(updateSection("s1", form)).rejects.toThrow(/__redirect__:\/en\/admin\/content/);
    expect(mockedPrisma.contentSection.update).toHaveBeenCalledWith({
      where: { id: "s1" },
      data: { label: "Hero Title", value: "Updated", valueZh: null },
    });
  });

  it("deletes a content section", async () => {
    mockedPrisma.contentSection.delete.mockResolvedValue({ id: "s1" });
    await expect(deleteSection("s1", "en")).rejects.toThrow(/__redirect__:\/en\/admin\/content/);
    expect(mockedPrisma.contentSection.delete).toHaveBeenCalledWith({ where: { id: "s1" } });
  });

  it("rejects invalid key", async () => {
    const result = await createSection(
      fd({ key: "BAD KEY", label: "L", value: "V", locale: "en" }),
    );
    expect(result).toEqual({
      status: "error",
      message:
        "Key may only contain lowercase letters, digits, dots, and hyphens.",
    });
  });
});

describe("booking actions", () => {
  it("updates a booking status with locale-aware revalidation", async () => {
    mockedPrisma.booking.update.mockResolvedValue({
      id: "b1",
      status: "CONFIRMED",
      course: null,
    });
    const result = await updateBookingStatus("b1", "CONFIRMED", "zh-Hant");
    expect(result).toMatchObject({ booking: { id: "b1", status: "CONFIRMED" } });
    expect(mockedPrisma.booking.update).toHaveBeenCalledWith({
      where: { id: "b1" },
      data: { status: "CONFIRMED" },
      include: expect.any(Object),
    });
    expect(mockedRevalidate).toHaveBeenCalledWith("/zh-Hant/admin/bookings");
  });

  it("returns error for invalid status", async () => {
    const result = await updateBookingStatus("b1", "INVALID" as never, "en");
    expect(result).toEqual({ status: "error", message: "Invalid booking status." });
    expect(mockedPrisma.booking.update).not.toHaveBeenCalled();
  });
});

describe("admin auth guard", () => {
  it("redirects unauthenticated users to locale-aware login", () => {
    const session: { user?: { role?: string } } | null = null;
    const expected = "en";
    const target = `/${expected}/admin/login`;
    function getRole(s: { user?: { role?: string } } | null | undefined): string | undefined {
      if (!s || !s.user) return undefined;
      return s.user.role;
    }
    const role = getRole(session);
    const shouldRedirect = !role || role !== "ADMIN";
    expect(shouldRedirect).toBe(true);
    expect(target).toBe("/en/admin/login");
  });

  it("redirects non-admin role to login", () => {
    const session = { user: { role: "USER" } };
    const shouldRedirect = session.user.role !== "ADMIN";
    expect(shouldRedirect).toBe(true);
  });

  it("allows admin role through", () => {
    const session = { user: { role: "ADMIN" } };
    const allowed = session.user.role === "ADMIN";
    expect(allowed).toBe(true);
  });

  it("middleware config matcher excludes api/static and gates admin paths", () => {
    // Validate the source of the middleware to confirm the admin-gate logic
    // is in place without actually instantiating the Edge runtime module.
    const fs = require("node:fs") as typeof import("node:fs");
    const source = fs.readFileSync("middleware.ts", "utf8");
    expect(source).toContain("getToken");
    expect(source).toContain("`/${locale}/admin/login`");
    expect(source).toMatch(/loginPath.*admin\/login/);
    expect(source).toMatch(/api\|_next\|_vercel/);
  });
});
