"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { getPanelFinish, productCategories, type Product } from "@/lib/catalog";
import { trackEvent } from "@/lib/analytics";

export function ProductCard({ product, listId = "furniture", position = 1 }: { product: Product; listId?: string; position?: number }) {
  const category = productCategories.find((item) => item.value === product.category)?.label ?? product.category;
  const price = product.previewPrice ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(product.previewPrice) : null;
  const trackSelection = () => trackEvent("select_item", { item_id: product.handle, item_name: product.name, item_category: product.category, list_id: listId, position });
  return (
    <article className="product-card">
      <Link className="product-card__image" href={`/products/${product.handle}`} aria-label={`View ${product.name}`} onClick={trackSelection}>
        <Image src={product.image} alt={product.imageAlt} width={1200} height={900} loading={position <= 4 ? "eager" : "lazy"} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" />
      </Link>
      <div className="product-card__body">
        <div className="product-card__meta"><span>{category}</span><span>{product.transactionMode === "purchase" ? "Standard" : "Custom"}</span></div>
        <h3><Link href={`/products/${product.handle}`} onClick={trackSelection}>{product.name}</Link></h3>
        <p className="product-card__dimensions">{product.dimensions.display}</p>
        <div className="finish-swatches" aria-label="Available panel finishes">{product.panelFinishes.map((value) => { const finish = getPanelFinish(value); return <span key={value} title={finish.label} aria-label={finish.label} style={{ backgroundColor: finish.color }} />; })}</div>
        <small className="finish-names">{product.panelFinishes.map((value) => getPanelFinish(value).label).join(" · ")}</small>
        <p className="product-card__frame">Brushed aluminum frame</p>
        <div className="product-card__footer">
          {price ? <strong>From {price}</strong> : <strong className="green-text">Customize</strong>}
          <Link className="icon-link" href={`/products/${product.handle}`} aria-label={`View ${product.name}`} onClick={trackSelection}><ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
  );
}
