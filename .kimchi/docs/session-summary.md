# Kirwin Website — Session Summary

**Date:** 2026-09-20  
**Status:** mid-deployment on Vercel; code is pushed to `main` on GitHub.

## What is live / built

- Next.js 14 app rebuilt with PostgreSQL (migrated from SQLite).
- Deployed on Vercel with Neon Postgres.
- Custom domain `kirwinbodyworks.com` pending DNS propagation in Hostinger.
- All quality gates passing locally: `build`, `test` (187/187), `e2e` (8/8), `lint`.

## Recent changes pushed to GitHub

1. **Database** — SQLite → PostgreSQL, with `DATABASE_DIRECT_URL` for migrations.
2. **Public assets** — images in `public/` are now committed and deployed.
3. **Favicon** — replaced Vercel logo with the site logo (`app/icon.png`).
4. **Contact page** — Instagram link updated to `https://www.instagram.com/stephenkirwinbodyworks/`.
5. **Studio address** — updated to `218 Jaffe Road, Suite 602, Wan Chai, Hong Kong` on Contact, Courses, and FAQ.
6. **Testimonials** — original Alex / Walter / Danielle testimonials added as static fallback; YouTube videos now open in a clean modal player (no channel name/profile picture on the page).
7. **Email notifications** — contact-form notification code added (`lib/email.ts`) supporting SendGrid API or SMTP. **Not yet configured in Vercel** because no email provider has been set up.

## Pending decisions / next steps

### Immediate
- Decide on an email provider for contact-form notifications (SendGrid, Brevo, SMTP2GO, AWS SES, etc.) and add the env vars in Vercel, OR remove the notification feature if no provider is chosen.
- Finish custom-domain setup:
  - Add DNS records in Hostinger:
    - `A @ 76.76.21.21`
    - `CNAME www cname.vercel-dns.com`
  - Verify domain in Vercel.

### Cliniko integration (requested, not started)
- Provide your Cliniko online booking URL (e.g. `https://your-account.cliniko.com/bookings`).
- Decide whether to fully replace the internal booking/payment flow or keep it as a backup.
- Decide whether Cliniko opens in a new tab or the same tab.

### Suggested improvements (from review)
1. Remove risky celebrity name-drops (Lance Armstrong, Kevin Spacey, Oliver Stone) from the About page.
2. Align “years of experience” copy (29 vs 20+).
3. Clarify the Courses page — “Our Services” title vs. only one course card, and the hardcoded 4-day intensive description.
4. Strengthen the home hero message and consider adding a photo of Stephen.
5. Add a clear “Book appointment” CTA for Cliniko.
6. Move/hide the public footer “Admin” link.

## Admin login

- Default seeded credentials: `admin@example.com` / `change-me-in-production` (or whatever you set in Vercel env vars `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Useful local commands

```bash
cd /Users/ios
npm run dev        # local dev server
npm run build      # production build
npm run test -- --run
npm run e2e
npm run lint
```

## Notes

- Local Postgres is installed at `$HOME/.local/pgsql` and must be running for build/test/e2e. Start with:
  ```bash
  export PATH="$HOME/.local/pgsql/bin:$PATH"
  pg_ctl -D "$HOME/.local/pgsql/data" -l "$HOME/.local/pgsql/logfile" start
  ```
- `.env` and `.env.production.example` contain the current environment variable templates.
