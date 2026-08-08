import type { Metadata } from "next";

export type SiteEnvironment = Record<string, string | undefined>;
export type EvidenceStatus = "prototype" | "operator_verified";

type PrototypeEvidence = { status: "prototype" };
type VerifiedEvidenceBase = {
  status: "operator_verified";
  evidenceId: string;
  owner: string;
  reviewer: string;
  source: string;
  reviewedAt: string;
};

export type VerifiedSiteIdentityEvidence = VerifiedEvidenceBase & {
  brandName: string;
  legalName: string;
  brandRelationship: string;
  publicContactUrl: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  organizationDescription: string;
};
export type VerifiedProductEvidence = VerifiedEvidenceBase & {
  drawingVersion: string;
  dimensionsVersion: string;
  materialApprovalId: string;
  imageRightsId: string;
};
export type VerifiedContentEvidence = VerifiedEvidenceBase & {
  authorName: string;
  datePublished: string;
  approvalId: string;
};

export type SiteIdentityEvidence = PrototypeEvidence | VerifiedSiteIdentityEvidence;
export type ProductEvidence = PrototypeEvidence | VerifiedProductEvidence;
export type ContentEvidence = PrototypeEvidence | VerifiedContentEvidence;

export type ContentEntity = {
  path: string;
  lastReviewed: string;
  evidence: ContentEvidence;
};

export type SiteRuntimeConfig = {
  mode: "prototype" | "production";
  origin: string;
  indexable: boolean;
  entitySchemaEnabled: boolean;
};

export const siteIdentityEvidence: SiteIdentityEvidence = { status: "prototype" };

export const contentEntities: ContentEntity[] = [
  { path: "/products", lastReviewed: "2026-08-08", evidence: { status: "prototype" } },
  { path: "/collections/living", lastReviewed: "2026-08-08", evidence: { status: "prototype" } },
  { path: "/materials", lastReviewed: "2026-08-08", evidence: { status: "prototype" } },
  { path: "/custom-projects", lastReviewed: "2026-08-08", evidence: { status: "prototype" } },
  { path: "/resources", lastReviewed: "2026-08-08", evidence: { status: "prototype" } },
  { path: "/resources/measuring-for-furniture", lastReviewed: "2026-08-08", evidence: { status: "prototype" } },
  { path: "/rfq", lastReviewed: "2026-08-08", evidence: { status: "prototype" } },
];

export function contentEvidenceForPath(path: string): ContentEvidence {
  return contentEntities.find((entity) => entity.path === path)?.evidence ?? { status: "prototype" };
}

const nonEmpty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const validDate = (value: unknown): value is string => nonEmpty(value) && /^\d{4}-\d{2}-\d{2}$/.test(value);
const validHttpsUrl = (value: unknown): value is string => {
  if (!nonEmpty(value)) return false;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
};

function hasVerifiedBase(evidence: unknown): evidence is VerifiedEvidenceBase {
  if (!evidence || typeof evidence !== "object") return false;
  const candidate = evidence as Record<string, unknown>;
  return candidate.status === "operator_verified"
    && [candidate.evidenceId, candidate.owner, candidate.reviewer, candidate.source].every(nonEmpty)
    && validDate(candidate.reviewedAt);
}

export function isVerifiedSiteIdentity(evidence: SiteIdentityEvidence): evidence is VerifiedSiteIdentityEvidence {
  if (!hasVerifiedBase(evidence)) return false;
  return [evidence.brandName, evidence.legalName, evidence.brandRelationship, evidence.organizationDescription].every(nonEmpty)
    && [evidence.publicContactUrl, evidence.privacyPolicyUrl, evidence.termsUrl].every(validHttpsUrl);
}

export function isVerifiedProductEvidence(evidence: ProductEvidence): evidence is VerifiedProductEvidence {
  return hasVerifiedBase(evidence)
    && [evidence.drawingVersion, evidence.dimensionsVersion, evidence.materialApprovalId, evidence.imageRightsId].every(nonEmpty);
}

