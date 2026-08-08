# TIDEFORM Furniture Storefront Implementation Plan

Status: Completed on 2026-08-08.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reposition the existing Next.js prototype as a complete aluminum-frame and marine-grade-panel furniture storefront with standard ecommerce and custom-project RFQ paths.

**Architecture:** Retain the tested App Router shell, cart, RFQ validation, analytics helpers, and SEO evidence gates. Replace the industrial fixture/content layer and route presentation with a typed furniture model, furniture-specific pages, product assets, and responsive components while preserving prototype publication safeguards.

**Tech Stack:** Next.js 16, React 19, TypeScript, global design tokens, Lucide React, Vitest, Testing Library, Playwright.

---

### Task 1: Lock Furniture Product Behavior With Tests

**Files:**
- Modify: `src/lib/catalog.test.ts`
- Modify: `src/lib/cart.test.ts`
- Modify: `src/components/catalog/catalog-controls.test.tsx`
- Modify: `src/components/catalog/product-purchase.test.tsx`

**Steps:**

1. Replace industrial fixture expectations with console, sideboard, shelving, media console, work table, and bench expectations.
2. Add failing tests for furniture type filtering, width-band filtering, panel finish filtering, and ecommerce/RFQ routing.
3. Add a failing test proving finish selection creates a distinct cart line and preserves the selected price.
4. Run the focused tests and confirm they fail because the furniture model does not exist.

### Task 2: Replace Catalog Data And Assets

**Files:**
- Modify: `src/lib/catalog.ts`
- Create: `public/images/furniture/products/*.png`
- Modify: `src/lib/cart.ts` only if the tested furniture option model requires it

**Steps:**

1. Generate consistent 4:3 product images for the six initial furniture families.
2. Replace industrial product/category types with furniture types, dimensions, finish swatches, width bands, and transaction modes.
3. Preserve evidence fields and production publication gates for every fixture.
4. Implement the minimum option/cart changes needed by the failing tests.
5. Run focused catalog and cart tests until green.

### Task 3: Rebuild Shell, Homepage, And Catalog

**Files:**
- Modify: `src/components/site-header.tsx`
- Modify: `src/components/site-footer.tsx`
- Modify: `src/components/home/*`
- Modify: `src/components/catalog/*`
- Modify: `src/app/page.tsx`
- Modify: `src/app/products/page.tsx`
- Modify: `src/app/globals.css`
- Modify: related component tests

**Steps:**

1. Update failing header/catalog component tests for the furniture navigation, search language, collapsed mobile filters, and product controls.
2. Implement the accepted TIDEFORM header, hero, category rail, featured furniture, living-space band, material story, custom-project band, and resources preview.
3. Implement furniture-specific filters and cards matching the accepted catalog concept.
4. Keep standard purchase and custom-project labels explicit.
5. Run component tests and compare the 1920x1080 first viewport to `public/images/furniture/concepts/home-hero.png`.

### Task 4: Rebuild PDP And Supporting Routes

**Files:**
- Modify: `src/app/products/[handle]/page.tsx`
- Create: `src/app/collections/living/page.tsx`
- Create: `src/app/materials/page.tsx`
- Create: `src/app/custom-projects/page.tsx`
- Modify: `src/app/resources/page.tsx`
- Create: `src/app/resources/measuring-for-furniture/page.tsx`
- Delete: `src/app/applications/machine-guarding/page.tsx`
- Delete: `src/app/resources/cutting-tolerances/page.tsx`
- Modify: `src/app/services/page.tsx` or redirect its role to custom projects

**Steps:**

1. Write or update failing tests for PDP finish/price state and route/search content.
2. Make PDP imagery and room fit primary; render dimensions, finish choices, construction, care, delivery boundary, and standard/custom actions in HTML.
3. Add collection, materials, custom-project, care/assembly, and measuring content with explicit evidence boundaries.
4. Remove machine-guarding, CAD, raw-profile, cutting-tolerance, and engineering-service narratives from all reachable navigation and content.
5. Run focused tests and inspect server-rendered HTML.

