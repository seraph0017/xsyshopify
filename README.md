# TIDEFORM Storefront Prototype

TIDEFORM is a Next.js storefront prototype for finished and configurable furniture built from an aluminum frame and marine-grade panel surfaces. It is not a raw aluminum-extrusion catalog.

The prototype validates two customer paths:

- Standard sizes and finishes use a product-detail and local-cart flow.
- Custom dimensions, colors, layouts, quantities, and delivery constraints use a structured RFQ flow.

`Marine-grade panel` is a neutral working term. The substrate, thickness, finish system, edge treatment, care requirements, performance, outdoor suitability, load data, and certifications still require supplier evidence before production release.

## Current Scope

- Homepage, catalog, URL-backed filters, search, and Living Collection
- Six furniture product pages: console, sideboard, media console, shelving, work table, and bench
- Standard configuration selection and a browser-local cart prototype
- Materials, Custom Projects, Resources, and measuring guidance
- RFQ form and local API validation with metadata-only attachment handling
- Fail-closed SEO publication gates for prototype and production modes
- Unit/component tests plus desktop and mobile Playwright coverage

Shopify products, inventory, Checkout, payments, taxes, shipping, order creation, production RFQ storage, and notifications are not connected in this prototype.

## Tech Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Lucide React
- Vitest and Testing Library
- Playwright
- pnpm 11

## Run Locally

Prerequisites: Node.js `22.22.2+` within major 22, `24.15+` within major 24, or major 26 and later, plus Corepack-enabled pnpm. Node 23 and 25 are outside the current jsdom engine range.

```bash
corepack enable
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

Open <http://127.0.0.1:3000>. The Playwright configuration also uses port `3000` by default and can be pointed at another running instance with `PLAYWRIGHT_BASE_URL`.

## Commands

```bash
pnpm dev       # start the local development server
pnpm lint      # run ESLint
pnpm test      # run Vitest once
pnpm test:e2e  # run desktop and mobile Playwright flows
pnpm build     # create a production build
pnpm start     # serve the production build
```

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Furniture-led homepage |
| `/products` | Catalog, search, and filters |
| `/products/[handle]` | Product details and standard/custom routing |
| `/collections/living` | Living Collection |
| `/materials` | Frame-and-panel construction and evidence boundaries |
| `/custom-projects` | Custom furniture process |
| `/resources` | Planning, care, assembly, and support topics |
| `/resources/measuring-for-furniture` | Measuring guide |
| `/rfq` | Custom Project request form |
| `/search` | Furniture and content search |
| `/api/rfq` | Prototype RFQ validation endpoint |

## Publication Modes

The default mode is `prototype`. It deliberately emits site-wide `noindex,follow`, an empty sitemap, and no entity JSON-LD.

Production publishing is fail-closed and requires all of the following environment gates:

```dotenv
SITE_MODE=production
SITE_URL=https://store.tideform.com
APPROVED_PRODUCTION_DOMAIN=store.tideform.com
SITE_EVIDENCE_GATE=approved
```

The hostname above illustrates the required public-domain format; replace it with the formally approved production hostname. `SITE_URL` must be a public HTTPS origin with no path, query, fragment, or port, and its hostname must exactly match `APPROVED_PRODUCTION_DOMAIN`.

Environment gates plus a complete operator-verified site identity enable production mode, homepage indexing, and site-level schema. Content and product entities then pass their own evidence gates independently. Prototype fixtures remain excluded. Transaction evidence is not implemented yet, so the application emits no `Offer`; real price, currency, inventory, and Checkout validation must be added before commerce schema or feeds are released.

See [.env.example](./.env.example) and the [SEO/GEO plan](./docs/strategy/seo-geo-plan.md) for the full release contract.

## Project Structure

```text
src/app/          App Router pages, metadata routes, and RFQ API
src/components/   Storefront, catalog, cart, RFQ, and UI components
src/lib/          Catalog fixtures, cart/RFQ logic, analytics, and SEO gates
tests/e2e/        Desktop and mobile storefront flows
public/images/    Furniture concepts, products, and lifestyle assets
docs/             Design, operations, strategy, QA, and user documentation
```

## Documentation

Start with the [documentation index](./docs/README.md). Key references:

- [Chinese user guide](./docs/user-guide.md)
- [Storefront design](./docs/plans/2026-08-08-tideform-furniture-storefront-design.md)
- [Implementation plan and completion record](./docs/plans/2026-08-08-tideform-furniture-storefront-implementation.md)
- [SEO/GEO plan](./docs/strategy/seo-geo-plan.md)
- [Marketing plan](./docs/strategy/marketing-plan.md)
- [Measurement plan](./docs/strategy/measurement-plan.md)
- [Visual fidelity and review ledger](./docs/qa/fidelity-ledger.md)

## Verified Baseline

As of 2026-08-08:

- Vitest: 83/83 tests passed across 16 files
- Playwright: 12/12 desktop and mobile tests passed
- `pnpm lint`, `pnpm build`, and `git diff --check` passed
- Independent reviews: frontend 98/100, SEO/GEO 96/100, visual/UX 97/100
- Every review reported zero Critical and zero Important findings

The remaining work is production integration: confirm supplier material and product records, establish the final brand and business policies, connect Shopify and Checkout, persist RFQs, and complete SKU-level trade, packaging, shipping, and landed-cost review.
