"use client";

import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { trackEvent } from "@/lib/analytics";
import { getPanelFinish, type PanelFinish, type Product } from "@/lib/catalog";

export function ProductPurchase({ product }: { product: Product }) {
  const [optionLabel, setOptionLabel] = useState(product.options[0].label);
  const [panelFinish, setPanelFinish] = useState<PanelFinish>(product.panelFinishes[0]);
  const [quantity, setQuantity] = useState(1);
  const { addLine } = useCart();

  if (product.transactionMode === "rfq") {
    return (
      <div className="purchase-panel">
        <p className="purchase-path">Custom project</p>
        <h2>Configure it around your space</h2>
        <p>Dimensions, panel finish, quantity, destination, and room access are reviewed before project pricing.</p>
        <label htmlFor="rfq-scope-option">Starting configuration</label>
        <select id="rfq-scope-option" value={optionLabel} onChange={(event) => setOptionLabel(event.target.value)}>{product.options.map((option) => <option key={option.label}>{option.label}</option>)}</select>
        <Link className="button button--green button--full" href={`/rfq?product=${encodeURIComponent(product.handle)}&scope=${encodeURIComponent(optionLabel)}`}>Customize this piece</Link>
      </div>
    );
  }

  const selectedOption = product.options.find((option) => option.label === optionLabel) ?? product.options[0];
  const price = selectedOption.unitPrice ?? product.previewPrice ?? 0;
  const finish = getPanelFinish(panelFinish);
  const formattedPrice = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);
  return (
    <div className="purchase-panel">
      <p className="purchase-path">Standard furniture</p>
      <div className="purchase-price"><strong>{formattedPrice}</strong><span>{product.priceUnit}</span></div>
      <p className="purchase-warning">Prototype pricing. Inventory, shipping, tax, and Shopify Checkout are not connected.</p>
      <label htmlFor="product-option">Size</label>
      <select id="product-option" value={optionLabel} onChange={(event) => { const value = event.target.value; setOptionLabel(value); trackEvent("select_furniture_option", { item_id: product.handle, option_type: "size", option_value: value, price: product.options.find((option) => option.label === value)?.unitPrice ?? product.previewPrice ?? 0 }); }}>{product.options.map((option) => <option key={option.label}>{option.label}</option>)}</select>
      <label htmlFor="panel-finish">Panel finish</label>
      <select id="panel-finish" value={panelFinish} onChange={(event) => { const value = event.target.value as PanelFinish; setPanelFinish(value); trackEvent("select_furniture_option", { item_id: product.handle, option_type: "panel_finish", option_value: value, price }); }}>{product.panelFinishes.map((value) => { const option = getPanelFinish(value); return <option value={value} key={value}>{option.label}</option>; })}</select>
      <label htmlFor="product-quantity">Quantity</label>
      <div className="pdp-quantity">
        <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Decrease quantity"><Minus aria-hidden="true" size={16} /></button>
        <input id="product-quantity" type="number" min="1" max="99" value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(99, Number(event.target.value) || 1)))} />
        <button type="button" onClick={() => setQuantity((current) => Math.min(99, current + 1))} aria-label="Increase quantity"><Plus aria-hidden="true" size={16} /></button>
      </div>
      <button className="button button--green button--full" type="button" onClick={() => addLine({ id: `${product.handle}:${optionLabel}:${panelFinish}`, productHandle: product.handle, title: product.name, option: `${optionLabel} / ${finish.label}`, size: optionLabel, panelFinish: finish.label, unitPrice: price, quantity, image: product.image })}>Add to cart</button>
      <Link className="secondary-rfq-link" href={`/rfq?product=${encodeURIComponent(product.handle)}`}>Need another size, color, or configuration? Customize this piece</Link>
    </div>
  );
}