export function isVerifiedContentEvidence(evidence: ContentEvidence): evidence is VerifiedContentEvidence {
  return hasVerifiedBase(evidence)
    && [evidence.authorName, evidence.approvalId].every(nonEmpty)
    && validDate(evidence.datePublished);
}

export function isEvidencePublishable(evidence: SiteIdentityEvidence | ProductEvidence | ContentEvidence): boolean {
  if (evidence.status !== "operator_verified") return false;
  if ("brandName" in evidence) return isVerifiedSiteIdentity(evidence as SiteIdentityEvidence);
  if ("drawingVersion" in evidence) return isVerifiedProductEvidence(evidence as ProductEvidence);
  if ("authorName" in evidence) return isVerifiedContentEvidence(evidence as ContentEvidence);
  return false;
}

const prototypeOrigin = "https://www.tideform.example";
const reservedSuffixes = [".test", ".example", ".invalid", ".localhost"];

function isIpAddress(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "");
  return host.includes(":") || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
}

function isPublicHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || isIpAddress(host)) return false;
  return !reservedSuffixes.some((suffix) => host.endsWith(suffix));
}

function getPrototypeOrigin(env: SiteEnvironment): string {
  const candidate = env.SITE_URL ?? env.NEXT_PUBLIC_SITE_URL;
  if (!candidate) return prototypeOrigin;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" && url.origin === candidate ? url.origin : prototypeOrigin;
  } catch {
    return prototypeOrigin;
  }
}

function requireProductionOrigin(env: SiteEnvironment): string {
  if (env.SITE_EVIDENCE_GATE !== "approved") {
    throw new Error("Production publishing requires SITE_EVIDENCE_GATE=approved.");
  }
  if (!env.SITE_URL) throw new Error("Production publishing requires SITE_URL.");
  if (!env.APPROVED_PRODUCTION_DOMAIN) {
    throw new Error("Production publishing requires APPROVED_PRODUCTION_DOMAIN.");
  }

  let url: URL;
  try {
    url = new URL(env.SITE_URL);
  } catch {
    throw new Error("Production SITE_URL must be a valid HTTPS origin.");
  }
  if (url.protocol !== "https:") throw new Error("Production SITE_URL must use HTTPS.");
  if (url.port) throw new Error("Production SITE_URL must not include a port.");
  if (url.origin !== env.SITE_URL || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("Production SITE_URL must be the exact origin without a path, query, or fragment.");
  }
  if (!isPublicHostname(url.hostname)) {
    throw new Error("Production SITE_URL must use a public hostname, not localhost, an IP address, or a reserved domain.");
  }
  if (!/^[a-z0-9.-]+$/i.test(env.APPROVED_PRODUCTION_DOMAIN) || env.APPROVED_PRODUCTION_DOMAIN.includes(":")) {
    throw new Error("APPROVED_PRODUCTION_DOMAIN must contain only the approved hostname.");
  }
  if (!isPublicHostname(env.APPROVED_PRODUCTION_DOMAIN)) {
    throw new Error("APPROVED_PRODUCTION_DOMAIN must be a public hostname, not a reserved domain.");
  }
  if (url.hostname !== env.APPROVED_PRODUCTION_DOMAIN.toLowerCase()) {
    throw new Error("SITE_URL hostname must match APPROVED_PRODUCTION_DOMAIN exactly.");
  }
  if (env.NEXT_PUBLIC_SITE_URL !== undefined && env.NEXT_PUBLIC_SITE_URL !== url.origin) {
    throw new Error("Legacy NEXT_PUBLIC_SITE_URL must equal the SITE_URL origin exactly.");
  }
  return url.origin;
}

export function getSiteRuntimeConfig(
  env: SiteEnvironment = process.env,
  identity: SiteIdentityEvidence = siteIdentityEvidence,
): SiteRuntimeConfig {
  if (env.SITE_MODE !== "production") {
    return {
      mode: "prototype",
      origin: getPrototypeOrigin(env),
      indexable: false,
      entitySchemaEnabled: false,
    };
  }

  const origin = requireProductionOrigin(env);
  if (!isVerifiedSiteIdentity(identity)) {
    throw new Error("Production publishing requires a complete operator-verified site identity evidence record.");
  }
  return { mode: "production", origin, indexable: true, entitySchemaEnabled: true };
}

