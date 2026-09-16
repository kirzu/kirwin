"use server";

import { revalidatePath } from "next/cache";
import { BookingStatus, type Booking } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isLocale, defaultLocale, type Locale } from "@/i18n.config";

export type BookingActionResult = {
  status: "error";
  message: string;
};

const BOOKING_STATUS_VALUES: ReadonlyArray<BookingStatus> = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.CANCELLED,
  BookingStatus.COMPLETED,
];

function parseBookingStatus(value: unknown): BookingStatus | null {
  if (typeof value !== "string") return null;
  return BOOKING_STATUS_VALUES.find((s) => s === value) ?? null;
}

type CourseSummary = {
  id: string;
  title: string;
  titleZh: string | null;
  slug: string;
};

type BookingWithCourse = Booking & {
  course: CourseSummary | null;
};

const bookingInclude = {
  course: {
    select: {
      id: true,
      title: true,
      titleZh: true,
      slug: true,
    },
  },
} as const;

export async function getBookings(): Promise<BookingWithCourse[]> {
  return prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: bookingInclude,
  }) as unknown as Promise<BookingWithCourse[]>;
}

export async function getBookingById(id: string): Promise<BookingWithCourse | null> {
  return prisma.booking.findUnique({
    where: { id },
    include: bookingInclude,
  }) as unknown as Promise<BookingWithCourse | null>;
}

function resolveLocale(value: string | undefined | null): Locale {
  if (value && isLocale(value)) return value;
  return defaultLocale;
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  locale: string = defaultLocale,
): Promise<BookingActionResult | { booking: BookingWithCourse }> {
  const parsedStatus = parseBookingStatus(status);
  if (!parsedStatus) {
    return { status: "error", message: "Invalid booking status." };
  }

  const resolvedLocale = resolveLocale(locale);

  try {
    const booking = (await prisma.booking.update({
      where: { id },
      data: { status: parsedStatus },
      include: bookingInclude,
    })) as unknown as BookingWithCourse;

    revalidatePath(`/${resolvedLocale}/admin/bookings`);
    revalidatePath(`/${resolvedLocale}/admin/bookings/${id}`);

    return { booking };
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error ? err.message : "Failed to update booking status.",
    };
  }
}
