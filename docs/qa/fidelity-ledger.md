# TIDEFORM Storefront Fidelity Ledger

Reviewed: 2026-08-08

Reference assets:

- `public/images/furniture/concepts/home-hero.png`
- `public/images/furniture/concepts/catalog.png`
- `public/images/furniture/lifestyle/hero-sideboard.png`
- `public/images/furniture/lifestyle/material-detail.png`

Manual fidelity viewports: 1920 x 1080 and 412 x 915. Automated Playwright projects use 1440 x 900 desktop Chromium and Pixel 7 mobile Chromium.

| Area | Reference intent | Final render | Resolution |
| --- | --- | --- | --- |
| Product position | Finished furniture is the first signal; aluminum is the frame and marine-grade panel is the surface system. | Hero, catalog intro, cards, PDP specifications, materials page, and footer consistently use frame-and-panel furniture language. | Matched. Raw-profile and engineering-catalog narratives are absent from reachable production routes. |
| Header | Compact graphite header with prominent TIDEFORM wordmark, central navigation, search, cart, and quote action. | Desktop retains the full command set in one 80px band; mobile reduces it to wordmark and three icon controls. | Matched with a responsive simplification. |
| Hero composition | Literal H1 and two actions on the left, finished sideboard in a room on the right, category content visible below the fold. | Desktop preserves the split composition and exposes the entire category rail at 1080px height. Mobile stacks copy above the product image and leaves the category rail visible at 915px height. | Matched. Mobile stacking is intentional for readable type and product inspection. |
| Product imagery | Brushed silver frames, matte ocean-green/graphite/cool-gray/burgundy/white panels, neutral gallery or room settings. | Product and lifestyle assets keep the same finishes and clearly show complete furniture rather than loose frame components. | Matched. Images remain prototype direction, not evidence of exact material or finish. |
| Catalog density | Desktop sidebar plus a four-column product grid with dimensions, finish swatches, frame finish, and price/custom route. | At 1920px the final catalog shows a compact sidebar and four complete cards across; the next row begins below the first viewport. | Matched. The final intro includes a visible verification notice above the controls. |
| Catalog controls | Dense desktop filters, reduced mobile controls. | Desktop exposes all select controls. At 412px only search and the collapsed Filters disclosure render until opened; selecting Sideboards updates the URL and count to one piece. | Matched and interaction-verified. |
| Material language | Frame and panel are presented together without unsupported performance claims. | The materials page names aluminum frame and marine-grade panel, states that the specific substrate and production specifications await supplier confirmation, and omits performance promises. | Matched with stricter evidence wording. |
| Standard and custom paths | Standard furniture uses price/cart; custom sizes, colors, layouts, and quantities use RFQ. | PDP option selection updates price and cart detail; custom project pages and RFQ capture room, dimensions, finish, quantity, destination, and timing. | Matched and interaction-verified. |
| Responsive integrity | No overlap, clipped controls, or page-level horizontal overflow. | 412px screenshots show stable header controls, wrapped headings, full-width actions, collapsed filters, and single-column products. | Matched. The category rail intentionally scrolls horizontally to preserve useful image sizes. |
| Console quality | Render without application errors or image-ratio warnings. | Browser and Playwright checks show meaningful DOM content, no framework overlay, and no Next.js image-ratio warning after the category and material image fixes. | Matched. Browser-extension warnings are external to the application. |

## Intentional Deviations

- The accepted catalog concept contains illustrative inventory counts and a sort menu. The prototype uses six evidence-marked fixtures and a fixed featured order, so it does not imply unverified stock depth or sorting behavior.
- The concept labels the fifth home category as Accessories. The final rail uses Benches because bench is one of the six confirmed prototype furniture families while accessories are not in the current catalog model.
- The final catalog places a prototype verification notice above filters. This adds vertical space but keeps price, availability, dimensions, and delivery boundaries explicit.

## Verification

- Browser interaction: mobile menu, collapsed filters, Sideboards filter, PDP size/finish selection, cart line, materials page, custom-project page, and successful local RFQ confirmation.
- Screenshot capture: Playwright CLI at 1920 x 1080 and 412 x 915 for `/` and `/products`.
- Automated coverage: desktop and mobile Playwright projects plus Vitest component, catalog, cart, RFQ, analytics, SEO, robots, sitemap, and structured-data tests.

## Final Results

- Vitest: 16 files, 83/83 tests passed.
- Playwright: 12/12 desktop and mobile tests passed.
- `pnpm lint`, `pnpm build`, and `git diff --check`: passed; the build generated 22 pages.
- Frontend review: 98/100, Critical 0, Important 0.
- SEO/GEO review: 96/100, Critical 0, Important 0.
- Visual/UX review: 97/100, Critical 0, Important 0.

Non-blocking follow-ups are limited to aligning filtered `ItemList` output if filter pages become indexable, validating evidence dates as real calendar dates rather than only `YYYY-MM-DD` shape, and reconciling the Materials image's declared intrinsic/OG dimensions with its source file.
