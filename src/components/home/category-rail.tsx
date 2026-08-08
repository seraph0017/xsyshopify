import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const categories = [
  { label: "Storage", value: "sideboard", image: "/images/furniture/products/haven-sideboard.png" },
  { label: "Tables", value: "table", image: "/images/furniture/products/wayfinder-work-table.png" },
  { label: "Shelving", value: "shelving", image: "/images/furniture/products/pier-shelving.png" },
  { label: "Media", value: "media", image: "/images/furniture/products/cove-media-console.png" },
  { label: "Benches", value: "bench", image: "/images/furniture/products/drift-bench.png" },
];

export function CategoryRail() {
  return (
    <nav className="category-rail container-wide" aria-label="Furniture categories">
      {categories.map(({ label, value, image }) => (
        <Link href={`/products?category=${value}`} key={value}>
          <Image src={image} alt="" width={1600} height={700} />
          <span><strong>{label}</strong><ArrowRight aria-hidden="true" /></span>
        </Link>
      ))}
    </nav>
  );
}
