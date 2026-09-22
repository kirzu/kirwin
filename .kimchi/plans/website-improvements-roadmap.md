# Kirwin Bodywork Seminars — Website Improvements Roadmap

**Review date:** 2026-09-20  
**Current state:** Site is deployed on Vercel, uses Cliniko for bookings, has a new public Bookings page, and bilingual `en` / `zh-Hant` support.

---

## How this roadmap is organised

| Priority | Meaning |
|---|---|
| **P0 — Critical** | Fix before promoting the site publicly |
| **P1 — High** | Do in the next 1–2 weeks |
| **P2 — Medium** | Do within the next month |
| **P3 — Later** | Nice-to-have once core items are done |

---

## P0 — Critical fixes

### 1. Remove risky celebrity references from the About page

**Problem:** The About page names Lance Armstrong, Kevin Spacey, and Oliver Stone. These names carry significant public baggage and can undermine trust.

**Fix:** Replace with neutral copy such as:

> “His client list has included professional Ironman competitors, actors, and high-profile performers…”

**Files:** `messages/en.json`, `messages/zh-Hant.json` (About copy).

### 2. Fix inconsistent “years of experience”

**Problem:** Home says “Twenty-two years of practice”; About says “Twenty-nine years of practice.”

**Fix:** Pick the accurate number and use it everywhere.

**Files:** `messages/en.json`, `messages/zh-Hant.json`.

### 3. Clarify the Courses page

**Problem:**
- Page title is “Our Services” which does not match the rest of the site.
- There is a long hardcoded 4-day intensive description, but the only actual course card is “Introduction to Myofascial Release.”
- “Reserve your seat” language is leftover from the old internal booking flow.

**Fix:**
- Rename page title to “Seminars” or “Upcoming courses.”
- Either create a real 4-day intensive course in the admin, or remove the hardcoded block.
- Update CTA labels to “Book appointment” or “View details” to match the Cliniko flow.

**Files:** `messages/en.json`, `messages/zh-Hant.json`, `components/courses/courses-view.tsx`.

### 4. Hide or de-emphasise the public Admin link

**Problem:** The footer has a visible “Admin” link. It is unnecessary for visitors and looks unprofessional.

**Fix:** Move it to a subtle text link, remove the label, or only show it on hover.

**Files:** `app/[locale]/layout.tsx`.

---

## P1 — High-impact improvements

### 5. Rewrite the home-page hero

**Problem:** “Develop the tools to provide effective therapeutic care and promote wellness in your clients.” is generic and forgettable.

**Fix:** Make it outcome-driven, e.g.:

> “Train in neuromuscular therapy and deep tissue bodywork with a practitioner who has taught across Asia.”

Also consider adding a photo of Stephen teaching or working to the hero band.

**Files:** `messages/en.json`, `messages/zh-Hant.json`, `components/home/home-view.tsx`.

### 6. Add a cookie-consent banner

**Problem:** The Privacy Policy mentions cookies, but there is no consent UI.

**Fix:** Add a minimal consent banner that records acceptance in localStorage and does not block the page.

**Files:** new component `components/cookie-banner.tsx`, `app/[locale]/layout.tsx`.

### 7. Add `robots.txt` and `sitemap.xml`

**Problem:** Search engines have no guidance on what to crawl; there is no sitemap for indexing.

**Fix:**
- Add `app/robots.ts` or `public/robots.txt`.
- Add `app/sitemap.ts` that lists all public locale routes.

**Files:** `app/robots.ts`, `app/sitemap.ts`.

### 8. Improve Open Graph / social sharing metadata

**Problem:** Sharing the site may show no image or weak description.

**Fix:** Add `openGraph` and `twitter` metadata in the root layout, including a default OG image.

**Files:** `app/[locale]/layout.tsx`, `public/assets/og-image.jpg`.

### 9. Add a floating or sticky “Book” CTA on mobile

**Problem:** On long pages, the booking link is only in the header and page CTAs.

**Fix:** Add a fixed bottom bar on small screens with a single “Book appointment” button that goes to Cliniko.

**Files:** `components/mobile-cta.tsx`, `app/[locale]/layout.tsx`.

---

## P2 — Medium-term improvements

### 10. Professional photography

**Problem:** The site relies heavily on animated backgrounds and a small set of images. Real photos of Stephen, the studio, and seminars would build much more trust.

**Fix:**
- Hero photo or studio shot.
- About-page portrait.
- Course/teaching photos.
- Testimonial thumbnails (Teresa Young currently has none).

**Files:** `public/assets/`, relevant message/image references.

### 11. Better empty state for featured courses

**Problem:** When no published courses exist, the home page shows “New seminar dates will be announced soon.” That is fine, but the section still invites people to “Reserve your seat early.”

**Fix:** Hide the featured-courses band entirely when there are no courses, or show a single “Join the mailing list” CTA instead.

**Files:** `components/home/home-view.tsx`, `messages/en.json`, `messages/zh-Hant.json`.

### 12. Add simple analytics

**Problem:** No visibility into traffic or conversions.

**Fix:** Add privacy-friendly analytics such as Plausible, or Google Analytics 4 if preferred.

**Files:** `.env.production.example`, new analytics component/script.

### 13. Click-to-call and click-to-email

**Problem:** Phone and email on the Contact page are plain text.

**Fix:** Make them clickable (`tel:` and `mailto:`).

**Files:** `components/contact/contact-view.tsx`.

### 14. Expand Chinese translations

**Problem:** Many pages have English-only or partial Chinese content (About, Courses, home hero, etc.).

**Fix:** Add `zh-Hant` versions of all public-facing copy.

**Files:** `messages/zh-Hant.json`.

---

## P3 — Later / nice-to-have

### 15. Blog / content marketing

**Problem:** The site has no regular content to drive organic traffic.

**Fix:** Use the existing BlogPost/CMS infrastructure to publish articles about bodywork techniques, client success stories, and seminar announcements.

### 16. Automated contact-form email notifications

**Problem:** Code exists (`lib/email.ts`) but no provider is configured.

**Fix:** Settle on an email provider (SendGrid, Brevo, SMTP2GO, AWS SES) and add credentials to Vercel.

### 17. Testimonial transcripts

**Problem:** Video testimonials are not accessible to deaf visitors or search engines.

**Fix:** Add optional transcript text to each testimonial card.

### 18. Availability display on Cliniko booking page

**Problem:** Visitors leave the site to book; the booking page could preview Stephen’s specialisations before they go.

**Fix:** Add a short “What to expect” section on the Bookings page.

---

## Suggested order of work

1. **This week:** P0 items (celebrity names, years consistency, Courses page clarity, Admin link).
2. **Next week:** P1 items (hero rewrite, cookie banner, robots/sitemap, OG image, mobile sticky CTA).
3. **Following weeks:** P2 items (photography, analytics, Chinese translations, empty states).
4. **Ongoing:** P3 items (blog, email provider, transcripts).

---

## Notes

- All changes should preserve the existing warm-neutral palette and bilingual support.
- Keep the site lightweight: no heavy animations, no WebGL, no new dependencies unless necessary.
- Every change should pass `npm run lint`, `npm run test -- --run`, and `npm run build` before pushing.
