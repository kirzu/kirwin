"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "kirwin-cookie-consent";

/**
 * Bottom-of-screen cookie consent banner.
 *
 * Reads its consent flag from `localStorage` on mount and hides itself
 * once the visitor has accepted. The banner is suppressed during
 * server rendering so the markup matches the client on first paint
 * (and so the hydration tree is clean).
 */
export function CookieBanner() {
  const t = useTranslations("cookieBanner");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "accepted") {
        setVisible(true);
      }
    } catch {
      // Ignore storage errors (private mode, disabled cookies, etc.) —
      // we simply fall through and don't show the banner.
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label={t("accept")}
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-sm border border-zinc-200 bg-muted/95 px-4 py-3 text-xs text-muted-foreground shadow-sm backdrop-blur supports-[backdrop-filter]:bg-muted/80 dark:border-zinc-800 dark:bg-zinc-900/90 sm:flex-row sm:items-center sm:gap-4 sm:text-sm">
        <p className="flex-1 leading-relaxed">{t("message")}</p>
        <button
          type="button"
          onClick={() => {
            try {
              window.localStorage.setItem(STORAGE_KEY, "accepted");
            } catch {
              // Ignore storage failures — the user still sees the UI
              // dismiss even if persistence failed.
            }
            setVisible(false);
          }}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-sm bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
