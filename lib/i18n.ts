import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, type Locale } from "@/i18n.config";

type Messages = Record<string, unknown>;

/**
 * Server-side next-intl request config.
 *
 * The Next.js plugin declared in `next.config.mjs` calls this on every
 * server render to resolve the active locale and load the matching message
 * catalogue. We also expose `getMessages` as a plain helper for use outside
 * the React tree (e.g. in route handlers).
 */
export default getRequestConfig(async ({ locale }) => {
  const active: Locale = isLocale(locale) ? locale : defaultLocale;

  let messages: Messages;
  try {
    messages = await loadMessages(active);
  } catch {
    notFound();
  }

  return {
    locale: active,
    messages: messages as never,
  };
});

/**
 * Load the message catalogue for a given locale. Importing JSON modules
 * statically keeps Next.js from trying to bundle them at runtime.
 */
export async function getMessages(locale: string): Promise<Messages> {
  const active: Locale = isLocale(locale) ? locale : defaultLocale;
  return loadMessages(active);
}

async function loadMessages(locale: Locale): Promise<Messages> {
  switch (locale) {
    case "en": {
      const mod = await import("@/messages/en.json");
      return mod.default as Messages;
    }
    case "zh-Hant": {
      const mod = await import("@/messages/zh-Hant.json");
      return mod.default as Messages;
    }
    default:
      throw new Error(`Unsupported locale: ${locale as string}`);
  }
}
