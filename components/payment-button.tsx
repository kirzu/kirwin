"use client";

import { useState, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  createCheckoutSession,
  type CreateCheckoutSessionErrorCode,
} from "@/lib/actions/booking";
import type { Locale } from "@/i18n.config";

/**
 * Client-side button that creates a Stripe Checkout session for the
 * supplied booking and navigates the user to the session URL.
 *
 * The button is intentionally stateless apart from its pending and
 * inline-error state. The parent decides when to render it (typically
 * only while `paymentStatus === "PENDING"`).
 */

export type PaymentButtonProps = {
  bookingId: string;
  email: string;
  locale: Locale;
  /** Course title; kept on the public surface for telemetry / receipt rendering. */
  courseTitle: string;
  /** Amount in the smallest currency unit; kept for forward compatibility. */
  amount: number;
  /** ISO currency code (e.g. "hkd"); kept for forward compatibility. */
  currency: string;
  disabled?: boolean;
};

/**
 * Map server-side error codes returned by `createCheckoutSession`
 * onto translated messages in the `booking.payment` namespace.
 * Falls back to a generic "error" key when the code is unknown.
 */
function translateErrorCode(
  t: ReturnType<typeof useTranslations>,
  code: CreateCheckoutSessionErrorCode | undefined,
): string {
  if (!code) return t("error");
  switch (code) {
    case "invalidLocale":
      return t("errorCodes.invalidLocale");
    case "missingFields":
      return t("errorCodes.missingFields");
    case "bookingNotFound":
      return t("errorCodes.bookingNotFound");
    case "invalidPaymentStatus":
      return t("errorCodes.invalidPaymentStatus");
    case "invalidPrice":
      return t("errorCodes.invalidPrice");
    case "generic":
    default:
      return t("error");
  }
}

export function PaymentButton({
  bookingId,
  email,
  locale,
  disabled,
}: PaymentButtonProps) {
  const t = useTranslations("booking.payment");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (pending || disabled) return;
    setError(null);
    setPending(true);
    try {
      const result = await createCheckoutSession({
        bookingId,
        email,
        locale,
      });
      if (result.status === "success") {
        // Full-page navigation is intentional: Stripe's hosted checkout
        // page replaces the whole viewport, and using `assign` ensures
        // we don't leak any in-flight fetch state from this page.
        if (typeof window !== "undefined") {
          window.location.assign(result.url);
        }
        return;
      }
      const message =
        result.message && result.message.length > 0
          ? result.message
          : translateErrorCode(t, result.code);
      setError(message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("error"),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-2">
      <Button
        type="button"
        onClick={handleClick}
        disabled={pending || disabled}
        aria-busy={pending}
        className="min-w-40"
        data-testid="payment-button"
      >
        {pending ? t("processing") : t("cta")}
      </Button>
      {error ? (
        <p
          role="alert"
          className="text-sm text-destructive"
          data-testid="payment-button-error"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default PaymentButton;
