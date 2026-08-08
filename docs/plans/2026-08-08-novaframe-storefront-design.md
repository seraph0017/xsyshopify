# NovaFrame Storefront Design

## Product Position

NovaFrame is a provisional English brand for the prototype. The site validates a North American aluminum framing model with two explicit transaction paths:

- Standard profiles, hardware, samples, and selected kits are prepared for online purchase.
- Cut-to-length work, machining, BOM kitting, custom frames, long freight, and volume orders go through RFQ.

The first launch remains intentionally narrow: United States, USD, one machine-building use case, one unit system, and 10-20 SKUs. Canada is quote-only.

## Experience Direction

Use a small catalog with deep engineering evidence. The experience combines the scanning efficiency of Vercel Commerce with the specifications, application paths, and SEO structure of Enterprise Commerce. It must not look like a generic dark industrial template or imply a full-line distributor.

The visual system is light, neutral, precise, and product-led:

- Cool white `#f5f6f4` page background and white content surfaces.
- Graphite `#151a1d` text and header.
- Engineering green `#176b4d` for functional emphasis only.
- Fine `#d8ddda` borders, 0-6px radii, restrained shadows.
- Large but bounded hero type, compact UI type, tabular numbers for specifications.
- Realistic silver extrusion, fastener, and application imagery with visible geometry.
- Cards only for repeated products/resources; major page sections stay unframed.

Accepted concept references:

- `public/images/concepts/home-hero.png`
- `public/images/concepts/catalog.png`
- `public/images/products/hero-extrusion-system.png`
- `public/images/applications/machine-guarding.png`

## Information Architecture

Global navigation: Products, Applications, Services, Resources, Request a Quote, search, and cart.

Required routes:

- `/`: product-led homepage with dual conversion paths.
- `/products`: compact catalog, search, filters, and transaction labels.
- `/products/[handle]`: specifications, purchase/RFQ routing, CAD resources, logistics limits, FAQ, and related application.
- `/applications/machine-guarding`: application problem, system anatomy, planning checklist, relevant products, and RFQ.
- `/services`: cutting, machining, BOM kitting, and custom-frame process.
- `/resources`: selection guides, CAD/download events, tolerances, and compatibility material.
- `/resources/cutting-tolerances`: indexable HTML engineering guide.
- `/rfq`: progressive engineering request form with attachment metadata and confirmation reference.
- `/search`: searchable site/product results with noindex metadata.

Footer navigation provides Company, Contact, Shipping, Returns, Privacy, and Terms placeholders that are clearly marked for business verification before launch.

## Homepage Composition

1. Slim market notice: United States in USD; Canada by quote.
2. Dark compact navigation.
3. Split hero with literal H1, short engineering value proposition, dual CTAs, and generated product photography.
4. Category rail showing profiles, fasteners, brackets, panels, kits, and samples.
5. Featured standard products with verified-state labels and no fabricated reviews.
6. Machine-guarding application band using the factory image and a task-led CTA.
7. Services matrix: cut, machine, kit, assemble.
8. Engineering resources with HTML-first specifications/CAD context.
9. RFQ band explaining the handoff and expected response sequence.

## Data And Trust Rules

All prototype products live in one typed fixture module so supplier data can replace them without component edits. Prototype price, inventory, lead time, certification, compatibility, testimonials, and delivery promises must not be presented as verified facts.

The UI labels demo catalog records as engineering-preview data. Products can demonstrate a local cart, but checkout is a clearly identified Shopify handoff placeholder until Storefront credentials exist. RFQ submissions are accepted by a local prototype route, return a reference ID, and preserve no uploaded file bytes.

## Interaction Model

- Search works from the header and `/search`.
- Catalog filters update visible items and URL query parameters.
- Product options and quantity update local cart state.
- Cart opens as a drawer, supports quantity/removal, and exposes the future Checkout handoff.
- RFQ uses grouped sections, validates required fields, shows accepted file constraints, and returns a success reference.
- CAD download links emit a local analytics event and download a fixture text artifact.
- All controls have keyboard focus, reduced-motion support, and mobile-safe sizing.

## SEO And GEO

Every indexable route has a unique title, description, canonical URL, one H1, crawlable internal links, Open Graph metadata, and contextual breadcrumbs. The app emits `robots.txt`, `sitemap.xml`, and correct JSON-LD: Organization/WebSite, BreadcrumbList, Product without fabricated Offer/review data, and Article for engineering guides.

GEO content uses answer-first summaries, fact tables, limitations, updated dates, applicable market, glossary terms, and citeable HTML. Advice, prototype data, and supplier-verified facts remain visually and semantically distinct. PDFs supplement HTML rather than replace it.

## Verification

- Unit tests cover filtering, cart calculations, RFQ validation, and schema generation.
- `pnpm lint`, `pnpm test`, and `pnpm build` pass.
- Desktop and mobile browser flows cover navigation, filter, PDP, cart, search, RFQ, and resource download.
- Browser screenshots are compared against the concept with a written fidelity ledger.
- Independent agents review product/UX, code quality, and SEO/GEO/marketing. Critical and important findings are fixed and re-reviewed.

