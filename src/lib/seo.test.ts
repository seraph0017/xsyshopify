import { describe, expect, it } from "vitest";

import {
  absoluteUrl,
  articleJsonLd,
  collectionPageJsonLd,
  contactPageJsonLd,
  getSiteRuntimeConfig,
  itemListJsonLd,
  organizationJsonLd,
  productJsonLd,
  routeMetadata,
  serviceJsonLd,
  siteConfig,
  type ContentEvidence,
  type ProductEvidence,
  type SiteIdentityEvidence,
} from "./seo";

const verifiedSite: SiteIdentityEvidence = {
  status: "operator_verified",
  evidenceId: "SITE-001",
  owner: "TIDEFORM Operations",
  reviewer: "A. Reviewer",
  source: "Legal identity record",
  reviewedAt: "2026-08-08",
  brandName: "TIDEFORM",
  legalName: "Tideform Furniture LLC",
  brandRelationship: "Operator-owned provisional brand",
  publicContactUrl: "https://store.tideform.com/contact",
  privacyPolicyUrl: "https://store.tideform.com/privacy",
  termsUrl: "https://store.tideform.com/terms",
  organizationDescription: "Aluminum-frame and marine-grade-panel furniture.",
};

const verifiedProduct: ProductEvidence = {
  status: "operator_verified",
  evidenceId: "SKU-2020-001",
  owner: "Product Operations",
  reviewer: "A. Reviewer",
  source: "Released supplier drawing",
  reviewedAt: "2026-08-08",
  drawingVersion: "2026-08-A",
  dimensionsVersion: "2026-08-A",
  materialApprovalId: "MAT-001",
  imageRightsId: "IMG-001",
};

const verifiedContent: ContentEvidence = {
  status: "operator_verified",
  evidenceId: "CONTENT-001",
  owner: "Furniture Content",
  reviewer: "A. Reviewer",
  source: "Reviewed furniture brief",
  reviewedAt: "2026-08-08",
  authorName: "TIDEFORM Editorial",
  datePublished: "2026-08-08",
  approvalId: "APPROVAL-001",
};

const productionEnv = {
  SITE_MODE: "production",
  SITE_URL: "https://store.tideform.com",
  APPROVED_PRODUCTION_DOMAIN: "store.tideform.com",
  SITE_EVIDENCE_GATE: "approved",
};

