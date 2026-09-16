# Home Page Refresh, Performance & Navigation Plan

## Goal
Make the site easier to navigate, give the home page a lightweight animated background, and improve performance on phones, tablets and older laptops while keeping all existing tests green.

## Constraints
- No new runtime dependencies (except `sharp`, which is the recommended Next.js image optimizer).
- Keep the warm neutral brand palette and bilingual `en` / `zh-Hant` support.
- Preserve admin auth, booking, payment and CMS flows.
- Keep the stripped, non-template feel — no glassmorphism, no heavy particles/canvas.
- All quality gates must pass: lint, typecheck, unit tests, build, e2e.

## Key Decisions

### D038 — Home hero background becomes a CSS-only animated gradient mesh
- Replace the static hero parallax image on `/[locale]` with a slow, warm gradient mesh animation.
- Implemented as a tiny server/client-agnostic CSS layer + a small component, no Canvas/WebGL, no extra libraries.
- Animation respects `prefers-reduced-motion`.

### D039 — Global background texture is lighter and cheaper
- Replace the fixed full-bleed `page-background.jpg` animation with a much smaller, seamlessly tileable texture or a pure CSS grain/noise layer.
- This removes a large fixed composited layer that currently scrolls/transforms on every frame.

### D040 — Navigation gets hover/active states and a cleaner public menu
- Add a client `MainNav` component using `usePathname` to highlight the current page.
- Hover state: transition to `text-primary`.
- Active state: `text-primary` + underline.
- Remove `Admin` from the public header (keep it in the footer).
- Add a clear primary action in the header when appropriate (e.g. `Courses`/`Book`).

### D041 — Home page information architecture is restructured
Re-order and group the home page so a visitor can scan in one pass:
1. **Hero** — value proposition + two CTAs.
2. **What we offer** — 3 clear offering cards (Seminars, Hands-on training, Assessment & planning) using existing training copy.
3. **Featured courses** — upcoming seminars with a single, prominent CTA.
4. **About Stephen** — short portrait + credentials + link to full about page.
5. **Testimonials teaser** — one strong quote + link to testimonials.
6. **Closing CTA** — contact/book path.

Remove the disjointed "Support" band and avoid duplicating the same CTAs in multiple places.

## Chunks

### Chunk 1 — Performance foundation (simple)
**Files changed:**
- `package.json` (add `sharp` to dependencies)
- `next.config.ts` (enable `images.formats: ['image/avif', 'image/webp']`, `minimumCacheTTL`)
- `app/globals.css` (replace fixed `page-background.jpg` animation with lightweight tiled/grain layer, add `@keyframes gradient-mesh`)
- `components/animations/parallax-image.tsx` (respect `prefers-reduced-motion`, disable parallax when motion is reduced)
- `components/animations/animated-section.tsx`, `fade-in.tsx`, `stagger-children.tsx` (disable entrance animations on `prefers-reduced-motion`)

**Acceptance:**
- `npm run build` still succeeds.
- `npm run e2e` and `npm run test -- --run` still pass.
- Body texture layer is a tiny image/CSS, not a cover photo.

### Chunk 2 — Navigation hover/active states (simple)
**Files changed:**
- `components/main-nav.tsx` (new client component)
- `app/[locale]/layout.tsx` (replace inline `<ul>` with `<MainNav locale={locale} />`, remove admin link, add footer admin link)
- `messages/en.json` + `messages/zh-Hant.json` (`footer.admin` if needed)

**Acceptance:**
- Header links change color on hover.
- Active page link is visually distinct.
- Admin link is only in the footer.
- E2E language-switcher test still passes.

### Chunk 3 — Home page animated background (simple)
**Files changed:**
- `components/home/animated-hero-background.tsx` (new)
- `components/home/home-view.tsx` (swap `ParallaxImage` for `AnimatedHeroBackground`, keep overlay readable)
- `app/globals.css` (add `gradient-mesh` keyframes and `.hero-gradient` utilities)

**Acceptance:**
- Hero has a slow, warm animated gradient background.
- Animation pauses when `prefers-reduced-motion` is set.
- Hero text remains readable (light overlay + dark text).

### Chunk 4 — Home page information architecture restructure (simple)
**Files changed:**
- `components/home/home-view.tsx` (reorder sections, merge training into "What we offer", add testimonials teaser, tighten CTAs)
- `app/[locale]/page.tsx` (pass featured testimonial data if needed)
- `messages/en.json` + `messages/zh-Hant.json` (`home.offerings.*`, `home.testimonials.*`, update CTA copy)
- `tests/pages/home.test.tsx` (update section selectors if changed)

**Acceptance:**
- Home page has exactly one clear path: Hero → Offerings → Courses → About → Testimonials → CTA.
- No duplicated CTAs or isolated "Support" band.
- Home unit tests and e2e tests pass.

### Chunk 5 — Cross-page consistency cleanup (simple)
**Files changed:**
- `components/about/about-view.tsx`, `components/courses/courses-view.tsx`, `components/course-detail/course-detail-view.tsx`, `components/contact/contact-view.tsx` (apply consistent vertical rhythm, remove scattered duplicate links)
- Public page server components as needed.

**Acceptance:**
- Each public page has one clear H1, one primary CTA above the fold, and a single closing CTA band.
- No visual regressions in e2e screenshots.

### Chunk 6 — Verification (simple)
**Files changed:**
- No source changes; run quality gates.

**Acceptance:**
- `npm run lint` clean.
- `npm run typecheck` / `tsc --noEmit` clean.
- `npm run test -- --run` all pass.
- `npm run build` succeeds.
- `npm run e2e` all pass.
