# Verification Report — Hostinger Deployment: Real Domain + VPS Note

## Scope

Update Hostinger deployment artefacts to use the real domain
`kirwinbodyworks.com` instead of the generic `example.com` placeholder, and
add an upfront note that Hostinger **Business Web Hosting** /
**AI Website Builder** cannot run a Next.js app.

No other files modified.

## Files Changed

- `/Users/ios/deployment/Caddyfile`
- `/Users/ios/.env.production.example`
- `/Users/ios/README-DEPLOY.md`

## Edit Details

### 1. `deployment/Caddyfile`

- Header comment: `# Replace example.com with your actual domain...` ->
  `# Replace kirwinbodyworks.com with your actual domain...`.
- Apex site block: `example.com {` -> `kirwinbodyworks.com {`.
- `www` redirect block: `www.example.com { redir https://example.com{uri} permanent }`
  -> `www.kirwinbodyworks.com { redir https://kirwinbodyworks.com{uri} permanent }`.
- All reverse-proxy / TLS / header / log directives untouched.

### 2. `.env.production.example`

- `NEXT_PUBLIC_SITE_URL="https://example.com"` ->
  `NEXT_PUBLIC_SITE_URL="https://kirwinbodyworks.com"`.
- `NEXTAUTH_URL="https://example.com"` ->
  `NEXTAUTH_URL="https://kirwinbodyworks.com"`.
- `ADMIN_EMAIL="admin@example.com"` ->
  `ADMIN_EMAIL="admin@kirwinbodyworks.com"` (kept consistent with the
  public domain).
- Comment placeholders, `NEXTAUTH_SECRET` placeholder, and the
  Stripe block (already commented out) unchanged.

### 3. `README-DEPLOY.md`

- Replaced every literal `example.com` reference with `kirwinbodyworks.com`
  in:
  - The "Replace every example.com and `<VPS_IP>`..." banner near the top.
  - The `NEXT_PUBLIC_SITE_URL` / `NEXTAUTH_URL` instruction in section 4.
  - The DNS records table and `dig` commands in section 9.
- Updated the Caddy `sed` example in section 8 from
  `sed -i 's/example.com/yourdomain.com/g'` to
  `sed -i 's/kirwinbodyworks.com/yourdomain.com/g'` so the search
  pattern still matches the shipped `Caddyfile` (the replacement target
  `yourdomain.com` is a generic illustrative placeholder and is
  preserved).
- Inserted a new top-of-file section **"Hosting-plan compatibility"**
  (placed after the intro banner, before section 1) stating:
  - Hostinger **Business Web Hosting** and the **AI Website Builder**
    only run PHP / static files and do not provide a persistent
    Node.js process, so a Next.js app cannot be hosted there.
  - The user needs either a **Hostinger VPS** (KVM 1 or larger) or any
    Node-compatible host (Vercel, Render, Railway, Fly.io, non-Hostinger
    VPS). VPS is the assumption of the rest of the guide.
- All VPS installation, build, PM2, systemd, Caddy, DNS, and
  troubleshooting steps (sections 1-11 and the file-layout reference)
  are intact and unchanged.

## Acceptance Checks

### `grep -R "example.com" deployment/ .env.production.example README-DEPLOY.md`

```
--- exit: 1 ---   (no matches)
```

Zero matches in the three target files.

Sanity grep for the new domain (positive control):

```
deployment/Caddyfile:5:# Replace kirwinbodyworks.com with your actual domain before deploying.
deployment/Caddyfile:8:kirwinbodyworks.com {
deployment/Caddyfile:45:www.kirwinbodyworks.com {
deployment/Caddyfile:46:    redir https://kirwinbodyworks.com{uri} permanent
.env.production.example:19:NEXT_PUBLIC_SITE_URL="https://kirwinbodyworks.com"
.env.production.example:21:NEXTAUTH_URL="https://kirwinbodyworks.com"
.env.production.example:26:ADMIN_EMAIL="admin@kirwinbodyworks.com"
README-DEPLOY.md:6:> Replace every `kirwinbodyworks.com` and `<VPS_IP>` placeholder...
README-DEPLOY.md:145:- `NEXT_PUBLIC_SITE_URL` and `NEXTAUTH_URL` to `https://kirwinbodyworks.com`
README-DEPLOY.md:229:sed -i 's/kirwinbodyworks.com/yourdomain.com/g' deployment/Caddyfile
README-DEPLOY.md:252:In **hPanel -> Domains -> kirwinbodyworks.com -> DNS / DNS Records**...
README-DEPLOY.md:258:| `CNAME` | `www` | `kirwinbodyworks.com` | 300  |
README-DEPLOY.md:267:dig +short kirwinbodyworks.com
README-DEPLOY.md:268:dig +short www.kirwinbodyworks.com
```

## Test Output

### `npm run build`

Exit code 0. All 44 routes generated successfully, including
`/[locale]`, `/[locale]/courses/[slug]`,
`/[locale]/booking/confirmed`, `/[locale]/admin/*`, `/api/*`. Middleware
bundle unchanged. No new warnings introduced by the deploy-file edits
(the three files are not bundled into the Next.js build).

### `npm run lint`

Exit code 0. ESLint clean across `app/`, `components/`, `lib/`,
`prisma/`, `middleware.ts`, `i18n.config.ts`. No warnings, no errors.

(The `npm run e2e` and vitest suites from the prior verification pass
are unchanged — these deployment files are not imported by app code
and have no test coverage of their own. Re-running them is out of scope
for this edit.)

## Lint Output

```
$ npm run lint
exit=0
```

No warnings, no errors.

## Verdict

**ALL_PASS**
