# TIDEFORM Furniture Storefront Design

Status: Implemented and independently reviewed on 2026-08-08. See the [implementation completion record](./2026-08-08-tideform-furniture-storefront-implementation.md) and [fidelity ledger](../qa/fidelity-ledger.md).

## Product Position

TIDEFORM is a provisional brand for a contemporary furniture prototype. The product is finished or configurable furniture built from an aluminum frame and marine-grade panel surfaces. The frame uses aluminum extrusion sections as its structure, but those sections are not the merchandise by themselves.

The storefront has two transaction paths:

- Standard furniture, finishes, and listed configurations are prepared for ecommerce purchase.
- Custom dimensions, colors, layouts, project quantities, and special requirements go through RFQ.

The board composition is not yet confirmed. Public copy therefore uses `marine-grade panel` or `海洋级板材` and does not claim plywood, HDPE, PVC, waterproofing, outdoor certification, load ratings, or durability test results.

## Audience And Offer

The first collection serves design-conscious homes, studios, hospitality spaces, and small commercial interiors that want clean modular furniture without an industrial catalog experience. The initial product families are console, sideboard, media console, shelving, work table, and bench.

Every product page answers three questions in order:

1. What finished piece is this, and how does it fit a room?
2. Which dimensions, panel finishes, and frame finish are available in the standard configuration?
3. When should the customer buy the standard piece or request a custom version?

## Accepted Visual Direction

The visual system is contemporary, architectural, quiet, and product-led:

- Gallery white and cool-gray backgrounds with graphite text.
- Brushed silver aluminum frames and matte panel surfaces.
- Ocean green as the primary product color, supported by graphite, cool gray, arctic white, and occasional burgundy.
- Square or slightly softened edges, 0-6px radii, fine borders, no gradients, no beige-dominated palette.
- Finished furniture and room context are the first-viewport signal.
- Product cards are reserved for repeated catalog items; page sections remain open bands.
- Industrial extrusion, machine guarding, CAD-first hero content, tolerance-led navigation, and factory catalog styling are excluded.

Accepted concept and asset references:

- `public/images/furniture/concepts/home-hero.png`
- `public/images/furniture/concepts/catalog.png`
- `public/images/furniture/lifestyle/hero-sideboard.png`
- `public/images/furniture/lifestyle/material-detail.png`

Hero copy is fixed to `Furniture built from frame and panel.` with `Shop furniture` and `Customize a piece` as the primary actions. Catalog copy is fixed to `Furniture for spaces that work hard.`

## Information Architecture

Global navigation: Furniture, Collections, Materials, Custom Projects, search, cart, and Request a Quote.

Required routes:

- `/`: room-led homepage, category rail, featured furniture, material story, customization path, and care/design resources.
- `/products`: furniture catalog with type, width, panel finish, frame finish, and availability filters.
- `/products/[handle]`: image-led PDP with dimensions, finish controls, price/configuration state, construction facts, delivery boundary, care, and standard/custom routing.
- `/collections/living`: consoles, sideboards, media consoles, and benches in living spaces.
- `/materials`: aluminum frame and marine-grade panel construction, finish options, care, limitations, and evidence status.
- `/custom-projects`: custom furniture process, inputs, boundaries, and RFQ handoff.
- `/resources`: care, assembly, measuring, and configuration guides.
- `/resources/measuring-for-furniture`: HTML-first guide for space, access path, clearances, and dimension capture.
- `/rfq`: grouped custom-project request with furniture type, dimensions, finish, quantity, destination, timing, files, and confirmation.
- `/search`: site and product search with `noindex,follow`.

Footer links include Furniture, Materials, Custom Projects, Care & Assembly, Measuring, RFQ, and Search. Company, Contact, Shipping & Returns, and Privacy & Terms are visible pending-review text rather than active links until the business records and destinations are approved.

## Homepage Composition

1. Compact dark header with TIDEFORM, essential navigation, quote action, search, and cart.
2. Split first viewport matching the accepted concept: literal H1 and dual CTAs on the left, finished sideboard in a real room on the right, with the category rail visible below.
3. Category rail for Storage, Tables, Shelving, Media, and Benches.
4. Featured furniture grid with dimensions, standard price or `Customize`, finish swatches, and transaction mode.
5. Full-width living-space band showing the sideboard as a finished object.
6. Material and construction section pairing the detail image with neutral, evidence-aware copy.
7. Custom-project band explaining what customers can change and what the RFQ needs.
8. Care, assembly, and measuring resources.

## Catalog And Product Model

Typed product fixtures contain:

- `category`: console, sideboard, media, shelving, table, or bench.
- `dimensions`: width, depth, height, and display string in the launch unit system.
- `panelFinishes`: ocean green, graphite, cool gray, burgundy, and arctic white where applicable.
- `frameFinish`: brushed aluminum initially.
- `transactionMode`: purchase or RFQ.
- Standard price/options for ecommerce products; no synthetic offer for RFQ-only products.
- Evidence status, owner, and evidence IDs kept separate from UI completeness.

Changing a finish updates the selected state and cart line. Product dimensions and finish names remain code-native HTML. Generated imagery communicates form and room context but is not used as proof of exact finish, dimensions, substrate, or performance.

## Trust And Evidence Rules

`src/lib/seo.ts` remains the single publication contract. Prototype mode stays fail-closed: site-wide `noindex,follow`, empty sitemap, and no entity JSON-LD. Environment gates plus approved brand/legal site identity enable production, homepage indexing, and site-level schema. Product and content entities then require their own evidence records before publication.

Transaction evidence is a production dependency rather than an implemented evidence type. The current schema deliberately omits `Offer`; real price, currency, inventory, market, and Checkout validation must be implemented before commerce schema or feeds are released.

The site may describe visible construction without inventing performance. Unverified fields display `To be confirmed before production` or are omitted. No customer reviews, certifications, outdoor suitability, load capacity, lead time, inventory, local warehousing, or material composition are fabricated.

## Responsive And Accessibility

- Desktop catalog uses a compact sidebar; mobile uses a collapsed filter disclosure.
- The first viewport preserves product visibility and a hint of the next section at desktop and mobile sizes.
- Cart traps focus, locks page scroll, restores trigger focus, and supports keyboard quantity/removal actions.
- Search lands at the page H1 rather than auto-scrolling to results.
- RFQ validation associates errors with fields; success focuses and announces the confirmation.
- Swatches include visible names and accessible selected state; color is never the only identifier.

## Verification

- Tests cover furniture fixtures, filters, finish-dependent cart lines, RFQ validation, SEO publication gates, sitemap, robots, search, and core components.
- `pnpm test`, `pnpm lint`, `pnpm build`, and desktop/mobile Playwright flows pass.
- Browser screenshots are inspected against the accepted concepts with `view_image` and a fidelity ledger.
- Independent code, UX/visual, and SEO/GEO/marketing reviews must reach at least 90/100 with zero Critical and zero Important findings.
