# Verification — session pricing + package-enquiry CTA

## Scope applied

- Added shared `pricing.*` translation block to `messages/en.json` and `messages/zh-Hant.json`
  (eyebrow, heading, intro, single/package labels, fees, footnote, CTA).
- Added `components/pricing-section.tsx` — shared luxe-card pricing section
  (two cards: single sessions / packages, definition lists, footnote,
  "Enquire about packages" CTA linking to `/{locale}/contact`).
- Wired into `components/bookings/bookings-view.tsx` (between the
  massage-options list and the Cliniko scheduler) as `bookings-pricing`.
- Wired into `components/home/home-view.tsx` (below the massage options)
  as `home-pricing`.
- Whitelisted locale-invariant fee strings (`pricing.priceSingle60`,
  `pricing.priceSingle90`, `pricing.pricePackage60`, `pricing.pricePackage90`)
  in `tests/i18n/translations.test.ts` per the existing
  currency-is-locale-invariant convention.
- Copy uses "session"/"bodywork" wording only; prices HK$1,400 / HK$1,690
  single, HK$1,200 / HK$1,490 per session for 10-session packages.

## Test output

- Unit tests (`npm run test -- --run`): 28 files, 206/206 passed.
- E2E (`npm run e2e`): 10/10 passed (chromium + mobile-chromium),
  including booking flow, home smoke, language switcher, mobile nav.
- Build (`npm run build`): succeeded after resolving P3005 with
  `npx prisma migrate resolve --applied 20260916180000_init_postgres`
  (baseline for the existing non-empty Postgres schema, as instructed).
- Render check (production server): pricing markup present on
  `/en/bookings`, `/en`, `/zh-Hant/bookings` with translated copy
  (療程收費 / HK$1,400 / 每節 HK$1,200) and CTA linking to
  `/zh-Hant/contact`. Screenshot reviewed: matches luxe-card style.

## Lint output

- `npm run lint`: clean — no warnings or errors.
- `npx tsc --noEmit`: clean.

## Remaining failures

None.

## Verdict

ALL_PASS
