# NovaFrame Storefront Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-oriented Next.js storefront prototype for the agreed standard-commerce plus custom-RFQ aluminum framing model, with SEO/GEO foundations and an actionable marketing plan.

**Architecture:** Use Next.js 16 App Router and React Server Components for crawlable content, with small client islands for filters, search, cart, and RFQ. Keep all prototype catalog/business facts in typed fixture modules and isolate future Shopify/RFQ adapters behind explicit boundaries.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules/global tokens, Lucide React, Vitest, Testing Library, Playwright browser QA.

---

### Task 1: Project Foundation And Test Harness

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.ts`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Test: `src/lib/catalog.test.ts`

**Steps:**

1. Add the Next.js, React, Lucide, lint, and Vitest dependencies.
2. Write a failing fixture test that expects one purchasable standard item and one RFQ item.
3. Run `pnpm test` and confirm the missing catalog module fails.
4. Add typed fixtures and the minimum shell.
5. Run `pnpm test`, `pnpm lint`, and `pnpm build`.

### Task 2: Design System, Shell, And Homepage

**Files:**
- Create: `src/components/site-header.tsx`, `src/components/site-footer.tsx`, `src/components/ui/*`
- Create: `src/components/home/*`
- Modify: `src/app/page.tsx`, `src/app/globals.css`

**Steps:**

1. Encode design tokens, responsive containers, typography, buttons, and focus states from the accepted concepts.
2. Implement the market notice, responsive header, mobile navigation, footer, and working search/cart entry points.
3. Build homepage sections in the accepted order and use generated project images through `next/image`.
4. Add semantic headings, dual CTAs, engineering-preview labels, and crawlable links.
5. Compare the 1440px first viewport to `public/images/concepts/home-hero.png` before continuing.

### Task 3: Catalog, Product Detail, Search, And Cart

**Files:**
- Create: `src/lib/catalog.ts`, `src/lib/cart.ts`, `src/lib/analytics.ts`
- Create: `src/components/catalog/*`, `src/components/cart/*`, `src/components/search/*`
- Create: `src/app/products/page.tsx`, `src/app/products/[handle]/page.tsx`, `src/app/search/page.tsx`
- Test: `src/lib/catalog.test.ts`, `src/lib/cart.test.ts`

**Steps:**

1. Write failing filter, lookup, and cart total tests.
2. Implement typed fixtures and pure helpers.
3. Build a URL-backed catalog with useful filters and an accessible no-results state.
4. Build a PDP with specs, option state, CAD, freight boundary, FAQ, and Buy/RFQ routing.
5. Build a local cart drawer with quantity/remove behavior and an explicit future Shopify Checkout handoff.
6. Verify search, catalog, PDP, and cart on desktop and mobile.

### Task 4: Applications, Services, Resources, And GEO Content

**Files:**
- Create: `src/app/applications/machine-guarding/page.tsx`
- Create: `src/app/services/page.tsx`
- Create: `src/app/resources/page.tsx`
- Create: `src/app/resources/cutting-tolerances/page.tsx`
- Create: `public/downloads/*`

**Steps:**

1. Add answer-first application/service copy with applicability and limitation blocks.
2. Add HTML specification tables, selection steps, compatibility language, glossary, source basis, and updated dates.
3. Add resource downloads with visible file type/size and analytics events.
4. Add related Product and RFQ links to complete the content-to-conversion path.
5. Verify primary content exists in server-rendered HTML.

### Task 5: RFQ Prototype And Conversion Events

**Files:**
- Create: `src/lib/rfq.ts`, `src/app/api/rfq/route.ts`
- Create: `src/app/rfq/page.tsx`, `src/components/rfq/rfq-form.tsx`
- Test: `src/lib/rfq.test.ts`

**Steps:**

1. Write failing validation tests for contact, shipping, engineering scope, quantity, timeline, consent, and files.
2. Implement pure validation and reference generation.
3. Build the grouped RFQ form with conditional machining fields and file constraints.
4. Implement a prototype API response that stores no uploaded file bytes.
5. Emit `rfq_start`, `file_upload`, and `rfq_submit` events and show confirmation next steps.
6. Verify keyboard, error, pending, success, and server-error states.

### Task 6: Technical SEO And Structured Data

**Files:**
- Create: `src/lib/seo.ts`, `src/components/structured-data.tsx`
- Create: `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/not-found.tsx`
- Modify: all route metadata exports
- Test: `src/lib/seo.test.ts`

**Steps:**

1. Write failing tests for canonical URLs and safe Product JSON-LD without fake Offer/review properties.
2. Add route-specific metadata, canonical, OG/Twitter, breadcrumbs, and schema.
3. Add robots exclusions for search, cart state, API, and RFQ confirmation parameters.
4. Add only indexable routes to the sitemap.
5. Inspect rendered HTML for one H1, canonical, metadata, schema, and crawlable links.

### Task 7: SEO, GEO, And Marketing Deliverables

**Files:**
- Create: `docs/strategy/seo-geo-plan.md`
- Create: `docs/strategy/marketing-plan.md`
- Create: `docs/strategy/measurement-plan.md`

**Steps:**

1. Map product, application, service, and resource intent clusters to routes and schema.
2. Define the GEO entity/content evidence model and publication checklist.
3. Create a 90-day channel, content, offer, landing-page, and outreach plan with weekly gates.
4. Specify GA4/Search Console/Clarity setup, ecommerce/RFQ events, UTM rules, checkout cross-domain validation, and reporting KPIs.
5. Mark dependencies on real brand, Shopify, supplier, logistics, legal, and analytics inputs.

### Task 8: Browser QA, Review Agents, And Closeout

**Files:**
- Create: `docs/qa/fidelity-ledger.md`
- Modify: files identified by review

**Steps:**

1. Run `pnpm lint`, `pnpm test`, and `pnpm build` from a clean state.
2. Start the app and verify desktop and mobile core flows in the browser.
3. Capture screenshots and use `view_image` on the accepted concepts and final renders.
4. Record at least five fidelity comparisons and fix all material drift.
5. Dispatch independent product/UX, code, and SEO/GEO/marketing reviewers.
6. Fix every critical and important finding, then request re-review.
7. Update the Obsidian project handoff with verified state, commands, branch, and next production inputs.

