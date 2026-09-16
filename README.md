# Stephen Kirwin Bodywork Seminars

A bilingual (English / 繁體中文) marketing, booking, and content website for
**Stephen Kirwin Bodywork Seminars** — built with Next.js 14 (App Router),
TypeScript, Tailwind CSS, shadcn/ui, Prisma, NextAuth.js, and Stripe (test
mode).

The site includes a public marketing surface, a full admin CMS, an
availability-driven course booking flow, Stripe Checkout integration, and a
blog — all delivered in two locales.

---

## Features

### Public site
- Bilingual marketing pages: Home, About, Courses, Blog, Contact
- Course catalogue with per-locale titles, descriptions, and pricing
- Availability-driven booking flow with capacity checks
- Stripe Checkout (test mode) for course payments, with a webhook handler
  that reconciles booking payment state
- Blog index and per-post pages, fully localized
- Server-rendered, SEO-friendly, accessible UI built with shadcn/ui

### Admin CMS
- NextAuth.js credentials login, gated by middleware (role: `ADMIN`)
- Course management (create / edit / publish; bilingual fields)
- Availability slot management (capacity, schedule)
- Booking viewer with payment status
- Blog post authoring with bilingual fields
- Dashboard overview

### Payments
- Stripe Checkout integration (currently **test mode**)
- `/api/stripe/webhook` endpoint verifies signatures and updates booking
  payment status (`PaymentStatus.PAID` / `FAILED`)
- Live keys are deferred (D002) — the project is wired and ready for keys
  to be supplied later

### Internationalization
- Locales: `en` (default), `zh-Hant`
- Locale-prefixed routes via `next-intl` middleware (e.g. `/en/courses`,
  `/zh-Hant/courses`)
- Language switcher and locale-aware layouts
- Translation sources in `messages/en.json` and `messages/zh-Hant.json`

---

## Tech stack

| Layer            | Choice                                                       |
| ---------------- | ------------------------------------------------------------ |
| Framework        | Next.js `14.2.28` (App Router)                               |
| Language         | TypeScript `^5`                                              |
| Styling          | Tailwind CSS `^3.4.17` + shadcn/ui (Radix primitives)        |
| UI primitives    | `@radix-ui/*` (dialog, label, select, slot) + `lucide-react` |
| ORM              | Prisma `^6.19.3` (SQLite for dev / demo)                     |
| Auth             | NextAuth.js `^4.24.15` (credentials provider, JWT)           |
| i18n             | `next-intl` `^3.26.5`                                        |
| Payments         | Stripe SDK `^22.6.2` (test mode)                             |
| Hashing          | `bcryptjs` `^2.4.3`                                          |
| Unit tests       | Vitest `^2.1.9` + React Testing Library                      |
| E2E tests        | Playwright `^1.63.0`                                         |
| Tooling          | ESLint `^8.57.1`, Prettier, `tsx` for scripts                |

---

## Prerequisites

- **Node.js 18.18+** (Node 20 LTS recommended — `@types/node` is pinned to
  `^20`)
- **npm 9+** (bundled with Node 20). Yarn / pnpm / bun should also work,
  but the lockfile and scripts assume npm
- A POSIX shell (the seed and migration commands use standard tooling)

No external services are required for local development: SQLite ships with
Prisma and the Stripe integration runs entirely in test mode (no live API
calls are made without keys).

---

## Local setup

### 1. Clone and install

```bash
git clone <your-fork-url> kirwin
cd kirwin
npm install
```

`npm install` triggers `postinstall`, which runs `prisma generate` to
produce the typed Prisma client.

### 2. Configure environment

Copy the example env file and edit values as needed:

```bash
cp .env.example .env
```

At minimum, set `NEXTAUTH_SECRET` to a long random string:

```bash
openssl rand -base64 32
```

> Leaving `NEXTAUTH_SECRET` empty locally falls back to a development
> secret (with a warning). **Do not** rely on this in production.

### 3. Set up the database

```bash
npm run db:migrate   # apply migrations and create dev.db
npm run db:seed      # seed admin user + sample course + sample slot
```

`prisma db seed` reads `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME`
from `.env` (defaults are documented below).

You can inspect the database with `npm run db:studio`.

### 4. Run the dev server

```bash
npm run dev
```

The site is served at <http://localhost:3000>. The middleware redirects
`/` to `/en`, and the language switcher exposes `/zh-Hant` translations.

