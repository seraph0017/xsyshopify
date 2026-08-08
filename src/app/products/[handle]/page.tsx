import type { Metadata } from "next";
import { ArrowRight, Ruler } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductPurchase } from "@/components/catalog/product-purchase";
import { RouteAnalytics } from "@/components/analytics/route-analytics";
import { StructuredData } from "@/components/structured-data";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getProductByHandle, products } from "@/lib/catalog";
import { breadcrumbJsonLd, productJsonLd, routeMetadata } from "@/lib/seo";

type ProductParams = Promise<{ handle: string }>;

export function generateStaticParams() {
  return products.map((product) => ({ handle: product.handle }));
}

export async function generateMetadata({ params }: { params: ProductParams }): Promise<Metadata> {
  const { handle } = await params;
  const product = getProductByHandle(handle);
  if (!product) return {};
  return routeMetadata(product.name, `${product.shortDescription} Review dimensions, panel finishes, aluminum-frame construction, and standard or custom order paths.`, `/products/${handle}`, {
    imagePath: product.image,
    imageWidth: 1376,
    imageHeight: 1024,
    evidence: product.evidence,
  });
}

export default async function ProductPage({ params }: { params: ProductParams }) {
  const { handle } = await params;
  const product = getProductByHandle(handle);
  if (!product) notFound();
  const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Products", path: "/products" }, { name: product.name, path: `/products/${product.handle}` }];

  return (
    <>
      <StructuredData data={[breadcrumbJsonLd(breadcrumbs), productJsonLd(product)]} evidence={product.evidence} />
      <RouteAnalytics name="view_item" detail={{ item_id: product.handle, item_name: product.name, category: product.category, transaction_mode: product.transactionMode, prototype_status: product.evidence.status }} />
      <div className="pdp container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.name }]} />
        <div className="pdp-grid">
          <div className="pdp-media"><Image src={product.image} alt={product.imageAlt} width={1200} height={900} priority /></div>
          <div className="pdp-summary">
            <div className="pdp-status"><span>{product.category}</span><span>{product.transactionMode === "purchase" ? "Standard piece" : "Custom project"}</span></div>
            <h1>{product.name}</h1>
            <p className="part-number">Prototype model {product.partNumber}</p>
            <p className="pdp-lead">{product.description}</p>
            <ProductPurchase product={product} />
          </div>
        </div>
        <section className="pdp-section">
          <div className="pdp-section__title"><h2>Dimensions and construction</h2><p>Core configuration facts stay in readable HTML. Pending facts are marked instead of inferred from imagery.</p></div>
          <div className="spec-table-wrap"><table><tbody>{product.specs.map((spec) => <tr key={spec.label}><th scope="row">{spec.label}</th><td>{spec.value}</td></tr>)}<tr><th scope="row">Frame finish</th><td>Brushed aluminum</td></tr><tr><th scope="row">Evidence status</th><td>Prototype; supplier confirmation pending</td></tr><tr><th scope="row">Last reviewed</th><td>August 8, 2026</td></tr></tbody></table></div>
        </section>
        <section className="pdp-section pdp-evidence">
          <div><h2>Material status</h2><p>{product.compatibility}</p><Link className="text-link" href="/materials">Review materials<ArrowRight aria-hidden="true" size={15} /></Link></div>
          <div><h2>Delivery boundary</h2><p>{product.logisticsBoundary}</p><Link className="text-link" href="/resources/measuring-for-furniture">Measure room and access</Link></div>
          <div><h2>Care and assembly</h2><p>Finish-specific cleaning, assembly, anchoring, and hardware instructions remain production-document dependencies.</p><Link className="text-link" href="/resources">Open care guidance</Link></div>
        </section>
        <section className="pdp-section pdp-faq">
          <div className="pdp-section__title"><h2>Questions before ordering</h2><p>Direct answers for this prototype furniture catalog.</p></div>
          <div>
            <details><summary>Can the standard piece be ordered today?</summary><p>The local cart is a prototype. Verified pricing, inventory, tax, shipping, policy content, and Shopify Checkout remain launch dependencies.</p></details>
            <details><summary>Does the image prove the exact finish or construction?</summary><p>No. The generated image communicates furniture form and visual direction. Approved samples, specifications, and final production documents govern the delivered piece.</p></details>
            <details><summary>When should I use a custom project?</summary><p>Use RFQ for another size, color, storage layout, work-surface configuration, project quantity, special access condition, or delivery requirement.</p></details>
          </div>
        </section>
        <section className="related-application">
          <div><Ruler aria-hidden="true" /><h2>Make this piece fit the room.</h2><p>Bring your wall width, depth limit, access path, finish direction, and quantity into one custom request.</p></div>
          <Link className="button button--dark" href={`/rfq?product=${encodeURIComponent(product.handle)}`}>Customize this piece</Link>
        </section>
      </div>
    </>
  );
}
