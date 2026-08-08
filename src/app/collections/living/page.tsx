import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { RouteAnalytics } from "@/components/analytics/route-analytics";
import { StructuredData } from "@/components/structured-data";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { products } from "@/lib/catalog";
import { breadcrumbJsonLd, collectionPageJsonLd, contentEvidenceForPath, itemListJsonLd, routeMetadata } from "@/lib/seo";

const title = "Living Collection";
const description = "Explore aluminum-frame consoles, sideboards, media storage, and benches organized around contemporary living spaces.";

export const metadata: Metadata = routeMetadata(title, description, "/collections/living", { imagePath: "/images/furniture/lifestyle/hero-sideboard.png" });

export default function LivingCollectionPage() {
  const livingProducts = products.filter((product) => ["console", "sideboard", "media", "bench"].includes(product.category));
  const evidence = contentEvidenceForPath("/collections/living");
  return (
    <>
      <StructuredData data={[
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: title, path: "/collections/living" }]),
        collectionPageJsonLd({ name: title, description, path: "/collections/living", evidence }),
        itemListJsonLd({ name: title, description, path: "/collections/living", evidence, items: livingProducts.map((product) => ({ name: product.name, path: `/products/${product.handle}`, evidence: product.evidence })) }),
      ]} evidence={evidence} />
      <RouteAnalytics name="view_item_list" detail={{ item_list_id: "living-collection", item_list_name: "Living collection", item_count: livingProducts.length }} />
      <div className="page-intro container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Collections" }, { label: "Living" }]} />
        <h1>Living furniture with a lighter footprint.</h1>
        <p>Consoles, sideboards, media storage, and benches use visible aluminum frames to keep long pieces visually open.</p>
      </div>
      <section className="collection-hero container-wide"><Image src="/images/furniture/lifestyle/hero-sideboard.png" alt="Ocean-green sideboard arranged in a bright contemporary living room" width={1792} height={1024} priority /></section>
      <section className="section section--white"><div className="container"><div className="section-heading"><div><h2>Storage, media, and entry pieces.</h2><p>Choose a standard configuration or use any piece as the starting point for another size, color, or layout.</p></div></div><div className="product-grid product-grid--four">{livingProducts.map((product, index) => <ProductCard product={product} listId="living-collection" position={index + 1} key={product.handle} />)}</div></div></section>
      <section className="collection-note"><div className="container"><div><h2>Start with the wall, then choose the piece.</h2><p>Measure usable wall width, depth limits, circulation, outlets, baseboards, and the delivery path before finalizing a long storage piece.</p></div><Link className="button button--light" href="/resources/measuring-for-furniture">Open measuring guide</Link></div></section>
    </>
  );
}
