"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createBooking,
  type CreateBookingErrorCode,
  type CreateBookingResult,
} from "@/lib/actions/booking";

/**
 * Shape of the course summary the booking form needs. Kept narrow so the
 * caller (the server-rendered course detail page) can pass either a freshly
 * fetched row from Prisma or a hand-built stub in tests without violating
 * the contract.
 */
export type BookingFormCourse = {
  id: string;
  title: string;
  priceCents: number;
  slug: string;
};

/**
 * Shape of the availability slots offered to the user. `capacity` is the
 * configured maximum and `bookedCount` is the number already taken, so the
 * page that renders this form can pre-filter to only show future sessions
 * with seats remaining.
 */
export type BookingFormAvailability = {
  id: string;
  startDateTime: string; // ISO string, serialised from a Date on the server
  endDateTime: string;
  capacity: number;
  bookedCount: number;
};

export type BookingFormProps = {
  locale: string;
  course: BookingFormCourse;
  availabilities: BookingFormAvailability[];
};

type FieldErrors = Partial<
  Record<"availabilityId" | "name" | "email" | "phone", string>
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Map server-side error codes returned by `createBooking` onto translated
 * messages in the `booking.errorCodes` namespace. Falls back to the
 * generic `booking.error` key when the code is not recognised.
 */
function translateErrorCode(
  t: ReturnType<typeof useTranslations>,
  code: CreateBookingErrorCode | undefined,
): string {
  if (!code) return t("error");
  switch (code) {
    case "invalidLocale":
      return t("errorCodes.invalidLocale");
    case "missingFields":
      return t("errorCodes.missingFields");
    case "invalidEmail":
      return t("validation.emailInvalid");
    case "invalidPhone":
      return t("errorCodes.invalidPhone");
    case "noSeats":
      return t("errorCodes.noSeats");
    case "generic":
    default:
      return t("error");
  }
}

function defaultFieldErrors(): FieldErrors {
  return {};
}

/**
 * Format an ISO timestamp for display inside the <option> labels. We render
 * in the user's locale with a short date + time so the dropdown stays
 * scannable. Falling back to the raw ISO string keeps the form functional
 * even if the runtime rejects `Intl.DateTimeFormat` (e.g. very old Node).
 */
function formatSlotLabel(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(locale === "zh-Hant" ? "zh-Hant" : "en", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return iso;
  }
}

export function BookingForm({
  locale,
  course,
  availabilities,
}: BookingFormProps) {
  const t = useTranslations("booking");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [availabilityId, setAvailabilityId] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FieldErrors>(defaultFieldErrors);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const headingId = useId();
  const slotId = useId();
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const notesId = useId();

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!availabilityId.trim()) {
      next.availabilityId = t("validation.slotRequired");
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      next.name = t("validation.nameRequired");
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      next.email = t("validation.emailRequired");
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      next.email = t("validation.emailInvalid");
    }
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      next.phone = t("validation.phoneRequired");
    }
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const formData = new FormData();
    formData.append("locale", locale);
    formData.append("courseId", course.id);
    formData.append("availabilityId", availabilityId);
    formData.append("name", name.trim());
    formData.append("email", email.trim());
    formData.append("phone", phone.trim());
    formData.append("notes", notes.trim());

    setPending(true);
    try {
      const result: CreateBookingResult = await createBooking(formData);
      if (result.status === "success") {
        // Navigate to the confirmation page created in step 4 of the
        // booking system. We use router.push (rather than a server
        // redirect) so the client keeps the locale context and the
        // pending state stays consistent until the new page mounts.
        // The `email` query param is required by the GET /api/bookings
        // route to gate access to the booking's PII; the confirmation
        // page forwards it along with the bookingId.
        router.push(
          `/${locale}/booking/confirmed?bookingId=${encodeURIComponent(result.bookingId)}&email=${encodeURIComponent(email.trim())}`,
        );
        return;
      }
      const message =
        result.message && result.message.length > 0
          ? result.message
          : translateErrorCode(t, result.code);
      setError(message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("error"),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Card aria-labelledby={headingId} className="border-primary/30">
      <CardHeader>
        <CardTitle id={headingId} className="text-lg">
          {t("title")}
        </CardTitle>
        <CardDescription className="mt-2 text-sm leading-6">
          {t("intro")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div
            role="status"
            className="mb-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
          >
            {success}
          </div>
        ) : null}
        {error ? (
          <div
            role="alert"
            className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          aria-busy={pending}
          noValidate
        >
          <input type="hidden" name="courseId" value={course.id} />

          <div className="flex flex-col gap-2">
            <Label htmlFor={slotId}>{t("selectSlot")}</Label>
            <select
              id={slotId}
              name="availabilityId"
              required
              value={availabilityId}
              onChange={(event) => {
                setAvailabilityId(event.target.value);
                if (errors.availabilityId) {
                  setErrors({ ...errors, availabilityId: undefined });
                }
              }}
              aria-invalid={errors.availabilityId ? "true" : undefined}
              aria-describedby={
                errors.availabilityId ? `${slotId}-error` : undefined
              }
              className="border-input bg-card h-10 w-full rounded-md border px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-terracotta-400 focus-visible:ring-terracotta-400/40 focus-visible:ring-[3px] aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30"
            >
              <option value="" disabled>
                {t("selectSlotPlaceholder")}
              </option>
              {availabilities.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {formatSlotLabel(slot.startDateTime, locale)}
                </option>
              ))}
            </select>
            {errors.availabilityId ? (
              <p
                id={`${slotId}-error`}
                className="text-sm text-destructive"
              >
                {errors.availabilityId}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={nameId}>{t("name")}</Label>
            <Input
              id={nameId}
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (errors.name) {
                  setErrors({ ...errors, name: undefined });
                }
              }}
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={errors.name ? `${nameId}-error` : undefined}
            />
            {errors.name ? (
              <p id={`${nameId}-error`} className="text-sm text-destructive">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={emailId}>{t("email")}</Label>
            <Input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) {
                  setErrors({ ...errors, email: undefined });
                }
              }}
              aria-invalid={errors.email ? "true" : undefined}
              aria-describedby={errors.email ? `${emailId}-error` : undefined}
            />
            {errors.email ? (
              <p id={`${emailId}-error`} className="text-sm text-destructive">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={phoneId}>{t("phone")}</Label>
            <Input
              id={phoneId}
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                if (errors.phone) {
                  setErrors({ ...errors, phone: undefined });
                }
              }}
              aria-invalid={errors.phone ? "true" : undefined}
              aria-describedby={errors.phone ? `${phoneId}-error` : undefined}
            />
            {errors.phone ? (
              <p id={`${phoneId}-error`} className="text-sm text-destructive">
                {errors.phone}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={notesId}>{t("notes")}</Label>
            <Textarea
              id={notesId}
              name="notes"
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={pending}
              size="lg"
              className="min-h-11 w-full min-w-32 sm:w-auto"
            >
              {pending ? t("submitting") : t("submit")}
            </Button>
            <span className="sr-only" aria-live="polite">
              {pending ? tCommon("loading") : ""}
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default BookingForm;