describe("SEO publishing contract", () => {
  it("uses the provisional furniture brand and category language", () => {
    expect(siteConfig.name).toBe("TIDEFORM");
    expect(siteConfig.description).toMatch(/furniture/i);
  });

  it.each([undefined, "", "prototype", "preview", "Production", " production "])(
    "silently fail-closes SITE_MODE=%s to prototype",
    (SITE_MODE) => {
      const config = getSiteRuntimeConfig({ SITE_MODE, SITE_URL: "not a URL" });
      expect(config).toMatchObject({ mode: "prototype", indexable: false, entitySchemaEnabled: false });
    },
  );

  it("allows production only with the complete URL gate and verified site identity", () => {
    expect(getSiteRuntimeConfig(productionEnv, verifiedSite)).toEqual({
      mode: "production",
      origin: "https://store.tideform.com",
      indexable: true,
      entitySchemaEnabled: true,
    });
    expect(absoluteUrl("/products", productionEnv, verifiedSite)).toBe("https://store.tideform.com/products");
  });

  it.each([
    [{ ...productionEnv, SITE_EVIDENCE_GATE: "pending" }, /evidence/i],
    [{ ...productionEnv, SITE_URL: undefined }, /SITE_URL/],
    [{ ...productionEnv, APPROVED_PRODUCTION_DOMAIN: undefined }, /APPROVED_PRODUCTION_DOMAIN/],
    [{ ...productionEnv, SITE_URL: "http://store.novaframe.com" }, /HTTPS/],
    [{ ...productionEnv, SITE_URL: "https://localhost" }, /localhost|public hostname/i],
    [{ ...productionEnv, SITE_URL: "https://127.0.0.1" }, /IP|public hostname/i],
    [{ ...productionEnv, SITE_URL: "https://[::1]" }, /IP|public hostname/i],
    [{ ...productionEnv, SITE_URL: "https://store.novaframe.com:8443" }, /port/i],
    [{ ...productionEnv, SITE_URL: "https://store.novaframe.com/path" }, /origin|path/i],
    [{ ...productionEnv, SITE_URL: "https://store.novaframe.com?preview=1" }, /origin|query/i],
    [{ ...productionEnv, SITE_URL: "https://store.novaframe.com#top" }, /origin|fragment/i],
    [{ ...productionEnv, SITE_URL: "https://store.novaframe.test", APPROVED_PRODUCTION_DOMAIN: "store.novaframe.test" }, /reserved|\.test/i],
    [{ ...productionEnv, SITE_URL: "https://store.novaframe.example", APPROVED_PRODUCTION_DOMAIN: "store.novaframe.example" }, /reserved|\.example/i],
    [{ ...productionEnv, SITE_URL: "https://store.novaframe.invalid", APPROVED_PRODUCTION_DOMAIN: "store.novaframe.invalid" }, /reserved|\.invalid/i],
    [{ ...productionEnv, SITE_URL: "https://store.novaframe.localhost", APPROVED_PRODUCTION_DOMAIN: "store.novaframe.localhost" }, /reserved|localhost/i],
    [{ ...productionEnv, APPROVED_PRODUCTION_DOMAIN: "www.novaframe.com" }, /match/i],
    [{ ...productionEnv, APPROVED_PRODUCTION_DOMAIN: "https://store.novaframe.com" }, /hostname/i],
    [{ ...productionEnv, NEXT_PUBLIC_SITE_URL: "https://www.novaframe.com" }, /NEXT_PUBLIC_SITE_URL/],
    [{ ...productionEnv, NEXT_PUBLIC_SITE_URL: "https://store.novaframe.com/" }, /NEXT_PUBLIC_SITE_URL/],
  ])("rejects an invalid production publishing configuration", (env, message) => {
    expect(() => getSiteRuntimeConfig(env, verifiedSite)).toThrow(message);
  });

  it("fails a production publish when the site identity remains prototype", () => {
    expect(() => getSiteRuntimeConfig(productionEnv, { status: "prototype" })).toThrow(/site identity/i);
  });

  it("rejects a production identity that has status but lacks publication facts", () => {
    expect(() => getSiteRuntimeConfig(productionEnv, { status: "operator_verified", evidenceId: "SITE-X", owner: "Ops", reviewer: "Reviewer", source: "Record" } as SiteIdentityEvidence)).toThrow(/identity|evidence/i);
  });
});