export function isOperatorVerified(evidence: SiteIdentityEvidence | ProductEvidence | ContentEvidence): boolean {
  return isEvidencePublishable(evidence);
}

export function shouldEmitEntitySchema(
  env: SiteEnvironment = process.env,
  identity: SiteIdentityEvidence = siteIdentityEvidence,
): boolean {
  return getSiteRuntimeConfig(env, identity).entitySchemaEnabled;
}

export function indexableUrls(
  paths: string[],
  env: SiteEnvironment = process.env,
  identity: SiteIdentityEvidence = siteIdentityEvidence,
): string[] {
  const config = getSiteRuntimeConfig(env, identity);
  if (!config.indexable) return [];
  return paths.map((path) => absoluteUrl(path, env, identity));
}

const runtimeConfig = getSiteRuntimeConfig();

export const siteConfig = {
  name: "TIDEFORM",
  description: "Prototype storefront for aluminum-frame and marine-grade-panel furniture, standard pieces, and custom projects.",
  origin: runtimeConfig.origin,
};

export function absoluteUrl(
  path = "/",
  env: SiteEnvironment = process.env,
  identity: SiteIdentityEvidence = siteIdentityEvidence,
): string {
  return new URL(path, getSiteRuntimeConfig(env, identity).origin).toString();
}

type RouteMetadataOptions = {
  noIndex?: boolean;
  imagePath?: string;
  imageWidth?: number;
  imageHeight?: number;
  evidence?: ProductEvidence | ContentEvidence | SiteIdentityEvidence;
  env?: SiteEnvironment;
  identity?: SiteIdentityEvidence;
};

