import type { MetadataRoute } from "next";

import { products, type Product } from "@/lib/catalog";
import {
  absoluteUrl,
  contentEntities,
  getSiteRuntimeConfig,
  isVerifiedContentEvidence,
  isVerifiedProductEvidence,
  siteIdentityEvidence,
  type ContentEntity,
  type SiteEnvironment,
  type SiteIdentityEvidence,
} from "@/lib/seo";

type SitemapInput = {
  env?: SiteEnvironment;
  siteIdentity?: SiteIdentityEvidence;
  products: Product[];
  content: ContentEntity[];
};

export function buildSitemap({ env = process.env, siteIdentity = siteIdentityEvidence, products: productRecords, content }: SitemapInput): MetadataRoute.Sitemap {
  const runtime = getSiteRuntimeConfig(env, siteIdentity);
  if (!runtime.indexable) return [];
  return [
    { url: absoluteUrl("/", env, siteIdentity), changeFrequency: "weekly" as const, priority: 1 },
    ...content.filter((entity) => isVerifiedContentEvidence(entity.evidence)).map((entity) => ({
      url: absoluteUrl(entity.path, env, siteIdentity),
      lastModified: new Date(`${entity.lastReviewed}T00:00:00.000Z`),
      changeFrequency: "monthly" as const,
      priority: .7,
    })),
    ...productRecords.filter((product) => isVerifiedProductEvidence(product.evidence)).map((product) => ({
      url: absoluteUrl(`/products/${product.handle}`, env, siteIdentity),
      ...(product.evidence.status === "operator_verified" && product.evidence.reviewedAt
        ? { lastModified: new Date(`${product.evidence.reviewedAt}T00:00:00.000Z`) }
        : {}),
      changeFrequency: "weekly" as const,
      priority: .7,
    })),
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap({ products, content: contentEntities });
}
