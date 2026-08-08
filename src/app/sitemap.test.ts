import { describe, expect, it } from "vitest";

import type { Product } from "@/lib/catalog";
import type { ContentEntity, SiteIdentityEvidence } from "@/lib/seo";

import { buildSitemap } from "./sitemap";

const env = {
  SITE_MODE: "production",
  SITE_URL: "https://store.tideform.com",
  APPROVED_PRODUCTION_DOMAIN: "store.tideform.com",
  SITE_EVIDENCE_GATE: "approved",
};

const site: SiteIdentityEvidence = { status: "operator_verified", evidenceId: "SITE-1", owner: "Ops", reviewer: "Reviewer", source: "Record", reviewedAt: "2026-08-08", brandName: "TIDEFORM", legalName: "Tideform Furniture LLC", brandRelationship: "Operator-owned brand", publicContactUrl: "https://store.tideform.com/contact", privacyPolicyUrl: "https://store.tideform.com/privacy", termsUrl: "https://store.tideform.com/terms", organizationDescription: "Furniture operator." };
const product = {
  handle: "released-sideboard",
  evidence: { status: "operator_verified", evidenceId: "SKU-1", owner: "Product", reviewer: "Reviewer", source: "Drawing", reviewedAt: "2026-08-08", drawingVersion: "A", dimensionsVersion: "A", materialApprovalId: "MAT-1", imageRightsId: "IMG-1" },
} as Product;
const content: ContentEntity[] = [
  { path: "/released-guide", lastReviewed: "2026-08-01", evidence: { status: "operator_verified", evidenceId: "DOC-1", owner: "Content", reviewer: "Reviewer", source: "Review", reviewedAt: "2026-08-08", authorName: "TIDEFORM Editorial", datePublished: "2026-08-01", approvalId: "APPROVAL-1" } },
  { path: "/prototype-guide", lastReviewed: "2026-08-01", evidence: { status: "prototype" } },
];

describe("sitemap evidence filtering", () => {
  it("returns no URLs in prototype mode", () => {
    expect(buildSitemap({ env: {}, siteIdentity: { status: "prototype" }, products: [product], content })).toEqual([]);
  });

  it("includes only verified product and content entities with evidence-backed lastmod", () => {
    const entries = buildSitemap({ env, siteIdentity: site, products: [product, { ...product, handle: "prototype", evidence: { status: "prototype" } }], content });
    expect(entries.map((entry) => entry.url)).toEqual([
      "https://store.tideform.com/",
      "https://store.tideform.com/released-guide",
      "https://store.tideform.com/products/released-sideboard",
    ]);
    expect(entries.find((entry) => entry.url.endsWith("released-guide"))?.lastModified).toEqual(new Date("2026-08-01T00:00:00.000Z"));
    expect(entries.some((entry) => entry.url.includes("prototype"))).toBe(false);
  });
});
