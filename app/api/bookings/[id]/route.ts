import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/bookings/[id]?email=<booking-email>
 *
 * Returns a single booking with its course and (best-effort) matching
 * availability row. Used by the booking confirmation client component
 * to render the post-booking summary without forcing the parent page
 * to opt into dynamic rendering.
 *
 * Security: the caller must supply the email address that was captured
 * on the original booking form. The match is case-insensitive and
 * whitespace-trimmed so that hand-typed or copy-pasted links still work.
 *   - 400 when `email` is missing from the query string.
 *   - 404 when no booking matches the supplied id.
 *   - 401 when the supplied email does not match the booking's email.
 *   - 200 with full details only when both id and email match.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const id = params.id;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const suppliedEmail = new URL(request.url).searchParams.get("email");
  if (!suppliedEmail || suppliedEmail.trim().length === 0) {
    return NextResponse.json(
      { error: "missing email" },
      { status: 400 },
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { course: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const supplied = suppliedEmail.trim().toLowerCase();
  const stored = (booking.email ?? "").trim().toLowerCase();
  if (supplied !== stored) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let availability: {
    id: string;
    startDateTime: Date;
    endDateTime: Date;
    capacity: number;
  } | null = null;
  if (booking.preferredDate) {
    availability = await prisma.availability.findFirst({
      where: {
        courseId: booking.courseId,
        startDateTime: booking.preferredDate,
      },
      select: {
        id: true,
        startDateTime: true,
        endDateTime: true,
        capacity: true,
      },
    });
  }

  return NextResponse.json({
    id: booking.id,
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    notes: booking.notes,
    preferredDate: booking.preferredDate
      ? booking.preferredDate.toISOString()
      : null,
    course: {
      title: booking.course.title,
      titleZh: booking.course.titleZh,
      price: booking.course.price,
    },
    availability: availability
      ? {
          startDateTime: availability.startDateTime.toISOString(),
          endDateTime: availability.endDateTime.toISOString(),
          capacity: availability.capacity,
        }
      : null,
  });
}