### 5. Production-style build

```bash
npm run lint         # ESLint
npm run build        # next build
npm start            # serve the production build on :3000
```

---

## Environment variables

All variables are read from `.env` (which must **never** be committed).
`.env.example` is the canonical reference and is kept up to date with the
codebase.

| Variable                         | Required?          | Description                                                                 | Example                                      |
| -------------------------------- | ------------------ | --------------------------------------------------------------------------- | -------------------------------------------- |
| `DATABASE_URL`                   | Yes                | Prisma datasource URL. SQLite for local dev; swap for PostgreSQL in prod.    | `file:./dev.db`                              |
| `NEXTAUTH_SECRET`                | Yes (in prod)      | Long random string used to sign NextAuth JWTs. Generate with `openssl rand`. | `vh7lkdsoCKxynbv2DJkydJ+nGCY1aADa2QSOk0FFAPM=` |
| `NEXTAUTH_URL`                   | Yes                | Public site URL used for auth callbacks and absolute links.                 | `http://localhost:3000`                      |
| `ADMIN_EMAIL`                    | Yes (for seeding)  | Email of the seeded admin user.                                             | `admin@example.com`                          |
| `ADMIN_PASSWORD`                 | Yes (for seeding)  | Password of the seeded admin user (hashed with bcrypt at seed time).        | `change-me-in-production`                    |
| `ADMIN_NAME`                     | Optional           | Display name for the seeded admin user.                                     | `Site Administrator`                         |
| `NEXT_PUBLIC_SITE_URL`           | Optional           | Public site URL used in Open Graph tags and emails.                         | `http://localhost:3000`                      |
| `STRIPE_SECRET_KEY`              | Optional (deferred) | Stripe **test** secret key (`sk_test_...`). Required once you wire up payments. | `sk_test_...`                                |
| `STRIPE_WEBHOOK_SECRET`          | Optional (deferred) | Stripe webhook signing secret (`whsec_...`). Required to verify webhook events. | `whsec_...`                                  |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional (deferred) | Stripe **test** publishable key (`pk_test_...`). Optional, used client-side. | `pk_test_...`                                |

> **D002:** Stripe credentials are intentionally deferred. The checkout
> and webhook code paths exist and pass signature checks once these
> variables are set, but no live (or test) keys are committed to the
> repo. The end user will supply keys later.

---

## Stripe (test mode)

Until live keys are supplied (D002), payments are wired against Stripe's
test mode but will fail to actually create checkouts. To exercise the
payment flow end-to-end:

### 1. Get test keys
1. Sign in at <https://dashboard.stripe.com> (use the test-mode toggle).
2. Open **Developers -> API keys** and copy the **Publishable key** and
   **Secret key** (`pk_test_...` / `sk_test_...`).
3. Copy both into `.env`:

   ```bash
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```

### 2. Configure the webhook
1. Install the Stripe CLI: <https://stripe.com/docs/stripe-cli>.
2. Forward events to the local webhook endpoint:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

   The CLI prints a `whsec_...` signing secret — copy it into
   `STRIPE_WEBHOOK_SECRET` in `.env`.
3. Restart `npm run dev` so the new env vars are picked up.

   > Alternatively, in the Stripe dashboard, register an endpoint at
   > `https://<your-host>/api/stripe/webhook` for the
   > `checkout.session.completed` and `payment_intent.*` events, and copy
   > the resulting signing secret into `STRIPE_WEBHOOK_SECRET`.

### 3. Test the checkout flow
- Use a Stripe test card such as `4242 4242 4242 4242` with any future
  expiry and any CVC / ZIP.
- Complete a booking — the webhook should update the booking's
  `paymentStatus` to `PAID`.
- Failure scenarios can be exercised with cards like
  `4000 0000 0000 0002` (generic decline).

### Out of scope
- **Live keys** (`sk_live_...`, `pk_live_...`) are out of scope and will
  be supplied by the project owner once the site is ready to accept real
  payments (D002).
- **PCI / 3-D Secure flows** beyond the default Stripe Checkout
  behaviour.

---

## Running tests

### Unit / integration (Vitest)

```bash
npm run test
```

Configuration lives in `vitest.config.ts`. Coverage targets the `lib/`,
`components/`, and route-handler code paths.

### End-to-end (Playwright)

First install the browser binary (one-time):

```bash
npm run e2e:install
```

Then run the suite:

```bash
npm run e2e
```

