"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("admin.login");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl") || `/${locale}/admin`;
  // Only allow same-origin relative paths to prevent open redirects.
  const callbackUrl =
    rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : `/${locale}/admin`;
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setError(t("error"));
      return;
    }

    window.location.href = callbackUrl;
  }

  return (
    <Card className="w-full max-w-md overflow-hidden border-brand-sand/60 shadow-sm">
      <div
        aria-hidden
        className="h-1.5 w-full bg-gradient-to-r from-terracotta-500 via-brand-500 to-sage-500"
      />
      <CardHeader className="space-y-3 px-6 pt-6">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-sand/70">
          <LockKeyhole className="h-5 w-5" aria-hidden />
        </div>
        <CardTitle className="font-display text-2xl text-brand-900">
          {t("title")}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Kirwin Admin · sign in to manage your site.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-brand-800">
              {t("email")}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="border-brand-sand bg-background focus-visible:ring-brand-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-brand-800">
              {t("password")}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="border-brand-sand bg-background focus-visible:ring-brand-500"
            />
          </div>
          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full bg-brand-700 text-primary-foreground hover:bg-brand-800"
            disabled={pending}
          >
            {pending ? tCommon("loading") : t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminLoginForm({ locale }: { locale: string }) {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-background to-sage-50"
      />
      <div
        aria-hidden
        className="absolute -left-24 top-10 -z-10 h-56 w-56 rounded-full bg-terracotta-200/60 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-24 bottom-0 -z-10 h-64 w-64 rounded-full bg-sage-200/60 blur-3xl"
      />
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Loading…</CardTitle>
            </CardHeader>
          </Card>
        }
      >
        <LoginForm locale={locale} />
      </Suspense>
    </main>
  );
}
