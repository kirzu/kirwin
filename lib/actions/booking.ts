"use server";

import { revalidatePath } from "next/cache";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { isLocale, defaultLocale, type Locale } from "@/i18n.config";

/**
 * Server action for creating a booking.
 *
 * Public API:
 *   - `createBooking(formData)` accepts the booking form's `FormData`
 *     (locale, courseId, availabilityId, name, email, phone, notes).
 *   - Returns a `CreateBookingResult` with one of:
 *       `{ status: 'success', bookingId }`
 *       `{ status: 'error', code, message? }`
 *
 * The client maps `code` to a translated message via the `booking`
 * namespace; `message` is an English fallback for callers that need a
 * raw string without running through i18n.
 *
 * Race-safe behaviour:
 *   - All database work runs inside `prisma.$transaction`. The atomic
 *     `availability` increment uses `$executeRaw` so we can express
 *     "increment only if `bookedCount < capacity` AND `isAvailable`"
 *     in a single statement. SQLite serialises writes, so the row
 *     cannot be over-booked even under concurrent traffic.
 */

export type CreateBookingErrorCode =
  | "invalidLocale"
  | "missingFields"
  | "invalidEmail"
  | "invalidPhone"
  | "noSeats"
  | "generic";

export type CreateBookingSuccess = {
  status: "success";
  bookingId: string;
};

export type CreateBookingError = {
  status: "error";
  code: CreateBookingErrorCode;
  message?: string;
};

export type CreateBookingResult = CreateBookingSuccess | CreateBookingError;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Permissive phone check: at least 6 digits, allow common separators and a
// leading "+". Detailed format validation lives in the dial-plan layer.
const PHONE_PATTERN = /^[+]?[\d\s().-]{6,}$/;

function readField(formData: FormData, key: string): string {
  const raw = formData.get(key);
  if (raw === null) return "";
  return String(raw).trim();
}

function readOptionalField(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  if (raw === null) return null;
  const str = String(raw).trim();
  return str.length === 0 ? null : str;
}

function resolveLocale(value: string): Locale {
  if (value && isLocale(value)) return value;
  return defaultLocale;
}

export async function createBooking(
  formData: FormData,
): Promise<CreateBookingResult> {
  const rawLocale = readField(formData, "locale");
  const locale = resolveLocale(rawLocale);

  if (!rawLocale || !isLocale(rawLocale)) {
    return { status: "error", code: "invalidLocale" };
  }

  const courseId = readField(formData, "courseId");
  const availabilityId = readField(formData, "availabilityId");
  const name = readField(formData, "name");
  const email = readField(formData, "email");
  const phone = readField(formData, "phone");
  const notes = readOptionalField(formData, "notes");

  if (!courseId || !availabilityId || !name || !email || !phone) {
    return { status: "error", code: "missingFields" };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", code: "invalidEmail" };
  }

  if (!PHONE_PATTERN.test(phone)) {
    return { status: "error", code: "invalidPhone" };
  }

  try {
    const outcome = await prisma.$transaction(async (tx) => {
      // Atomic seat reservation. SQLite returns the number of rows
      // changed from $executeRaw; zero means the WHERE did not match
      // (slot full, disabled, or non-existent).
      const reserved = await tx.$executeRaw`
        UPDATE "Availability"
           SET "bookedCount" = "bookedCount" + 1
         WHERE id = ${availabilityId}
           AND "courseId" = ${courseId}
           AND "isAvailable" = true
           AND "bookedCount" < "capacity"
      `;

      if (reserved === 0) {
        return { kind: "full" as const };
      }

      // Look up the availability row to capture the session time on the
      // booking. We do this inside the transaction so the value reflects
      // the exact slot that was just reserved.
      const availability = await tx.availability.findUnique({
        where: { id: availabilityId },
        select: { startDateTime: true },
      });

      const booking = await tx.booking.create({
        data: {
          courseId,
          name,
          email,
          phone,
          status: BookingStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          notes: notes ?? null,
          preferredDate: availability?.startDateTime ?? null,
        },
        select: { id: true },
      });

      return { kind: "ok" as const, bookingId: booking.id };
    });

    if (outcome.kind === "full") {
      return { status: "error", code: "noSeats" };
    }

    // Look up the course slug so we can revalidate the public detail
    // page. This happens outside the transaction because the booking is
    // already committed and the slug is purely for cache invalidation.
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { slug: true },
    });

    revalidatePath(`/${locale}/courses`);
    if (course?.slug) {
      revalidatePath(`/${locale}/courses/${course.slug}`);
    }
    revalidatePath(`/${locale}/admin/bookings`);

    return { status: "success", bookingId: outcome.bookingId };
  } catch (err) {
    // Re-throw redirect / Next.js control-flow errors so the framework
    // can complete the navigation; only swallow genuine failures that
    // should surface as a generic error.
    if (
      err instanceof Error &&
      (err.message.startsWith("__redirect__:") ||
        err.message.startsWith("NEXT_REDIRECT"))
    ) {
      throw err;
    }
    return {
      status: "error",
      code: "generic",
      message: err instanceof Error ? err.message : "Unexpected error",
    };
  }
}

