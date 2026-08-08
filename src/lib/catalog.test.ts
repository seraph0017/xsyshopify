import { describe, expect, it } from "vitest";

import { filterCatalog, getProductByHandle, hasActiveCatalogFilters, parseCatalogFilters, products } from "./catalog";

describe("catalog fixtures", () => {
  it("contains the six launch furniture families across purchase and RFQ paths", () => {
    expect(new Set(products.map((product) => product.category))).toEqual(new Set(["console", "sideboard", "media", "shelving", "table", "bench"]));
    expect(products.some((product) => product.transactionMode === "purchase")).toBe(true);
    expect(products.some((product) => product.transactionMode === "rfq")).toBe(true);
    expect(products.every((product) => product.dataStatus === "engineering-preview")).toBe(true);
    expect(products.every((product) => !["ready-to-ship", "made-to-order"].includes(product.availability))).toBe(true);
  });

  it("describes aluminum as the furniture frame rather than the merchandise", () => {
    expect(products.every((product) => product.specs.find((spec) => spec.label === "Frame")?.value === "Brushed aluminum frame")).toBe(true);
    expect(products.every((product) => !product.description.toLowerCase().includes("lightweight"))).toBe(true);
    expect(products.every((product) => !product.shortDescription.toLowerCase().includes("aluminum structure"))).toBe(true);
  });

  it("filters by furniture type, width band, panel finish, and transaction path", () => {
    expect(filterCatalog(products, { query: "Skiff", category: "console", width: "up-to-48", panelFinish: "ocean-green", transactionMode: "purchase" })).toHaveLength(1);
    expect(filterCatalog(products, { category: "table", transactionMode: "purchase" })).toHaveLength(0);
  });

  it("looks up a product by its stable handle", () => {
    expect(getProductByHandle("skiff-console")?.partNumber).toBe("TF-CON-48");
    expect(getProductByHandle("missing-product")).toBeUndefined();
  });

  it("ignores unknown query filter values instead of producing an empty result", () => {
    const filters = parseCatalogFilters({ category: "mars", width: "huge", panel: "raw", mode: "auction" });
    expect(filters).toEqual({});
    expect(filterCatalog(products, filters)).toHaveLength(products.length);
  });

  it("distinguishes active catalog filters from tracking-only parameters", () => {
    expect(hasActiveCatalogFilters({ utm_source: "newsletter", gclid: "TRACK" })).toBe(false);
    expect(hasActiveCatalogFilters({ category: "sideboard", utm_source: "newsletter" })).toBe(true);
    expect(hasActiveCatalogFilters({ category: "mars" })).toBe(true);
    expect(hasActiveCatalogFilters({ q: "sideboard" })).toBe(true);
  });
});
