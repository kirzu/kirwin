# Plan: Kirwin Bodyworks Dynamic Site
---

## Goal
  Build and deploy a bilingual dynamic website for Stephen Kirwin Bodywork Seminars with
  public pages, an admin CMS, course booking, Stripe payments, and a blog.

--- INTENT CHARTER ---
Intent (the user's original request, verbatim): https://www.kirwinbodyworks.com/
Wow factor (what would delight, not merely satisfy): A fully functional bilingual booking and payment experience that turns a simple brochure site into a working business platform for a bodywork training business.
Confirmed scope (in / explicitly out): Build a dynamic, bilingual website for Stephen Kirwin Bodywork Seminars including public pages, a built-in admin CMS, course booking, Stripe payments, and a blog. Preserve existing brand content from the current Zyro site. SQLite is used for the database; swapping to PostgreSQL for production is out of scope for this Ferment.
Acceptance demo (beats the final walkthrough must show): Load the site and switch between English and Traditional Chinese. Browse the Home, About, Courses, and Contact pages. Select a course, submit a booking, and complete a Stripe test payment. Log into the admin dashboard to create/edit courses, manage blog posts, update site content, and view bookings.
Grade against this charter — it records the user's original intent. The plan and criteria below are a refinement of it; where they read narrower than the intent, the intent wins unless the charter's confirmed scope says otherwise.

## Success criteria
  - A deployable Next.js + TypeScript web app exists with responsive Home, About, Courses,
    Contact pages that preserve the current brand/content.
  - A password-protected CMS admin dashboard allows CRUD management of courses, blog posts,
    site content sections, and business contact settings.
  - A booking system lets visitors book courses/appointments; admin can set availability and
    view bookings.
  - Multi-language support is implemented (English + Traditional Chinese) with language
    switcher and route-based i18n.
  - Stripe payment integration handles online payments for course bookings, with test-mode
    verification.
  - A blog is live with published posts rendered from the CMS, including list and detail
    views.
  - Automated tests exist for critical flows: booking, payments, CMS CRUD, i18n switching
    (target ≥1.0 test-to-LOC ratio for backend/domain logic).
  - README includes local setup, environment variables, Stripe test instructions, and
    deployment guidance.
  - The site builds successfully (`npm run build` exits 0) and passes lint/tests (`npm run
    lint && npm run test`).

## Constraints
  - Use Next.js App Router with TypeScript and Tailwind CSS.
  - Use Prisma ORM with SQLite for local/demo; production database swap is out of scope.
  - Use NextAuth.js/Auth.js credentials provider for admin authentication; OAuth is out of
    scope.
  - Do not use an external headless CMS; the CMS is a built-in admin dashboard.
  - Preserve existing brand content and imagery from https://www.kirwinbodyworks.com/.
  - The site must be mobile-responsive and accessible.

## Assumptions
  - The deliverable is a greenfield Next.js project created in the current workspace. SQLite
    is acceptable for this Ferment, with PostgreSQL migration left as a future step. Stripe
    integration will operate in test mode
  - live payment processing is out of scope. An admin user will be seeded via a one-time
    script or environment variables. Existing site copy and images can be referenced or
    copied from the current Zyro site. Traditional Chinese (zh-Hant) translations can start
    with placeholder/machine copy and be refined later. The user selected the default stack,
    so the plan chooses Next.js 14+, Prisma, NextAuth.js, next-intl, and Stripe.

## Scope decisions (vs the literal request)
- The existing site is a simple Zyro landing page; this plan expands it into a dynamic platform with booking, CMS, payments, and blog.
- The user selected 'default stack'; the plan narrows this to Next.js 14+ / TypeScript / Tailwind / Prisma / SQLite / NextAuth.js / next-intl / Stripe.
- Live payments and production hosting/deployment are out of scope; Stripe runs in test mode and deployment instructions are documentation-only.

## Constraint costs
- Use Prisma ORM with SQLite for local/demo — costs: SQLite is not ideal for production concurrency; future migration to PostgreSQL will be needed.
- Use NextAuth.js credentials provider for admin auth — costs: Admin users must be seeded/managed manually; no OAuth SSO or password-reset flow in scope.
- Do not use an external headless CMS — costs: CMS features are basic CRUD; advanced editorial workflows, media libraries, and versioning are not included.

## Quality dimensions
- Consistent bilingual UX across all public and admin pages (i18n coverage).
- Mobile-responsive layout and accessible components via Tailwind/shadcn/ui.
- Trustworthy booking and payment flow with clear confirmation and error states.
- Admin dashboard usability: clear navigation, form validation, and status visibility.

## Self-critique (meh-test)
The plan treats every selected feature as an MVP. Production hardening—CI/CD, monitoring, advanced SEO, real email delivery, production database tuning, and comprehensive Stripe edge-case handling—is out of scope. Race conditions in availability are mitigated by atomic Prisma operations and tests, but high-concurrency production behavior is not exhaustively proven.

## Phases
---

### Phase 1: Foundation & Database Schema
**Goal:** Bootstrap the project, configure tooling, define the database schema, and set up
          authentication and i18n.
**Steps:**
- Initialize Next.js 14+ with TypeScript, Tailwind CSS, ESLint, App Router; install
  shadcn/ui and base components. Creates package.json, app/, components/ui/, lib/,
  prisma/.
- Configure Prisma with SQLite and define schema for User, Course, Booking, BlogPost,
  SiteContent, Payment, and Availability. Creates prisma/schema.prisma and a seed
  script.
- Configure NextAuth.js/Auth.js credentials provider for admin login; add admin seed
  script at scripts/seed.ts. Creates app/api/auth/[...nextauth]/route.ts.
- Configure next-intl with messages/en.json and messages/zh-Hant.json; set up
  middleware.ts and locale routing. Creates i18n config files.
- Add shared layout with navigation shell, footer, and language switcher. Creates
  app/[locale]/layout.tsx and components/layout/.

### Phase 2: Public Site Pages
**Goal:** Implement public-facing pages that carry over the current brand content.
**Steps:**
- Build the Home page (hero, training/experience/support sections). Creates
  app/[locale]/page.tsx.
- Build the About page with biography and images. Creates app/[locale]/about/page.tsx.
- Build the Courses listing page. Creates app/[locale]/courses/page.tsx.
- Build the Course detail page with a booking CTA. Creates
  app/[locale]/courses/[slug]/page.tsx.
- Build the Contact page with contact form. Creates app/[locale]/contact/page.tsx.

### Phase 3: Admin CMS
**Goal:** Build a password-protected admin dashboard for managing content and bookings.
**Steps:**
- Create admin layout with auth guard redirecting non-admin users. Creates
  app/(admin)/layout.tsx and app/(admin)/page.tsx.
- Implement courses CRUD (list, create, edit, delete) using server actions and forms.
  Creates app/(admin)/courses/ and lib/actions/courses.ts.
- Implement blog posts CRUD. Creates app/(admin)/blog/ and lib/actions/blog.ts.
- Implement site content sections CRUD (hero, about, contact info). Creates
  app/(admin)/content/ and lib/actions/content.ts.
- Implement bookings management view (list, status update). Creates
  app/(admin)/bookings/ and lib/actions/bookings.ts.

### Phase 4: Booking System
**Goal:** Implement the booking flow and availability management.
**Steps:**
- Add Availability model and admin availability CRUD. Updates prisma/schema.prisma and
  creates app/(admin)/availability/ and lib/actions/availability.ts.
- Implement booking form on course detail pages with Zod + React Hook Form validation.
  Updates app/[locale]/courses/[slug]/page.tsx and creates
  components/booking-form.tsx.
- Create booking server action that checks availability atomically and creates a
  Booking record. Creates lib/actions/booking.ts.
- Add booking confirmation page. Creates app/[locale]/booking/confirmed/page.tsx.

### Phase 5: Stripe Payments & Blog Polish
**Goal:** Integrate Stripe payments and complete the public blog experience.
**Steps:**
- Configure Stripe SDK and webhook route; document required env vars. Creates
  app/api/stripe/webhook/route.ts and lib/stripe.ts.
- Implement Stripe Checkout session creation linked to a booking. Updates
  lib/actions/booking.ts and adds components/payment-button.tsx.
- Add payment success/cancel pages and update booking status on webhook. Creates
  app/[locale]/payment/success/page.tsx and app/[locale]/payment/cancel/page.tsx.
- Implement public blog listing page. Creates app/[locale]/blog/page.tsx.
- Implement blog post detail page. Creates app/[locale]/blog/[slug]/page.tsx.
- Complete Traditional Chinese translations and add SEO metadata across public pages.
  Updates messages/zh-Hant.json and page metadata exports.

### Phase 6: Tests, Documentation & Build Verification
**Goal:** Finalize test coverage, documentation, and production build.
**Steps:**
- Set up Vitest + React Testing Library and write unit/integration tests for domain
  logic and server actions. Creates vitest.config.ts and tests/**/*.test.ts.
- Add Playwright E2E tests for booking and payment flows. Creates playwright.config.ts
  and e2e/**/*.spec.ts.
- Write README with setup, environment variables, Stripe test instructions, and
  deployment guidance. Creates README.md.
- Run final lint, typecheck, and production build.

---