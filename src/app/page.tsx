import type { Metadata } from "next";

import { ProductCard } from "@/components/catalog/product-card";
import { ApplicationBand } from "@/components/home/application-band";
import { CategoryRail } from "@/components/home/category-rail";
import { HomeHero } from "@/components/home/home-hero";
import { ResourcesPreview } from "@/components/home/resources-preview";
import { RfqBand } from "@/components/home/rfq-band";
import { ServicesPreview } from "@/components/home/services-preview";
import { SectionHeading } from "@/components/ui/section-heading";
import { products } from "@/lib/catalog";
import { routeMetadata } from "@/lib/seo";

export const metadata: Metadata = routeMetadata(
  "Aluminum-Frame and Marine-Grade Panel Furniture",
  "Explore modular consoles, sideboards, media storage, shelving, tables, and benches built from aluminum frames and marine-grade panel surfaces.",
  "/",
);

export default function Home() {
  const featured = products.filter((product) => product.featured).slice(0, 4);
  return (
    <>
      <HomeHero />
      <CategoryRail />
      <section className="section featured-products">
        <div className="container">
          <SectionHeading title="Furniture for spaces that work hard." description="Standard pieces pair clear dimensions and finish choices with a direct path to custom sizes, colors, and configurations." link={{ href: "/products", label: "View all furniture" }} />
          <div className="product-grid product-grid--four">{featured.map((product, index) => <ProductCard key={product.handle} product={product} listId="home-featured" position={index + 1} />)}</div>
        </div>
      </section>
      <ApplicationBand />
      <ServicesPreview />
      <ResourcesPreview />
      <RfqBand />
    </>
  );
}
