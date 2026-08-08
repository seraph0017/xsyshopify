import type { Metadata } from "next";

import { CartProvider } from "@/components/cart/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StructuredData } from "@/components/structured-data";
import { absoluteUrl, getSiteRuntimeConfig, organizationJsonLd, siteConfig, siteIdentityEvidence, websiteJsonLd } from "@/lib/seo";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: { default: "TIDEFORM | Frame-and-Panel Furniture", template: "%s | TIDEFORM" },
  description: siteConfig.description,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: { siteName: siteConfig.name, type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  robots: getSiteRuntimeConfig().mode === "prototype" ? { index: false, follow: true } : undefined,
};

const organizationSchema = organizationJsonLd(siteIdentityEvidence);
const websiteSchema = websiteJsonLd(siteIdentityEvidence);

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <StructuredData data={[organizationSchema, websiteSchema]} evidence={siteIdentityEvidence} />
        <CartProvider>
          <a className="skip-link" href="#main-content">Skip to main content</a>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
