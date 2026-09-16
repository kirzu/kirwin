import { BookingStatus, PaymentStatus } from "@prisma/client";

const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  [BookingStatus.CONFIRMED]:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  [BookingStatus.CANCELLED]:
    "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  [BookingStatus.COMPLETED]:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
};

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  [PaymentStatus.PAID]:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  [PaymentStatus.FAILED]:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  [PaymentStatus.REFUNDED]:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
};

function badgeClass(styles: string): string {
  return `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles}`;
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={badgeClass(BOOKING_STATUS_STYLES[status])}>
      {status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={badgeClass(PAYMENT_STATUS_STYLES[status])}>
      {status}
    </span>
  );
}
