# Kirwin Bodywork Seminars — Variety & Content Refresh

## Goal
Make the redesigned site feel less template-driven and more authentic to the original `kirwinbodyworks.com` by:
1. Giving each public page a distinct visual rhythm.
2. Reducing congested text squares/cards and replacing them with cleaner typography and whitespace.
3. Pulling in more original copy, photos, and the testimonials section from the source site.
4. Replacing the public blog with a testimonials section.

## Constraints
- Keep the existing brand palette, GSAP animation primitives, Tailwind setup, and admin auth/booking/payment flows.
- Do not add new runtime dependencies.
- Preserve all existing CMS behaviour; repurpose the `BlogPost` model/table for testimonials so the admin UI stays useful.
- Maintain bilingual `en` / `zh-Hant` support; update `zh-Hant.json` alongside `en.json`.
- All quality gates must remain green: lint, typecheck, test, e2e, build.

## Key Decisions
- **D033 — Repurpose `BlogPost` for testimonials**: Add `rating`, `youtubeUrl`, `imageUrl` nullable columns, keep the table name to avoid a risky SQLite rename migration. Public routes change from `/blog` to `/testimonials`; admin labels change from "Blog" to "Testimonials".
- **D034 — Static original course-highlight content on `/courses`**: The original `/courses` page is a single four-day intensive. The new `/courses` page will lead with that static content (overview + Day 1-4 highlights + location) and then list the CMS-managed course sessions below.
- **D035 — Hero variation by page**: Each public page keeps the parallax hero but varies overlay density, text width, and optional inner elements (logo, search, meta chips, pull-quote) so pages no longer share the exact same silhouette.
- **D036 — De-card congested blocks**: Nested credential cards become plain definition lists; contact detail rows become a 2-col icon grid; course-detail stops duplicating price/duration in hero chips and sidebar.
- **D037 — YouTube thumbnails as testimonial imagery**: Download `hqdefault.jpg` thumbnails for the three original testimonials and store them in `public/assets/`.

## Chunks

### Chunk 1 — Asset pipeline (simple)
**Files changed:**
- `public/assets/course-stephen.jpg` (new)
- `public/assets/course-advanced.jpg` (new)
- `public/assets/testimonial-alex.jpg` (new)
- `public/assets/testimonial-walter.jpg` (new)
- `public/assets/testimonial-danielle.jpg` (new)
- `public/assets/manifest.json` (updated)

**Work:**
1. Download the two additional original bodywork photos from Zyrosite assets used on the original courses page:
   - `https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1200,fit=crop/oF0s9HPFI6pEG5MB/stephen-4SoRwkNiEfEVH9rH.jpeg`
   - `https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1200,fit=crop/oF0s9HPFI6pEG5MB/c98be8f7-756d-48fc-a0b3-52aadddbff6f-BL6IVnuVg4gBqBq8.jpeg`
2. Download YouTube `hqdefault.jpg` thumbnails for testimonials:
   - `https://i.ytimg.com/vi/v_jcsCvFKcA/hqdefault.jpg`
   - `https://i.ytimg.com/vi/1WcwkXCm9as/hqdefault.jpg`
   - `https://i.ytimg.com/vi/GvfGYG6xotw/hqdefault.jpg`
3. Append entries to `public/assets/manifest.json` documenting source URLs.

**Acceptance:**
- All 5 new files exist and are non-empty.
- `manifest.json` validates as JSON and contains all assets.

---

### Chunk 2 — Schema & seed for testimonials (simple)
**Files changed:**
- `prisma/schema.prisma`
- `prisma/migrations/` (new migration generated)
- `prisma/seed.ts`

**Work:**
1. Add nullable fields to `BlogPost`:
   - `rating      Int?` (validated 1-5 in admin action)
   - `youtubeUrl  String?`
   - `imageUrl    String?`
2. Create and apply a Prisma migration: `npx prisma migrate dev --name add_testimonial_fields`.
3. Update `prisma/seed.ts` to upsert three testimonials (Alex, Walter, Danielle) using the original quotes, ratings, youtube URLs, and local thumbnail paths.
4. Run `npx prisma generate`.

**Acceptance:**
- `npx prisma generate` succeeds.
- `npx prisma db seed` runs without errors and creates the three testimonials.
- `SELECT * FROM BlogPost` shows three rows with rating/youtubeUrl/imageUrl populated.

---

### Chunk 3 — Admin CMS relabel to Testimonials (simple)
**Files changed:**
- `lib/actions/blog.ts` (handle new fields, revalidate `/testimonials` instead of `/blog`)
- `components/admin/blog-form.tsx` (add rating, youtubeUrl, imageUrl inputs; labels say "Testimonial")
- `app/[locale]/admin/page.tsx` (dashboard card title/description)
- `app/[locale]/admin/(dashboard)/blog/page.tsx` (labels, empty state)
- `app/[locale]/admin/(dashboard)/blog/new/page.tsx` (page heading)
- `app/[locale]/admin/(dashboard)/blog/[id]/edit/page.tsx` (page heading)
- `components/admin-shell.tsx` (nav label/icon — swap `Newspaper` for `Quote` and label "Testimonials")
- `messages/en.json` + `messages/zh-Hant.json` (`admin.nav.blog` → `admin.nav.testimonials`, `admin.dashboard` intro, form labels if any)