`npm run e2e` re-seeds the database before the run to guarantee a clean
fixture. Configuration lives in `playwright.config.ts`.

---

## Deployment guidance

### Build

```bash
npm run build
npm start
```

The output is a standard Next.js Node server (`next start`). It runs on
Node 18.18+ (Node 20 LTS recommended).

### Platform notes

- **Vercel** — Drop-in target. Set every variable from the table above in
  the project's **Environment Variables** UI (Production / Preview /
  Development as appropriate). Use a Vercel Postgres (or other managed
  PostgreSQL) database and point `DATABASE_URL` at it.
- **Node host** (Render, Fly, Railway, a VM, Docker, etc.) — Run
  `npm run build` during the build step and `npm start` at runtime. Make
  sure the host exposes `PORT` if you customize the listen port, and
  inject the same env vars.
- **Docker** — A minimal `Dockerfile` should `npm ci`, run
  `npm run db:migrate` (or `prisma migrate deploy`), then start with
  `npm start`. Make sure the Prisma engines are included in the image.

### Environment variables on the host
Every variable listed above must be configured in the target environment.
For production:

- Generate a fresh `NEXTAUTH_SECRET` (`openssl rand -base64 32`) and never
  reuse the dev fallback.
- Set `NEXTAUTH_URL` to the canonical public URL (e.g. `https://...`).
- Set `NEXT_PUBLIC_SITE_URL` to the same value so OG tags and absolute
  links are correct.
- Set `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` /
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to **live** keys only after D002 is
  resolved and you are ready to accept real payments.
- Override `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` to non-default
  values before running `prisma db seed` against the production database.

### Database swap (SQLite -> PostgreSQL)
Out of scope for this iteration, but Prisma makes it straightforward:

1. In `prisma/schema.prisma`, change the `datasource db.provider` from
   `sqlite` to `postgresql`.
2. Update `DATABASE_URL` to the new connection string.
3. Delete the old `prisma/migrations` directory and run
   `npx prisma migrate dev --name init` to author a fresh migration.
4. Re-run `npm run db:seed`.

---

## Admin access

The seed script (`prisma/seed.ts`) provisions an admin user from
environment variables (with sensible defaults):

- **Email:** value of `ADMIN_EMAIL`, defaults to `admin@example.com`
- **Password:** value of `ADMIN_PASSWORD`, defaults to
  `change-me-in-production`
- **Name:** value of `ADMIN_NAME`, defaults to `Site Administrator`

Sign in at `/en/admin/login` (or `/zh-Hant/admin/login`). Middleware
gates every `/[locale]/admin/*` route on a NextAuth JWT with
`role: "ADMIN"`; unauthenticated visitors are redirected to the login
page with `callbackUrl` preserved.

> **Important:** Change `ADMIN_EMAIL` / `ADMIN_PASSWORD` before deploying
> to a public environment, and re-run `npm run db:seed` against the
> production database so the hash is refreshed.

---

## Internationalization

Supported locales are declared in `i18n.config.ts`:

```ts
export const locales = ["en", "zh-Hant"] as const;
export const defaultLocale: Locale = "en";
```

- All locale-prefixed routes are wired by `next-intl` middleware
  (`middleware.ts`). The default locale is `en`; the locale prefix is
  always shown (`localePrefix: "always"`).
- Translation sources live in `messages/en.json` and
  `messages/zh-Hant.json`. The shape of the two files must match.
- Locale-aware layouts and metadata live in `app/[locale]/layout.tsx`.
- The language switcher uses the `localeLabels` map from
  `i18n.config.ts`.

### Adding a new locale
1. Add the locale code to `locales` in `i18n.config.ts` and to
   `localeLabels` with a human-readable name.
2. Add a matching `messages/<locale>.json` file (copy `en.json` and
   translate).
3. (Optional) Add localized fields to data models (e.g. `*Zh` columns on
   `Course`, `BlogPost`) and surface them via the admin CMS.
4. Re-run `npm run lint` and `npm run test` to make sure the new locale
   passes the locale-aware checks.

---

## License & credits

Internal project for Stephen Kirwin Bodywork Seminars. All rights
reserved.

Built with [Next.js](https://nextjs.org), [Prisma](https://prisma.io),
[NextAuth.js](https://next-auth.js.org), [next-intl](https://next-intl-docs.vercel.app),
[Tailwind CSS](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com),
and [Stripe](https://stripe.com).
