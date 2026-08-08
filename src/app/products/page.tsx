import type { Metadata } from "next";

import { CatalogControls } from "@/components/catalog/catalog-controls";
import { RouteAnalytics } from "@/components/analytics/route-analytics";
import { ProductCard } from "@/components/catalog/product-card";
import { StructuredData } from "@/components/structured-data";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { filterCatalog, hasActiveCatalogFilters, parseCatalogFilters, products } from "@/lib/catalog";
import { breadcrumbJsonLd, collectionPageJsonLd, contentEvidenceForPath, itemListJsonLd, routeMetadata } from "@/lib/seo";

type ProductSearchParams = Promise<Record<string, string | string[] | undefined>>;

const title = "Aluminum-Frame Furniture";
const description = "Browse modular consoles, sideboards, media storage, shelving, work tables, and benches by size, panel finish, and order path.";

export async function generateMetadata({ searchParams }: { searchParams: ProductSearchParams }): Promise<Metadata> {
  const params = await searchParams;
  return routeMetadata(title, description, "/products", { noIndex: hasActiveCatalogFilters(params) });
}

export default async function ProductsPage({ searchParams }: { searchParams: ProductSearchParams }) {
  const params = await searchParams;
  const filtered = filterCatalog(products, parseCatalogFilters(params));
  const evidence = contentEvidenceForPath("/products");

  return (
    <>
      <StructuredData data={[
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Products", path: "/products" }]),
        collectionPageJsonLd({ name: title, description, path: "/products", evidence }),
        itemListJsonLd({ name: title, description, path: "/products", evidence, items: products.map((product) => ({ name: product.name, path: `/products/${product.handle}`, evidence: product.evidence })) }),
      ]} evidence={evidence} />
      <RouteAnalytics name="view_item_list" detail={{ item_list_id: "all-furniture", item_list_name: "All furniture", item_count: filtered.length }} />
      <div className="page-intro container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
        <h1>Furniture for spaces that work hard.</h1>
        <p>Marine-grade panel surfaces meet brushed aluminum frames across storage, shelving, tables, media pieces, and benches.</p>
        <div className="data-status"><strong>Prototype catalog</strong><span>Final material composition, prices, availability, dimensions, and delivery terms require supplier and business verification.</span></div>
      </div>
      <div className="catalog-layout container">
        <CatalogControls resultCount={filtered.length} />
        <section aria-labelledby="catalog-results-title">
          <div className="catalog-results-heading"><h2 id="catalog-results-title">{filtered.length} {filtered.length === 1 ? "piece" : "pieces"}</h2><span>Featured order</span></div>
          {filtered.length ? <div className="product-grid">{filtered.map((product, index) => <ProductCard product={product} listId="all-furniture" position={index + 1} key={product.handle} />)}</div> : (
            <div className="empty-state catalog-empty"><h3>No furniture matches these filters</h3><p>Clear a filter or start a custom project for a specific size, finish, or configuration.</p></div>
          )}
          <div className="catalog-guidance"><div><strong>Need another size or color?</strong><p>Start from a furniture type, then share dimensions, finish, quantity, destination, and timing.</p></div><a className="text-link" href="/custom-projects">Plan a custom piece</a></div>
        </section>
      </div>
    </>
  );
}