// ---------------------------------------------------------------------------
// Checkout session creation
// ---------------------------------------------------------------------------

export type CreateCheckoutSessionErrorCode =
  | "invalidLocale"
  | "missingFields"
  | "bookingNotFound"
  | "invalidPaymentStatus"
  | "invalidPrice"
  | "generic";

export type CreateCheckoutSessionSuccess = {
  status: "success";
  url: string;
};

export type CreateCheckoutSessionError = {
  status: "error";
  code: CreateCheckoutSessionErrorCode;
  message?: string;
};

export type CreateCheckoutSessionResult =
  | CreateCheckoutSessionSuccess
  | CreateCheckoutSessionError;

export type CreateCheckoutSessionInput = {
  bookingId: string;
  email: string;
  locale: string;
};

/**
 * Server action: create a Stripe Checkout session for an existing
 * pending booking.
 *
 * Inputs:
 *   - `bookingId` — id of the booking created by `createBooking`.
 *   - `email`     — attendee email; used to scope the lookup and to
 *                   build the success/cancel return URLs.
 *   - `locale`    — current locale string (`en` or `zh-Hant`); used
 *                   to build locale-prefixed return URLs.
 *
 * Returns either `{ status: "success", url }` (redirect target) or a
 * discriminated `error` with a `code` the client can map onto a
 * translated message.
 *
 * Notes:
 *   - We deliberately do NOT mutate `Booking.paymentStatus` here; the
 *     webhook is the source of truth for paid/expired state.
 *   - `course.price` is already stored in cents (see Prisma schema);
 *     Stripe's `unit_amount` is also in cents, so we pass it through
 *     directly. If the price is missing or non-positive we surface
 *     an `invalidPrice` error rather than silently creating a $0
 *     checkout session.
 *   - Currency defaults to `hkd` to match the rest of the codebase
 *     (see the `Payment` model). Stripe requires lowercase ISO
 *     currency codes.
 */
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CreateCheckoutSessionResult> {
  const bookingId = (input?.bookingId ?? "").trim();
  const email = (input?.email ?? "").trim();
  const rawLocale = (input?.locale ?? "").trim();

  if (!bookingId || !email || !rawLocale) {
    return { status: "error", code: "missingFields" };
  }

  if (!isLocale(rawLocale)) {
    return { status: "error", code: "invalidLocale" };
  }

  const locale: Locale = rawLocale;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            titleZh: true,
            price: true,
          },
        },
      },
    });

    if (!booking || booking.email !== email) {
      return { status: "error", code: "bookingNotFound" };
    }

    if (booking.paymentStatus !== PaymentStatus.PENDING) {
      return { status: "error", code: "invalidPaymentStatus" };
    }

    const course = booking.course;
    if (!course) {
      return { status: "error", code: "bookingNotFound" };
    }

    const unitAmount =
      typeof course.price === "number" && Number.isFinite(course.price)
        ? Math.trunc(course.price)
        : NaN;

    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return { status: "error", code: "invalidPrice" };
    }

    const baseUrl =
      process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.trim().length > 0
        ? process.env.NEXTAUTH_URL.replace(/\/+$/, "")
        : "";

    const productName =
      locale === "zh-Hant" && course.titleZh
        ? `${course.titleZh} (${course.title})`
        : course.title;

    const successUrl = `${baseUrl}/${locale}/payment/success?bookingId=${encodeURIComponent(
      booking.id,
    )}&email=${encodeURIComponent(email)}`;
    const cancelUrl = `${baseUrl}/${locale}/payment/cancel?bookingId=${encodeURIComponent(
      booking.id,
    )}&email=${encodeURIComponent(email)}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      client_reference_id: booking.id,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "hkd",
            unit_amount: unitAmount,
            product_data: {
              name: productName,
            },
          },
        },
      ],
      metadata: {
        bookingId: booking.id,
      },
    });

    if (!session || !session.url) {
      return {
        status: "error",
        code: "generic",
        message: "Stripe did not return a session URL",
      };
    }

    return { status: "success", url: session.url };
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.startsWith("__redirect__:") ||
        err.message.startsWith("NEXT_REDIRECT"))
    ) {
      throw err;
    }
    return {
      status: "error",
      code: "generic",
      message: err instanceof Error ? err.message : "Unexpected error",
    };
  }
}