**Work:**
1. In `blog-form.tsx` add numeric rating (1-5) input, youtubeUrl input, imageUrl input. Existing title/titleZh become "Name" (author) and "Name (繁體中文)"; existing excerpt becomes "Short pull quote"; content becomes "Full testimonial". Keep bilingual pattern.
2. In `lib/actions/blog.ts` parse the three new fields, validate rating is 1-5 if provided, store youtubeUrl/imageUrl, revalidate `/${locale}/testimonials`.
3. Update admin page copy to say "Testimonials" instead of "Blog posts" everywhere.

**Acceptance:**
- Admin nav shows "Testimonials".
- Create/edit form includes Rating, YouTube URL, Image URL fields.
- Creating a testimonial saves the fields and redirects to admin testimonials list.

---

### Chunk 4 — Public nav & route swap (simple)
**Files changed:**
- `app/[locale]/layout.tsx`
- `app/[locale]/blog/page.tsx` (delete)
- `app/[locale]/blog/[slug]/page.tsx` (delete)
- `app/[locale]/testimonials/page.tsx` (new)
- `app/globals.css` (remove `.blog-article` styles if any)
- `messages/en.json` + `messages/zh-Hant.json` (`nav.blog` → `nav.testimonials`, new `testimonials.*` namespace, remove public `blog.*` keys except where reused for admin)

**Work:**
1. Rename nav link `/blog` → `/testimonials`, label "Testimonials".
2. Remove public blog server pages and components.
3. Create `app/[locale]/testimonials/page.tsx` server component that fetches published testimonials and renders the new `TestimonialsView`.

**Acceptance:**
- `/en/testimonials` resolves and renders.
- `/en/blog` returns 404.
- Nav no longer links to Blog.

---

### Chunk 5 — Home page refresh (simple)
**Files changed:**
- `components/home/home-view.tsx`
- `app/[locale]/page.tsx` (if data shaping changes)
- `messages/en.json` + `messages/zh-Hant.json` (`home.*` keys)

**Work:**
1. Update hero copy to the original tagline: "Develop the tools to provide effective therapeutic care and promote wellness in your clients." Keep the logo but make the headline smaller/human.
2. Replace the 4-column training card grid with a cleaner 2+2 or 3+1 layout and reduce card border/visual weight; use `bg-card/60` and less padding.
3. Remove the nested Stephen credentials card inside the Experience section; replace with a simple bulleted list or definition list. Use `about-therapy.jpg` as the experience image to differentiate from the hero.
4. Keep the courses preview but use a single horizontal row or 2-col layout instead of 3-col grid, with less metadata repetition.
5. Tighten the Support and closing CTA bands — fewer words, more whitespace.

**Acceptance:**
- Home renders without nested credential `Card`.
- `home-view.tsx` uses at least one image not used on other pages for the Experience section.
- Page still passes `tests/pages/home.test.tsx` (update if needed).

---

### Chunk 6 — About page refresh (simple)
**Files changed:**
- `components/about/about-view.tsx`
- `messages/en.json` + `messages/zh-Hant.json` (`about.*` keys)

**Work:**
1. Replace bio with the original about copy (29+ years, University of Colorado, Boulder College, CU Physical Therapy Center, Boulder private practice, Ironman, elite athletes/clients, modalities, wellness centers).
2. Render the elite-athlete/client list and the wellness-centers list as clean typography columns, not cards.
3. Remove the nested credentials card; show credentials as a horizontal or 2-col definition list.
4. Keep milestones but reduce to 2+2 asymmetric grid and add a pull-quote card.
5. Keep FAQs but tighten padding and remove heavy borders.

**Acceptance:**
- About page includes original athletes list and wellness-centers list.
- No card-in-card in the bio section.
- `tests/pages/about.test.tsx` passes (update if needed).

---

### Chunk 7 — Courses listing refresh (simple)
**Files changed:**
- `components/courses/courses-view.tsx`
- `messages/en.json` + `messages/zh-Hant.json` (`courses.*` keys)

**Work:**
1. Hero: title "Our Services", subtitle "Intensive Training in neuromuscular therapy and restorative bodywork." Use the original `course-hands-on.jpg` but with a lighter overlay.
2. Add a static "Overview" prose block pulled from the original `/courses` page.
3. Add "Course Highlights" Day 1-4 section using original module copy, displayed as an alternating image/text split (image left/right per row) with the new photos.
4. Add a "Location" band with address and hours from the original site.
5. Keep the CMS course listing below the highlights but render as a clean 2-col split-row list with less duplicated metadata (remove price from footer and image chip; keep one price/duration line).

