"use client";

import { useId, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  submitContactInquiry,
  type ContactFormResult,
} from "./actions";

/**
 * Client-side contact form. Uses `useTransition` to drive the pending
 * state while the server action runs — `useFormState` / `useFormStatus`
 * are still canary-only on the React 18 line that Next 14 ships, and
 * the manual approach keeps the form compatible with the installed
 * React version.
 *
 * The form keeps its submitted values on error so the user does not
 * have to retype everything. On success, it resets to the empty state
 * and renders a confirmation banner in place of the inputs.
 */
export default function ContactForm({ locale }: { locale: string }) {
  const t = useTranslations("contact");

  const [result, setResult] = useState<ContactFormResult | null>(null);
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isPending, startTransition] = useTransition();

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const messageId = useId();

  const fieldErrors = result?.status === "error" ? result.fieldErrors : undefined;
  // Prefer the values echoed back from the server (post-validation) so the
  // form state stays in sync with what the action actually saw, then fall
  // back to the local input state for the very first render.
  const currentValues =
    result?.status === "error" && result.values ? result.values : values;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("locale", locale);

    startTransition(async () => {
      const response = await submitContactInquiry(formData);
      setResult(response);
      if (response.status === "success") {
        // Reset on success so the form is ready for a new inquiry.
        setValues({ name: "", email: "", phone: "", message: "" });
        form.reset();
      }
    });
  }

  const inputClass =
    "h-12 rounded-sm border-border bg-background px-4 py-2 text-base transition-[border-color,box-shadow,background-color] duration-200 ease-out focus-visible:ring-primary";
  const textareaClass =
    "rounded-sm border-border bg-background px-4 py-3 text-base transition-[border-color,box-shadow,background-color] duration-200 ease-out focus-visible:ring-primary";
  const errorTextClass =
    "flex items-center gap-1.5 text-sm font-medium text-destructive";

  if (result?.status === "success") {
    return (
      <Card aria-live="polite" className="rounded-2xl border border-border bg-card luxe-card p-6 sm:p-8 lg:p-10">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-3 font-display text-2xl font-medium leading-snug text-foreground sm:text-3xl">
            <span
              aria-hidden
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-primary text-primary"
            >
              <CheckCircle2 className="h-5 w-5" />
            </span>
            {t("submit")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <p className="text-base leading-7 text-muted-foreground">
            {result.message}
          </p>
          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResult(null)}
              className="rounded-sm"
            >
              {t("successCta")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-border bg-card luxe-card p-6 sm:p-8 lg:p-10">
      <CardHeader className="p-0">
        <CardTitle className="font-display text-2xl font-medium leading-tight sm:text-3xl">
          {t("formTitle")}
        </CardTitle>
        <CardDescription className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">
          {t("formIntro")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 pt-8">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
          aria-busy={isPending}
        >
          {/* Honeypot field: hidden from humans, meant to catch bots. */}
          <div className="sr-only" aria-hidden="true">
            <Label htmlFor="website">Do not fill this field</Label>
            <Input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor={nameId} className="text-sm font-medium">
                {t("fields.name")}
                <span aria-hidden="true" className="text-primary">
                  *
                </span>
              </Label>
              <Input
                id={nameId}
                name="name"
                type="text"
                autoComplete="name"
                required
                aria-required="true"
                aria-invalid={fieldErrors?.name ? true : undefined}
                aria-describedby={
                  fieldErrors?.name ? `${nameId}-error` : undefined
                }
                placeholder={t("fields.namePlaceholder")}
                defaultValue={currentValues.name}
                onChange={(event) =>
                  setValues((v) => ({ ...v, name: event.target.value }))
                }
                disabled={isPending}
                className={inputClass}
              />
              {fieldErrors?.name ? (
                <p id={`${nameId}-error`} className={errorTextClass}>
                  <AlertCircle aria-hidden="true" className="h-4 w-4" />
                  {fieldErrors.name}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor={emailId} className="text-sm font-medium">
                {t("fields.email")}
                <span aria-hidden="true" className="text-primary">
                  *
                </span>
              </Label>
              <Input
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-required="true"
                aria-invalid={fieldErrors?.email ? true : undefined}
                aria-describedby={
                  fieldErrors?.email ? `${emailId}-error` : undefined
                }
                placeholder={t("fields.emailPlaceholder")}
                defaultValue={currentValues.email}
                onChange={(event) =>
                  setValues((v) => ({ ...v, email: event.target.value }))
                }
                disabled={isPending}
                className={inputClass}
              />
              {fieldErrors?.email ? (
                <p id={`${emailId}-error`} className={errorTextClass}>
                  <AlertCircle aria-hidden="true" className="h-4 w-4" />
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={phoneId} className="text-sm font-medium">
              {t("fields.phone")}
            </Label>
            <Input
              id={phoneId}
              name="phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={fieldErrors?.phone ? true : undefined}
              aria-describedby={
                fieldErrors?.phone ? `${phoneId}-error` : undefined
              }
              placeholder={t("fields.phonePlaceholder")}
              defaultValue={currentValues.phone}
              onChange={(event) =>
                setValues((v) => ({ ...v, phone: event.target.value }))
              }
              disabled={isPending}
              className={inputClass}
            />
            {fieldErrors?.phone ? (
              <p id={`${phoneId}-error`} className={errorTextClass}>
                <AlertCircle aria-hidden="true" className="h-4 w-4" />
                {fieldErrors.phone}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={messageId} className="text-sm font-medium">
              {t("fields.message")}
              <span aria-hidden="true" className="text-primary">
                *
              </span>
            </Label>
            <Textarea
              id={messageId}
              name="message"
              required
              aria-required="true"
              rows={6}
              aria-invalid={fieldErrors?.message ? true : undefined}
              aria-describedby={
                fieldErrors?.message ? `${messageId}-error` : undefined
              }
              placeholder={t("fields.messagePlaceholder")}
              defaultValue={currentValues.message}
              onChange={(event) =>
                setValues((v) => ({ ...v, message: event.target.value }))
              }
              disabled={isPending}
              className={textareaClass}
            />
            {fieldErrors?.message ? (
              <p id={`${messageId}-error`} className={errorTextClass}>
                <AlertCircle aria-hidden="true" className="h-4 w-4" />
                {fieldErrors.message}
              </p>
            ) : null}
          </div>

          {result?.status === "error" && !fieldErrors ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4" />
              <p>{result?.message || t("error.generic")}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-muted-foreground">
              {t("formFootnote")}
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="rounded-sm px-8"
            >
              {isPending ? t("submitting") : t("submit")}
              {!isPending ? (
                <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
              ) : null}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