### Task 5: Adapt RFQ, Search, SEO, And Sitemap

**Files:**
- Modify: `src/lib/rfq.test.ts`
- Modify: `src/lib/rfq.ts`
- Modify: `src/components/rfq/rfq-form.test.tsx`
- Modify: `src/components/rfq/rfq-form.tsx`
- Modify: `src/app/rfq/page.tsx`
- Modify: `src/app/search/page.tsx`
- Modify: `src/lib/seo.ts`
- Modify: `src/lib/seo.test.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/sitemap.test.ts`

**Steps:**

1. Add failing validation tests for furniture type, dimensions/configuration scope, finish, quantity, destination, timeline, contact, consent, and file metadata.
2. Update RFQ labels, inputs, validation messages, success behavior, and API contract while retaining strict body/enum/length/file validation.
3. Update search records, metadata, route manifests, Open Graph defaults, and provisional brand copy.
4. Preserve prototype `noindex,follow`, empty sitemap, no entity JSON-LD, and production evidence tests.
5. Run RFQ, SEO, sitemap, and component tests until green.

### Task 6: Rewrite SEO/GEO, Marketing, And Measurement Plans

**Files:**
- Modify: `docs/strategy/seo-geo-plan.md`
- Modify: `docs/strategy/marketing-plan.md`
- Modify: `docs/strategy/measurement-plan.md`

**Steps:**

1. Replace extrusion procurement intent with furniture type, room, material/construction, care, small-space, and custom-furniture intent.
2. Define HTML-first dimensions, finishes, configuration facts, limitations, source/evidence status, and page-level publication gates.
3. Rebuild the 90-day marketing plan around collections, visual channels, room/use-case content, material samples, designer outreach, and custom projects.
4. Update event names/properties for product view, finish selection, cart, custom-project start, RFQ, sample request, and content-assisted conversion.

### Task 7: Full Verification And Independent Review

**Files:**
- Modify: `tests/e2e/storefront.spec.ts`
- Create: `docs/qa/fidelity-ledger.md`
- Modify: files identified by review

**Steps:**

1. Rewrite E2E flows for furniture catalog filtering, standard PDP/cart, search, mobile filters, custom project RFQ, and material guide navigation.
2. Run `pnpm test`, `pnpm lint`, `pnpm build`, and `pnpm test:e2e`.
3. Capture desktop and mobile screenshots; inspect accepted concepts and final renders with `view_image`.
4. Record at least five copy/layout/type/palette/asset/responsive comparisons and resolve material drift.
5. Request independent code, UX/visual, and SEO/GEO/marketing reviews; fix all Critical and Important findings and repeat until every score is at least 90/100.
6. Update the Obsidian handoff with the corrected product model, verified commands, branch state, and remaining supplier inputs.

## Completion Record

All seven tasks were implemented. The final storefront consistently presents finished furniture built from aluminum frames and marine-grade panel surfaces, with standard configuration/cart and Custom Project RFQ paths kept distinct.

Verification completed on 2026-08-08:

- `pnpm test`: 16 files and 83/83 tests passed.
- `pnpm test:e2e`: 12/12 desktop and mobile Playwright tests passed.
- `pnpm lint`: passed.
- `pnpm build`: passed and generated 22 pages.
- `git diff --check`: passed.
- Independent frontend review: 98/100, Critical 0, Important 0.
- Independent SEO/GEO review: 96/100, Critical 0, Important 0.
- Independent visual/UX review: 97/100, Critical 0, Important 0.

Production dependencies remain outside this prototype: supplier-approved material and SKU evidence, final business identity and policies, real Shopify catalog/Checkout data, persistent RFQ operations, and logistics/trade validation. See the [documentation index](../README.md) for the current source map.
