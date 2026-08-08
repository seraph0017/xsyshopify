import type { Metadata } from "next";
import { FileText, Search } from "lucide-react";
import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { RouteAnalytics } from "@/components/analytics/route-analytics";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { filterCatalog, products } from "@/lib/catalog";
import { routeMetadata } from "@/lib/seo";
import { searchAnalyticsDetail } from "@/lib/analytics";

export const metadata: Metadata = routeMetadata("Search", "Search TIDEFORM furniture, collections, materials, custom projects, care, assembly, and measuring content.", "/search", true);

const contentResults = [
  { title: "Living collection", description: "Consoles, sideboards, media storage, and benches for contemporary living spaces.", href: "/collections/living" },
  { title: "Materials and construction", description: "Aluminum-frame and marine-grade panel construction with evidence boundaries.", href: "/materials" },
  { title: "Custom furniture projects", description: "Custom sizes, colors, layouts, quantities, and room-specific review.", href: "/custom-projects" },
  { title: "Care and assembly resources", description: "Measuring, delivery access, assembly, anchoring, and finish-specific care.", href: "/resources" },
  { title: "Measure for furniture", description: "Room, wall, clearance, and delivery-path measurement guide.", href: "/resources/measuring-for-furniture" },
];

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const productResults = query ? filterCatalog(products, { query }) : [];
  const normalized = query.toLowerCase();
  const pages = query ? contentResults.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(normalized)) : [];
  const count = productResults.length + pages.length;

  return (
    <div className="search-page container">
      {query ? <RouteAnalytics name="search" detail={searchAnalyticsDetail(query, count)} /> : null}
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <h1>Search furniture and planning guides</h1>
      <form className="search-page__form" role="search">
        <Search aria-hidden="true" />
        <label className="sr-only" htmlFor="search-query">Search</label>
        <input id="search-query" name="q" defaultValue={query} placeholder="Search sideboards, shelving, materials..." />
        <button className="button button--green" type="submit">Search</button>
      </form>
      {query ? <p className="search-count">{count} results for <strong>&quot;{query}&quot;</strong></p> : <p className="search-count">Enter a furniture type, model name, room, material, finish, or planning topic.</p>}
      {query && count === 0 ? <div className="empty-state search-empty"><Search aria-hidden="true" /><h2>No matching results</h2><p>Try a shorter furniture or room term, or browse the full collection.</p><Link className="button button--dark" href="/products">Browse furniture</Link></div> : null}
      {productResults.length ? <section><h2>Furniture</h2><div className="product-grid">{productResults.map((product, index) => <ProductCard product={product} listId="search-results" position={index + 1} key={product.handle} />)}</div></section> : null}
      {pages.length ? <section><h2>Collections and guides</h2><div className="search-content-results">{pages.map((item) => <Link href={item.href} key={item.href}><FileText aria-hidden="true" /><span><strong>{item.title}</strong><small>{item.description}</small></span></Link>)}</div></section> : null}
    </div>
  );
}
