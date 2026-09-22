# Plan: Shift site focus to massage booking

## Goal
Make massage booking the primary focus of the public site while keeping courses/seminars as a clear secondary path. Add an embedded Cliniko booking page, a choice-based home landing, modern display typography, and social media links.

## Constraints
- Keep the warm neutral brand palette.
- No gradients, glassmorphism, canvas, or WebGL.
- Preserve all quality gates: lint, typecheck, unit tests, e2e, build.
- Use existing stack (Next.js 14, next-intl, Tailwind, Prisma).
- Cliniko allows iframe embedding (`frame-ancestors *`), so embed the scheduler directly.

## Chunks

### Chunk 1: Modern display font
**Files:** `app/[locale]/layout.tsx`, `tailwind.config.js`
- Replace `Lora` with a modern geometric sans (e.g. `Outfit` or `Manrope`).
- Update the `font-display` fallback from `Georgia, Cambria, serif` to a sans-serif fallback.
- Ensure the variable name stays `--font-display` so existing usage is unchanged.

### Chunk 2: Embedded massage booking page
**Files:** `app/[locale]/bookings/page.tsx`, `components/bookings/bookings-view.tsx`, `messages/en.json`, `messages/zh-Hant.json`, `components/mobile-booking-cta.tsx`
- Repurpose the existing `/bookings` route into the embedded booking page.
- Render a full-width, rounded iframe embedding the existing Cliniko URL.
- Provide a fallback link below the iframe for users who cannot see it.
- Update the page copy to be massage-focused ("Book a massage" / "Book your session").
- Update the mobile sticky CTA to point to `/bookings` (or keep the external Cliniko URL) — whichever gives the better mobile experience.
- Update translation keys only as needed.

### Chunk 3: Choice-based home landing
**Files:** `components/home/home-view.tsx`, `app/[locale]/page.tsx`, `messages/en.json`, `messages/zh-Hant.json`
- Redesign the home hero to present two clear choices:
  1. "Book a massage with Stephen" → links to `/bookings`
  2. "Study under Stephen" → links to `/courses`
- Use two large cards side-by-side on desktop, stacked on mobile.
- Keep the existing warm palette, animations, and luxury touches (LineReveal, SectionEyebrow, SplitText, etc.).
- Remove the previous home content (or move the most important pieces below the choice cards).
- Add new translation keys for the choice cards and supporting copy.

### Chunk 4: Social media links
**Files:** `components/footer.tsx` (or footer section in layout), `components/mobile-menu.tsx`, `messages/en.json`, `messages/zh-Hant.json`
- Add an Instagram icon/link in the footer.
- Add an Instagram icon/link in the mobile drawer.
- Leave placeholders/comments for additional social links (Facebook, LinkedIn) and ask the user for URLs before adding them.

### Chunk 5: Verification
- Run `npm run lint`, `npm run test -- --run`, `npm run e2e`, `npm run build`.
- Resolve any `P3005` baseline issue with `npx prisma migrate resolve --applied 20260916180000_init_postgres`.
- Commit and push.
