# Deploy to Vercel

This guide walks you through deploying the Kirwin Bodyworks site to Vercel
with a managed PostgreSQL database (Vercel Postgres / Neon / Supabase).

The project has been migrated from SQLite to PostgreSQL. SQLite is not
supported by Vercel's serverless runtime because the filesystem is
ephemeral; PostgreSQL is the production target. A local Postgres
container is provided for development and tests.

## 1. Prerequisites

- A Vercel account (https://vercel.com/signup).
- The repository pushed to GitHub / GitLab / Bitbucket.
- DNS access for the `kirwinbodyworks.com` domain on Hostinger (so you can
  update the `A` and `CNAME` records once Vercel is ready).
- Docker Desktop installed locally (for the Postgres dev container), or
  PostgreSQL 15+ available via Homebrew / system package manager.

## 2. Create the production database

Pick one of the following and create a Postgres database:

- **Vercel Postgres** — easiest option, fully integrated with the Vercel
  project. In the Vercel dashboard: Storage → Create Database → Postgres.
- **Neon** — https://neon.tech, free tier is generous. Create a project
  and copy both the pooled and direct connection strings.
- **Supabase** — https://supabase.com, create a project and copy the
  connection string from Project Settings → Database.

Copy the **pooled** connection string. It will look like:

```
postgresql://USER:PASSWORD@HOST-POOLER.vercel-storage.com:5432/db?pgbouncer=true&connection_limit=1
```

Keep this string handy — you will paste it into Vercel's environment
variables in the next step.

## 3. Configure environment variables in Vercel

In your Vercel project, go to **Settings → Environment Variables** and
add the following keys (Production scope):

| Key                       | Value                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------- |
| `DATABASE_URL`            | The pooled Postgres URL from step 2.                                                    |
| `NEXTAUTH_URL`            | `https://kirwinbodyworks.com`                                                           |
| `NEXTAUTH_SECRET`         | A long random string — generate with `openssl rand -base64 32`.                         |
| `NEXT_PUBLIC_SITE_URL`    | `https://kirwinbodyworks.com`                                                           |
| `ADMIN_EMAIL`             | The admin email used by `prisma db seed` (e.g. `admin@kirwinbodyworks.com`).            |
| `ADMIN_PASSWORD`          | A strong password for the seeded admin user.                                            |
| `ADMIN_NAME`              | `Site Administrator` (or your preferred display name).                                  |
| `STRIPE_SECRET_KEY`       | Optional — your Stripe live secret key, if payments are enabled.                        |
| `STRIPE_PUBLISHABLE_KEY`  | Optional — your Stripe live publishable key.                                            |
| `STRIPE_WEBHOOK_SECRET`   | Optional — Stripe webhook signing secret.                                               |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional — Stripe publishable key exposed to the browser.                    |

A template of all variables lives in `.env.production.example`.

## 4. Connect the Git repo and deploy

1. In the Vercel dashboard click **Add New → Project**.
2. Import the Git repository that contains this codebase.
3. Leave the framework preset as **Next.js**.
4. Vercel will detect the build command from `package.json`
   (`prisma generate && prisma migrate deploy && next build`).
5. Click **Deploy**.

The first build will:
- Generate the Prisma client (`prisma generate`).
- Run pending migrations against the production database
  (`prisma migrate deploy`) — this creates every table.
- Build the Next.js app (`next build`).

After the build succeeds, seed the production database by running
`npm run db:seed` locally with `DATABASE_URL` pointing at production, or
run it from the Vercel shell (`vercel env pull .env.production` then
`npm run db:seed`).

## 5. Custom domain on Hostinger

In Hostinger's control panel for `kirwinbodyworks.com`, open
**DNS → Records** and add:

| Type   | Name | Value                  | TTL  |
| ------ | ---- | ---------------------- | ---- |
| `A`    | `@`  | `76.76.21.21`          | 3600 |
| `CNAME`| `www`| `cname.vercel-dns.com` | 3600 |

Remove any conflicting `A` / `CNAME` records for `@` and `www` first.

## 6. Attach the domain in Vercel

1. In the Vercel project go to **Settings → Domains**.
2. Type `kirwinbodyworks.com` and click **Add**.
3. Also add `www.kirwinbodyworks.com` and let Vercel redirect it to the
   apex domain.
4. Vercel will verify the DNS records once they propagate (typically a
   few minutes, occasionally up to 24 hours).

SSL is provisioned automatically by Vercel once the domain is verified.

## 7. Future updates

Just push to the connected Git branch:

```bash
git push origin main
```

Vercel will automatically rebuild and redeploy, including any new
migrations declared in `prisma/migrations/`.

## 8. Local development

Bring up the local Postgres container and run migrations:

```bash
npm run db:up                 # docker compose up -d
npx prisma migrate dev        # apply migrations + create client
npm run dev                   # next dev
```

To stop the database:

```bash
npm run db:down               # docker compose down
```

To wipe and recreate the database:

```bash
npm run db:down
docker volume rm kirwin_postgres_data
npm run db:up
npx prisma migrate dev
```

## 9. Testing

Run unit tests (Vitest) and end-to-end tests (Playwright). Both rely on
a separate `kirwin_test` database on port `5433`:

```bash
npm run db:up                                          # starts kirwin + kirwin_test
npm run test -- --run                                  # Vitest (uses kirwin_test)
npm run e2e                                            # Playwright
```

If you do not have Docker, install PostgreSQL locally and create the two
databases manually:

```bash
brew install postgresql@15
brew services start postgresql@15
createdb kirwin
createdb kirwin_test
```

## 10. Rollback / disaster recovery

- The Postgres provider keeps daily backups for at least 7 days.
- Use `vercel rollback` to redeploy a previous build.
- To restore the database from a backup, use the Vercel Postgres
  dashboard → **Backups → Restore**.
