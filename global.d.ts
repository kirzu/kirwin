/**
 * Type augmentation for next-intl.
 *
 * Pulling in the English message catalogue here lets `useTranslations`
 * and `getTranslations` infer string-keyed namespaces and value shapes
 * throughout the codebase. The runtime message loading in `lib/i18n.ts`
 * is unaffected — this file is only consulted by the TypeScript compiler.
 */
import type en from "./messages/en.json";

declare module "next-intl" {
  interface AppConfig {
    messages: typeof en;
  }
}

export {};