**Acceptance:**
- `/courses` shows Day 1-4 highlights and location.
- Course cards no longer show price three times.
- `tests/pages/courses.test.tsx` passes (update if needed).

---

### Chunk 8 — Course detail refresh (simple)
**Files changed:**
- `components/course-detail/course-detail-view.tsx`
- `messages/en.json` + `messages/zh-Hant.json` (`courseDetail.*` keys)

**Work:**
1. Remove hero meta chips OR the at-a-glance card (keep one). Recommended: keep at-a-glance, remove chips.
2. Replace the overview `Card` and at-a-glance `Card` with flatter bordered sections or simple typography.
3. Remove the second instructor credentials card inside the instructor section; use a simple list.
4. Tighten the booking CTA band.

**Acceptance:**
- Course detail no longer shows price/duration/seats in four places.
- No nested instructor card.
- Booking form and payment flow continue to work.

---

### Chunk 9 — Testimonials view (simple)
**Files changed:**
- `components/testimonials/testimonials-view.tsx` (new)
- `components/testimonials/testimonial-card.tsx` (new, optional)
- `app/[locale]/testimonials/page.tsx`
- `messages/en.json` + `messages/zh-Hant.json` (`testimonials.*` keys)

**Work:**
1. Build a `TestimonialsView` that receives `TestimonialListItem[]`.
2. Hero uses a soft brand-warm gradient (no heavy overlay) with eyebrow "Client stories" and title "What clients say".
3. List testimonials as large quote cards: author name, star rating (terracotta), full quote, YouTube thumbnail image, and a "Watch on YouTube" link.
4. Use a staggered 1-col layout on mobile, 2-col on desktop.
5. Empty state when no published testimonials.

**Acceptance:**
- `/testimonials` renders Alex, Walter, Danielle from seed.
- Each card displays 5 stars and links to the original YouTube video.
- `tests/testimonials/list.test.ts` passes (new tests).

---

### Chunk 10 — Contact page refresh (simple)
**Files changed:**
- `components/contact/contact-view.tsx`
- `messages/en.json` + `messages/zh-Hant.json` (`contact.*` keys)

**Work:**
1. Replace the 5 stacked bordered contact-detail rows with a 2-column icon grid (Phone/Email, Location/Hours, Instagram).
2. Keep the map image card but reduce its visual weight (remove extra overlay text chip, keep clean image + button).
3. Slightly smaller hero and fewer repeated CTAs.

**Acceptance:**
- Contact page renders all contact details in a 2-col grid.
- Form still submits.
- `tests/pages/contact.test.tsx` passes (update if needed).

---

### Chunk 11 — Tests & i18n cleanup (simple)
**Files changed:**
- `tests/blog/list.test.ts` (delete or rename)
- `tests/blog/detail.test.ts` (delete)
- `tests/testimonials/list.test.ts` (new)
- `tests/i18n/translations.test.ts` (update IDENTICAL_ALLOWED)
- `tests/i18n/zh-Hant-content.test.ts` (update if assertions change)
- `tests/pages/blog.test.tsx` (already deleted; confirm gone)
- `tests/setup.ts` (no change expected)
- `e2e/home.spec.ts` and other E2E specs if selectors changed

**Work:**
1. Delete old blog tests.
2. Add testimonials list tests: renders seeded testimonials, stars, links, empty state.
3. Update `translations.test.ts` IDENTICAL_ALLOWED for new proper nouns/ICU templates.
4. Update zh-Hant regression test to cover new testimonials namespace and about content.
5. Update any E2E selector that referenced the old nav/blog link.

**Acceptance:**
- `npm run test -- --run` passes with new baseline counts.
- `npm run e2e` passes.

---

### Chunk 12 — Verification (simple)
**Work:**
1. Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run e2e`, `npm run build`.
2. Fix any failures.

**Acceptance:**
- All five commands exit 0.

## Verification Strategy
- Each chunk includes acceptance criteria and runs `npm run test` and `npm run lint` after changes.
- Final verification runs the full quality gate suite.
- E2E tests exercise the new nav and testimonials page.

## Risks
- **DB migration drift**: Local dev DB may already have data. Adding nullable columns is safe; if migration fails, the builder will create a fresh migration after `prisma migrate reset` in a throwaway environment only if no critical data exists. (This is a demo project.)
- **zh-Hant translation quality**: New English copy will need corresponding Chinese translations. Use concise machine translations and add English proper nouns to `IDENTICAL_ALLOWED`.
- **Test flakiness**: Changing DOM will require updating selectors. The builder must keep `data-testid` attributes stable for booking/payment tests.
- **Image copyright**: Assets are scraped from the original business site per prior decisions.
