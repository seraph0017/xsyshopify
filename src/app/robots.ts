import type { MetadataRoute } from "next";

import { absoluteUrl, getSiteRuntimeConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const runtime = getSiteRuntimeConfig();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    ...(runtime.indexable ? { sitemap: absoluteUrl("/sitemap.xml"), host: absoluteUrl("/") } : {}),
  };
}
