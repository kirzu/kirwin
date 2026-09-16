import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { defaultLocale, locales, type Locale } from "@/i18n.config";

const intlMiddleware = createIntlMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
});

/**
 * Resolve the NEXTAUTH secret without importing the full auth module
 * (which transitively pulls in `bcryptjs` and is incompatible with the
 * Edge runtime that middleware runs in).
 */
function resolveSecret(): string | undefined {
  const fromEnv = process.env.NEXTAUTH_SECRET;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  if (process.env.NODE_ENV === "production") return undefined;
  return "kirwin-dev-secret-do-not-use-in-production";
}

/**
 * Top-level middleware:
 *
 *   1. We gate `/[locale]/admin/*` (except the login page itself) on a
 *      valid NextAuth JWT whose `role` claim is `ADMIN`. Unauthenticated
 *      visitors — and authenticated non-admins — are redirected to the
 *      locale-aware login page with the original path preserved as
 *      `callbackUrl`.
 *   2. next-intl handles locale routing for everything else: redirecting
 *      `/` to `/en`, normalizing bare paths to include a locale prefix,
 *      and revalidating per-locale message caches.
 *
 * The admin check runs *before* `intlMiddleware` so that we can short
 * circuit with a redirect on protected routes. Non-localized admin paths
 * (e.g. `/admin/dashboard`) simply fall through to `intlMiddleware`,
 * which redirects them to `/en/admin/dashboard`, where the next request
 * hits the admin gate.
 */
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const adminMatch = pathname.match(/^\/(en|zh-Hant)\/admin(?:\/|$)/);
  if (adminMatch) {
    const locale = adminMatch[1] as Locale;
    const loginPath = `/${locale}/admin/login`;
    const isLoginRoute = pathname === loginPath || pathname.startsWith(`${loginPath}/`);

    if (!isLoginRoute) {
      const secret = resolveSecret();
      const token = secret
        ? await getToken({ req, secret })
        : await getToken({ req });

      if (token?.role !== "ADMIN") {
        const loginUrl = new URL(loginPath, req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return intlMiddleware(req);
}

export const config = {
  /**
   * Run middleware on every path except:
   *   - the Next.js internals (`_next`, `_vercel`)
   *   - API routes (auth callbacks, future API endpoints)
   *   - any static asset (anything with a file extension)
   */
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