export function routeMetadata(
  title: string,
  description: string,
  path: string,
  options: RouteMetadataOptions | boolean = {},
  legacyImagePath?: string,
): Metadata {
  const normalized = typeof options === "boolean"
    ? { noIndex: options, imagePath: legacyImagePath }
    : options;
  const env = normalized.env ?? process.env;
  const identity = normalized.identity ?? siteIdentityEvidence;
  const config = getSiteRuntimeConfig(env, identity);
  const canonical = absoluteUrl(path, env, identity);
  const imagePath = normalized.imagePath ?? "/images/furniture/lifestyle/hero-sideboard.png";
  const image = absoluteUrl(imagePath, env, identity);
  const width = normalized.imageWidth ?? 1920;
  const height = normalized.imageHeight ?? 1088;
  const routeEvidence = normalized.evidence ?? (path === "/" ? identity : contentEvidenceForPath(path));
  const routeIndexable = config.mode === "production" && isEvidencePublishable(routeEvidence) && !normalized.noIndex;
  return {
    title,
    description,
    alternates: { canonical },
    robots: !routeIndexable
      ? { index: false, follow: true }
      : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: isVerifiedSiteIdentity(identity) ? identity.brandName : siteConfig.name,
      type: "website",
      images: [{ url: image, width, height, alt: "TIDEFORM aluminum-frame furniture prototype" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

type ProductSchemaInput = {
  name: string;
  description: string;
  image: string;
  partNumber: string;
  evidence: ProductEvidence;
};

export function productJsonLd(
  product: ProductSchemaInput,
  env: SiteEnvironment = process.env,
  identity: SiteIdentityEvidence = siteIdentityEvidence,
) {
  if (!shouldEmitEntitySchema(env, identity) || !isVerifiedProductEvidence(product.evidence)) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: absoluteUrl(product.image, env, identity),
    sku: product.partNumber,
    category: "Aluminum-frame furniture",
    additionalProperty: [
      { "@type": "PropertyValue", name: "Drawing version", value: product.evidence.drawingVersion },
      { "@type": "PropertyValue", name: "Dimensions version", value: product.evidence.dimensionsVersion },
    ],
  };
}

export function organizationJsonLd(
  evidence: SiteIdentityEvidence,
  env: SiteEnvironment = process.env,
  identity: SiteIdentityEvidence = siteIdentityEvidence,
) {
  if (!shouldEmitEntitySchema(env, identity) || !isVerifiedSiteIdentity(evidence)) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: evidence.brandName,
    legalName: evidence.legalName,
    url: absoluteUrl("/", env, identity),
    description: evidence.organizationDescription,
    contactPoint: { "@type": "ContactPoint", url: evidence.publicContactUrl },
    privacyPolicy: evidence.privacyPolicyUrl,
    termsOfService: evidence.termsUrl,
  };
}

export function websiteJsonLd(
  evidence: SiteIdentityEvidence,
  env: SiteEnvironment = process.env,
  identity: SiteIdentityEvidence = siteIdentityEvidence,
) {
  if (!shouldEmitEntitySchema(env, identity) || !isVerifiedSiteIdentity(evidence)) return null;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: evidence.brandName,
    url: absoluteUrl("/", env, identity),
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/search", env, identity)}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleJsonLd(
  input: {
    headline: string;
    description: string;
    path: string;
    dateModified: string;
    evidence: ContentEvidence;
  },
  env: SiteEnvironment = process.env,
  identity: SiteIdentityEvidence = siteIdentityEvidence,
) {
  if (!shouldEmitEntitySchema(env, identity) || !isVerifiedContentEvidence(input.evidence) || !isVerifiedSiteIdentity(identity)) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: absoluteUrl(input.path, env, identity),
    datePublished: input.evidence.datePublished,
    dateModified: input.dateModified,
    author: { "@type": "Person", name: input.evidence.authorName },
    publisher: { "@type": "Organization", name: identity.brandName },
  };
}

type ContentPageSchemaInput = {
  name: string;
  description: string;
  path: string;
  evidence: ContentEvidence;
};

function verifiedContentPage(
  input: ContentPageSchemaInput,
  type: "CollectionPage" | "ContactPage",
  env: SiteEnvironment,
  identity: SiteIdentityEvidence,
) {
  if (!shouldEmitEntitySchema(env, identity) || !isVerifiedContentEvidence(input.evidence) || !isVerifiedSiteIdentity(identity)) return null;
  return {
    "@context": "https://schema.org",
    "@type": type,
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path, env, identity),
    isPartOf: { "@type": "WebSite", name: identity.brandName, url: absoluteUrl("/", env, identity) },
  };
}

export function collectionPageJsonLd(
  input: ContentPageSchemaInput,
  env: SiteEnvironment = process.env,
  identity: SiteIdentityEvidence = siteIdentityEvidence,
) {
  return verifiedContentPage(input, "CollectionPage", env, identity);
}

export function contactPageJsonLd(
  input: ContentPageSchemaInput,
  env: SiteEnvironment = process.env,
  identity: SiteIdentityEvidence = siteIdentityEvidence,
) {
  return verifiedContentPage(input, "ContactPage", env, identity);
}

export function serviceJsonLd(
  input: ContentPageSchemaInput,
  env: SiteEnvironment = process.env,
  identity: SiteIdentityEvidence = siteIdentityEvidence,
) {
  if (!shouldEmitEntitySchema(env, identity) || !isVerifiedContentEvidence(input.evidence) || !isVerifiedSiteIdentity(identity)) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path, env, identity),
    provider: { "@type": "Organization", name: identity.brandName, url: absoluteUrl("/", env, identity) },
  };
}

export function itemListJsonLd(
  input: ContentPageSchemaInput & { items: Array<{ name: string; path: string; evidence: ProductEvidence }> },
  env: SiteEnvironment = process.env,
  identity: SiteIdentityEvidence = siteIdentityEvidence,
) {
  if (!shouldEmitEntitySchema(env, identity) || !isVerifiedContentEvidence(input.evidence)) return null;
  const verifiedItems = input.items.filter((item) => isVerifiedProductEvidence(item.evidence));
  if (!verifiedItems.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    url: absoluteUrl(input.path, env, identity),
    numberOfItems: verifiedItems.length,
    itemListElement: verifiedItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path, env, identity),
    })),
  };
}