describe("entity-level evidence", () => {
  const product = {
    name: "Released Sideboard",
    description: "Released furniture record.",
    image: "/images/furniture/products/haven-sideboard.png",
    partNumber: "TF-SID-72",
  };

  it("suppresses site, product, and content schemas for prototype evidence", () => {
    expect(organizationJsonLd({ status: "prototype" }, productionEnv, verifiedSite)).toBeNull();
    expect(productJsonLd({ ...product, evidence: { status: "prototype" } }, productionEnv, verifiedSite)).toBeNull();
    expect(articleJsonLd({
      headline: "Guide",
      description: "Prototype guide",
      path: "/guide",
      dateModified: "2026-08-08",
      evidence: { status: "prototype" },
    }, productionEnv, verifiedSite)).toBeNull();
    expect(collectionPageJsonLd({ name: "Catalog", description: "Furniture", path: "/products", evidence: { status: "prototype" } }, productionEnv, verifiedSite)).toBeNull();
    expect(serviceJsonLd({ name: "Custom furniture", description: "Reviewed projects", path: "/custom-projects", evidence: { status: "prototype" } }, productionEnv, verifiedSite)).toBeNull();
    expect(contactPageJsonLd({ name: "Request a quote", description: "Project form", path: "/rfq", evidence: { status: "prototype" } }, productionEnv, verifiedSite)).toBeNull();
  });

  it("emits each schema only for its own operator-verified record", () => {
    expect(organizationJsonLd(verifiedSite, productionEnv, verifiedSite)?.["@type"]).toBe("Organization");
    expect(organizationJsonLd(verifiedSite, productionEnv, verifiedSite)).toMatchObject({ name: "TIDEFORM", legalName: "Tideform Furniture LLC" });
    const productSchema = productJsonLd({ ...product, evidence: verifiedProduct }, productionEnv, verifiedSite);
    expect(productSchema?.["@type"]).toBe("Product");
    expect(productSchema?.category).toBe("Aluminum-frame furniture");
    expect(productSchema).not.toHaveProperty("offers");
    expect(productSchema).not.toHaveProperty("aggregateRating");
    expect(articleJsonLd({
      headline: "Guide",
      description: "Reviewed guide",
      path: "/guide",
      dateModified: "2026-08-08",
      evidence: verifiedContent,
    }, productionEnv, verifiedSite)).toMatchObject({ "@type": "Article", author: { "@type": "Person", name: "TIDEFORM Editorial" } });
    expect(collectionPageJsonLd({ name: "Catalog", description: "Furniture", path: "/products", evidence: verifiedContent }, productionEnv, verifiedSite)).toMatchObject({ "@type": "CollectionPage", name: "Catalog" });
    expect(serviceJsonLd({ name: "Custom furniture", description: "Reviewed projects", path: "/custom-projects", evidence: verifiedContent }, productionEnv, verifiedSite)).toMatchObject({ "@type": "Service", provider: { "@type": "Organization", name: "TIDEFORM" } });
    expect(contactPageJsonLd({ name: "Request a quote", description: "Project form", path: "/rfq", evidence: verifiedContent }, productionEnv, verifiedSite)).toMatchObject({ "@type": "ContactPage", name: "Request a quote" });
    expect(itemListJsonLd({
      name: "Furniture",
      description: "Released furniture list.",
      path: "/products",
      evidence: verifiedContent,
      items: [{ name: product.name, path: "/products/released-sideboard", evidence: verifiedProduct }],
    }, productionEnv, verifiedSite)).toMatchObject({ "@type": "ItemList", numberOfItems: 1 });
  });
});

describe("route metadata", () => {
  it("uses noindex,follow in prototype and supports exact OG dimensions", () => {
    const metadata = routeMetadata("Product", "Description", "/products/item", {
      imagePath: "/images/products/item.png",
      imageWidth: 1024,
      imageHeight: 1024,
    });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({ width: 1024, height: 1024 }),
    ]);
  });

  it("canonicalizes facet pages to products and marks them noindex while tracking-only URLs stay clean", () => {
    const facet = routeMetadata("Products", "Description", "/products", { noIndex: true });
    const tracking = routeMetadata("Products", "Description", "/products");
    expect(facet.alternates).toEqual({ canonical: "https://www.tideform.example/products" });
    expect(facet.robots).toEqual({ index: false, follow: true });
    expect(tracking.alternates).toEqual({ canonical: "https://www.tideform.example/products" });
  });

  it("keeps prototype entity pages noindex after the site identity reaches production", () => {
    const prototype = routeMetadata("Prototype", "Description", "/products/prototype", {
      env: productionEnv,
      identity: verifiedSite,
      evidence: { status: "prototype" },
    } as never);
    const released = routeMetadata("Released", "Description", "/guide", {
      env: productionEnv,
      identity: verifiedSite,
      evidence: verifiedContent,
    } as never);
    expect(prototype.robots).toEqual({ index: false, follow: true });
    expect(released.robots).toBeUndefined();
  });

  it("indexes the production homepage from verified site identity evidence", () => {
    const home = routeMetadata("Home", "Description", "/", { env: productionEnv, identity: verifiedSite });
    expect(home.robots).toBeUndefined();
  });
});
