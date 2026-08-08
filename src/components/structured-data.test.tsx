import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import type { SiteIdentityEvidence } from "@/lib/seo";

import { StructuredData } from "./structured-data";

const env = {
  SITE_MODE: "production",
  SITE_URL: "https://store.tideform.com",
  APPROVED_PRODUCTION_DOMAIN: "store.tideform.com",
  SITE_EVIDENCE_GATE: "approved",
};
const siteIdentity: SiteIdentityEvidence = {
  status: "operator_verified",
  evidenceId: "SITE-1",
  owner: "Ops",
  reviewer: "Reviewer",
  source: "Identity record",
  reviewedAt: "2026-08-08",
  brandName: "TIDEFORM",
  legalName: "Tideform Furniture LLC",
  brandRelationship: "Operator-owned brand",
  publicContactUrl: "https://store.tideform.com/contact",
  privacyPolicyUrl: "https://store.tideform.com/privacy",
  termsUrl: "https://store.tideform.com/terms",
  organizationDescription: "Furniture operator.",
};

describe("StructuredData publishing gate", () => {
  it("renders no JSON-LD in prototype mode", () => {
    expect(renderToStaticMarkup(<StructuredData data={{ "@type": "Product", name: "Preview" }} env={{}} siteIdentity={{ status: "prototype" }} />)).toBe("");
  });

  it("renders verified JSON-LD after the site production gate passes", () => {
    const html = renderToStaticMarkup(<StructuredData data={[null, { "@type": "Organization", name: "TIDEFORM" }]} evidence={siteIdentity} env={env} siteIdentity={siteIdentity} />);
    expect(html).toContain("application/ld+json");
    expect(html).toContain("Organization");
    expect(html).not.toContain("null");
  });
});
