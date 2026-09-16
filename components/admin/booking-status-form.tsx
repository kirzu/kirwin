"use client";

import { useState } from "react";
import { BookingStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

const STATUSES: ReadonlyArray<BookingStatus> = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.CANCELLED,
  BookingStatus.COMPLETED,
];

type ActionResult =
  | { status: "error"; message: string }
  | { booking: unknown };

type Props = {
  bookingId: string;
  currentStatus: BookingStatus;
  action: (
    id: string,
    status: BookingStatus,
    locale?: string,
  ) => Promise<ActionResult>;
  locale?: string;
};

export function BookingStatusForm({
  bookingId,
  currentStatus,
  action,
  locale = "en",
}: Props) {
  const [status, setStatus] = useState<BookingStatus>(currentStatus);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const next = formData.get("status") as BookingStatus;
      const result = await action(bookingId, next, locale);
      if (result && "status" in result && result.status === "error") {
        setError(result.message);
        setPending(false);
        return;
      }
      setPending(false);
      setStatus(next);
    } catch (err) {
      setPending(false);
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error updating booking status.",
      );
    }
  }

  return (
    <form action={handleSubmit} className="flex items-center gap-2">
      <select
        name="status"
        value={status}
        onChange={(e) => setStatus(e.target.value as BookingStatus)}
        disabled={pending}
        className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="Booking status"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Saving..." : "Update"}
      </Button>
      {error ? (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      ) : null}
    </form>
  );
}
