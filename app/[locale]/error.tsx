"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Locale-scoped error boundary.
 *
 * Renders when a server or client error is thrown while rendering a page
 * inside the locale layout. Copy is intentionally static (no `next-intl`
 * lookups) because the boundary may render when the provider itself failed.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep the real error visible for debugging / monitoring.
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Error
      </p>
      <h1 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-5xl">
        Something went wrong · 發生錯誤
      </h1>
      <p className="max-w-xl text-base leading-7 text-muted-foreground">
        An unexpected error occurred while loading this page. Please try again.
        <br />
        載入頁面時發生非預期的錯誤,請再試一次。
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Try again
        </button>
        <Link
          href="/"
          className="link-underline inline-flex min-h-11 items-center text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}