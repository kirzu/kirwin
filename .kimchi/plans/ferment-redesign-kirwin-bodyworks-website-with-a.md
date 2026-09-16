# Plan: Kirwin Visual Redesign
---

## Goal
  Redesign the Kirwin Bodywork Seminars website with rich GSAP animations, a derived brand
  palette, and richer media/content scraped from the original kirwinbodyworks.com site, while
  preserving the existing CMS, booking, payments, i18n, and test infrastructure.

--- INTENT CHARTER ---
Intent (the user's original request, verbatim): Redesign Kirwin Bodyworks website with animations, richer brand media, and content scraped from the original kirwinbodyworks.com site
Wow factor (what would delight, not merely satisfy): A visually distinctive, motion-rich bilingual site that feels like a premium wellness brand, with fluid scroll animations and real photography from the original business.
Confirmed scope (in / explicitly out): Public pages (Home, About, Courses, Course detail, Blog list/detail, Contact) plus the admin dashboard get visual and animation redesign. Booking, payments, CMS, i18n, auth, and tests are preserved and updated. Media and copy are scraped from the original site.
Acceptance demo (beats the final walkthrough must show): Open http://localhost:3000 to see an animated hero with Stephen's portrait and logo, scroll to see staggered section reveals, navigate to /about for an animated biography timeline with credentials, /courses for animated course cards, and /admin for a refreshed dashboard. Run npm run e2e to confirm the booking flow still works after the redesign.
Grade against this charter — it records the user's original intent. The plan and criteria below are a refinement of it; where they read narrower than the intent, the intent wins unless the charter's confirmed scope says otherwise.

## Success criteria
  - Original brand assets (logo, photos, copy) are scraped from kirwinbodyworks.com and
    stored locally under public/assets/ with a manifest.
  - A derived color palette and typography scale are configured in tailwind.config.js and
    applied across public pages and admin UI.
  - GSAP and @gsap/react are installed and used for scroll-triggered, stagger, and hero
    animations on public pages.
  - All public pages (Home, About, Courses, Course detail, Blog list/detail, Contact) are
    redesigned with cohesive layout, animations, and richer media.
  - Admin dashboard pages are visually refreshed with the new palette and improved layout
    while preserving all CMS CRUD behavior.
  - All existing functionality is preserved: i18n switching, NextAuth login, booking flow,
    Stripe payment code, CMS CRUD.
  - npm run test passes (unit/integration baseline updated as needed).
  - npm run e2e passes (6 Playwright specs baseline or updated count).
  - npm run lint && npm run typecheck && npm run build all exit 0.

## Constraints
  - No changes to database schema or Prisma models unless required by redesign.
  - Preserve existing NextAuth middleware and admin authorization behavior.
  - Keep existing i18n message keys stable or migrate them with matching zh-Hant updates.
  - Do not break existing Vitest or Playwright tests; update selectors/assertions when DOM
    changes.
  - No production Stripe keys; Stripe integration remains test-mode/env-driven.
  - All work stays under /Users/ios/.
  - Animations must not block core interactions or cause layout shift that fails tests.

## Assumptions
  - The user owns the rights to reuse images and copy from kirwinbodyworks.com. GSAP is
    acceptable as a new dependency. The derived palette will be warm/neutral wellness tones
    pulled from Stephen's portrait and the original site. Reduced-motion preference will not
    be enforced per the user's answer, but animations will be togglable in code for future
    accessibility. The admin UI refresh will be cosmetic (Tailwind classes, spacing, cards)
    and will not change form validation or server actions. Original site media URLs are
    stable enough to download once
  - if a download fails, a placeholder note will be recorded.

## Scope decisions (vs the literal request)
- The user's request focused on animations and uniqueness; we also refresh the admin dashboard to keep a cohesive brand experience rather than leaving it visually disjointed.
- Original site has limited video; we will reuse existing photos and logo rather than introduce stock video.

## Constraint costs
- No new Prisma schema changes — costs: Cannot add fields like course images; media will be served from public/assets/ or referenced inline.
- No production Stripe keys — costs: Payment button and webhook remain inactive until user supplies keys; tests will mock or skip live Stripe.
- No reduced-motion enforcement — costs: Some users with motion sensitivity will still see animations; can be added later via prefers-reduced-motion.

## Quality dimensions
- Visual coherence: all public pages and admin must share the same palette, typography, and spacing tokens.
- Animation performance: GSAP tweens should use transform/opacity, avoid animating layout properties, and not cause jank on mobile.
- Content accuracy: scraped copy must match the original site and be properly localized in zh-Hant (machine translation acceptable with allow-list for proper nouns).
- Test stability: redesigned DOM must keep data-testid hooks needed by Playwright; tests must be updated if selectors change.

## Self-critique (meh-test)
The success criteria cover visual, animation, content, and functional preservation, but 'looks unique' is inherently subjective. We mitigate this by deriving a real palette from brand photos, using GSAP for non-generic motion, and scraping original content. Admin refresh is limited to cosmetic changes to avoid scope creep. If the user wants further uniqueness (e.g., custom illustrations, video background), that would require a follow-up ferment.

## Phases
---

### Phase 1: Design Foundation & Asset Pipeline
**Goal:** Scrape original site assets, establish the new brand tokens, and create reusable
          animation primitives.
**Steps:**
- Scrape original site and download logo + photos to public/assets/, skipping failures
  with manifest notes.
- Update tailwind.config.js with derived brand colors, custom font (e.g., Inter + a
  serif display), and extended animation tokens.
- Update globals.css CSS variables to match the new palette for both light and dark
  modes.
- Install gsap and @gsap/react as dependencies.
- Create reusable animation components: AnimatedSection, FadeIn, StaggerChildren,
  ParallaxImage, and a useScrollReveal hook.
- Add unit tests for animation utilities and smoke test that GSAP registers correctly.

### Phase 2: Public Pages Redesign — Home, About, Contact
**Goal:** Apply the new design system and GSAP animations to the three highest-impact public
          pages.
**Steps:**
- Redesign Home page with full-bleed hero, animated headline, logo, Stephen portrait,
  staggered training cards, and a course preview section.
- Update messages/en.json and messages/zh-Hant.json with new home copy and
  original-site taglines.
- Redesign About page with animated biography sections, full credentials list,
  original portrait/therapy photos, and a timeline/FAQ section.
- Redesign Contact page with animated two-column layout, embedded map link, opening
  hours, and refreshed ContactForm styling.
- Update Vitest snapshots/tests for Home, About, Contact if selectors changed.

### Phase 3: Courses, Blog, Booking & Payment Pages Redesign
**Goal:** Apply cohesive styling and motion to the remaining public pages while preserving
          booking and payment flows.
**Steps:**
- Redesign Courses listing with animated cards, filters, and hero image.
- Redesign Course detail page with animated syllabus, instructor callout, and booking
  form styling.
- Redesign Blog list and detail pages with card animations and typography refresh.
- Redesign booking confirmation and payment success/cancel pages with shared status
  animation components.
- Update E2E selectors in e2e/booking.spec.ts, e2e/home.spec.ts,
  e2e/admin-login.spec.ts to match redesigned DOM.

### Phase 4: Admin Dashboard Visual Refresh
**Goal:** Refresh the admin UI with the new brand palette and improved layout without changing
          behavior.
**Steps:**
- Update admin dashboard layout and navigation with new palette and responsive
  sidebar/sheet.
- Refresh admin list pages (courses, blog, bookings, availability, content) with
  styled tables/cards and hover transitions.
- Refresh admin forms with new input/button styling and section animations.
- Run admin-related unit and E2E tests to ensure CRUD still works.

### Phase 5: Final Verification & Build
**Goal:** Ensure the redesigned site passes all quality gates and the production build is clean.
**Steps:**
- Run npm run lint and fix any style issues.
- Run npm run typecheck and fix TypeScript errors.
- Run npm run test and verify all unit/integration tests pass.
- Run npm run e2e and verify all specs pass.
- Run npm run build and confirm clean production output.

---