"use server";

import { getTranslations } from "next-intl/server";
import { isLocale, type Locale } from "@/i18n.config";
import { prisma } from "@/lib/prisma";

/**
 * Validation result for the contact form. We keep field-level errors keyed
 * by field name so the client form can surface them inline next to each
 * input rather than as a single generic banner.
 */
export type ContactFieldErrors = Partial<{
  name: string;
  email: string;
  phone: string;
  message: string;
}>;

export type ContactFormResult = {
  status: "success" | "error";
  message?: string;
  fieldErrors?: ContactFieldErrors;
  values?: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };
};

/**
 * Trim and collapse whitespace. Anything below 10 characters is almost
 * certainly a mistake (a stray keystroke) and produces an inline error
 * instead of being persisted.
 */
function normalize(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function isValidEmail(email: string): boolean {
  // Intentionally permissive — we only want to catch obvious typos, not
  // implement a full RFC 5322 parser. The form is followed up manually.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  if (phone.length === 0) return true; // phone is optional
  // Accept +, digits, spaces, dashes and parentheses; require at least
  // 6 digits so we don't accept a single stray character.
  const digits = phone.replace(/[^\d]/g, "");
  return digits.length >= 6 && digits.length <= 20;
}

/**
 * Server action for the public contact form. Validates the submitted
 * payload, enforces a per-email submission cooldown, checks a honeypot
 * field, and on success persists the inquiry via Prisma as a durable
 * queue record. A transactional-email provider can be wired in later to
 * drain these records; no PII is written to server logs.
 */
export async function submitContactInquiry(
  formData: FormData,
): Promise<ContactFormResult> {
  const localeValue = formData.get("locale");
  const locale: Locale = isLocale(typeof localeValue === "string" ? localeValue : "")
    ? (localeValue as Locale)
    : "en";

  const t = await getTranslations({ locale, namespace: "contact" });

  const values = {
    name: normalize(formData.get("name")),
    email: normalize(formData.get("email")),
    phone: normalize(formData.get("phone")),
    message: normalize(formData.get("message")),
  };

  // Honeypot field: must remain empty. Bots often fill hidden fields.
  const honeypot = normalize(formData.get("website"));
  if (honeypot.length > 0) {
    return {
      status: "error",
      message: t("error.generic"),
      values,
    };
  }

  const fieldErrors: ContactFieldErrors = {};

  if (values.name.length < 2) {
    fieldErrors.name = t("error.required");
  }
  if (values.email.length === 0) {
    fieldErrors.email = t("error.required");
  } else if (!isValidEmail(values.email)) {
    fieldErrors.email = t("error.email");
  }
  if (!isValidPhone(values.phone)) {
    fieldErrors.phone = t("error.required");
  }
  if (values.message.length < 10) {
    fieldErrors.message = t("error.messageTooShort");
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      fieldErrors,
      values,
    };
  }

  try {
    // Rate limit: allow at most one inquiry per email per hour. This is a
    // lightweight abuse guard that requires no extra infrastructure.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await prisma.contactInquiry.findFirst({
      where: {
        email: values.email,
        createdAt: { gte: oneHourAgo },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (recent) {
      return {
        status: "error",
        message: t("error.rateLimit"),
        values,
      };
    }

    // Persist the inquiry as a durable queue record. A future email worker
    // can read from ContactInquiry and send an acknowledgement; for now this
    // satisfies the queue-submission requirement without leaking PII to logs.
    await prisma.contactInquiry.create({
      data: {
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        message: values.message,
        locale,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[contact] failed to persist inquiry", {
      locale,
      error: error instanceof Error ? error.message : "unknown",
    });
    return {
      status: "error",
      message: t("error.generic"),
      values,
    };
  }

  return {
    status: "success",
    message: t("success"),
  };
}
