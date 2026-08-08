import type { Metadata } from "next";
import { ArrowRight, Palette, Ruler, Rows3, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { StructuredData } from "@/components/structured-data";
import { RouteAnalytics } from "@/components/analytics/route-analytics";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FactStatus } from "@/components/ui/fact-status";
import { breadcrumbJsonLd, contentEvidenceForPath, routeMetadata, serviceJsonLd } from "@/lib/seo";

const title = "Custom Furniture Projects";
const description = "Request custom dimensions, panel colors, storage layouts, work surfaces, project quantities, and delivery review for aluminum-frame furniture.";

export const metadata: Metadata = routeMetadata(title, description, "/custom-projects", { imagePath: "/images/furniture/lifestyle/hero-sideboard.png" });

const changes = [
  { icon: Ruler, title: "Dimensions", text: "Adjust width, depth, height, clearances, and alignment to the room." },
  { icon: Palette, title: "Panel color", text: "Start from the prototype palette or submit a color reference for review." },
  { icon: Rows3, title: "Configuration", text: "Change open and closed bays, shelf spacing, work surface, and related details." },
  { icon: Send, title: "Project scope", text: "Share quantity, destination, timing, access path, and reference material." },
];

export default function CustomProjectsPage() {
  const evidence = contentEvidenceForPath("/custom-projects");
  return (
    <>
      <StructuredData data={[
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Custom Projects", path: "/custom-projects" }]),
        serviceJsonLd({ name: title, description, path: "/custom-projects", evidence }),
      ]} evidence={evidence} />
      <RouteAnalytics name="view_custom_projects" detail={{ content_id: "custom-projects", evidence_status: "prototype" }} />
      <div className="custom-hero">
        <div className="custom-hero__copy"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Custom Projects" }]} /><h1>Start with a piece. Shape it around the room.</h1><p>A custom project starts with a finished furniture type, then adapts dimensions, marine-grade panel color, storage layout, quantity, access path, or delivery requirements around the room. The request creates a structured review record, not an order. Materials, feasibility, samples, pricing, lead time, delivery method, and approval documents remain confirmation steps.</p><Link className="button button--green" href="/rfq">Describe your project<ArrowRight aria-hidden="true" /></Link></div>
        <div className="custom-hero__media"><Image src="/images/furniture/lifestyle/hero-sideboard.png" alt="Long ocean-green sideboard showing the TIDEFORM frame-and-panel design language" fill priority sizes="(max-width: 840px) 100vw, 55vw" /></div>
      </div>
      <div className="section section--white"><div className="container"><FactStatus appliesTo="Prototype custom-furniture information gathering" doesNotCover="Confirmed feasibility, materials, pricing, lead time, delivery, installation, or order acceptance" market="Prototype market presentation" unitSystem="Inches unless the request states another unit" lastReviewed="August 8, 2026" evidenceStatus="Prototype workflow / production ownership pending" contentOwner="Custom-project workflow / production owner pending" sourceStatus="Prototype request model / supplier and operations review pending" /></div></div>
      <section className="section section--white"><div className="container"><div className="section-heading"><div><h2>What can change.</h2><p>Each request starts from a furniture type and captures the differences that matter for review.</p></div></div><div className="custom-grid">{changes.map(({ icon: Icon, title, text }, index) => <article key={title}><span>0{index + 1}</span><Icon aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
      <section className="article-section article-section--dark"><div className="container process-section"><div><h2>From room information to a reviewed configuration.</h2><p>The prototype validates the handoff structure. Production ownership, feasibility, samples, pricing, lead time, delivery, and approval records remain integration dependencies.</p></div><ol>{[["1", "Measure", "Record room, wall, access path, and clearance dimensions."], ["2", "Describe", "Choose furniture type, finish direction, layout, quantity, and timing."], ["3", "Review", "Resolve material, construction, delivery, and evidence questions."], ["4", "Confirm", "Prepare controlled configuration and commercial terms before an order."]].map(([n, title, text]) => <li key={n}><span>{n}</span><div><strong>{title}</strong><p>{text}</p></div></li>)}</ol></div></section>
      <section className="pdp-section container"><div className="pdp-section__title"><h2>What to include in a useful request</h2><p>These inputs establish a review starting point without implying production approval.</p></div><div className="spec-table-wrap"><table><thead><tr><th>Input</th><th>What to provide</th><th>Review outcome</th></tr></thead><tbody><tr><td>Furniture and room</td><td>Type, intended use, wall or floor position, and access constraints.</td><td>Starting configuration and open questions.</td></tr><tr><td>Dimensions and layout</td><td>Width, depth, height, clearances, doors, shelves, or work surface.</td><td>Feasibility and controlled dimensions for confirmation.</td></tr><tr><td>Finish and quantity</td><td>Panel color direction, reference, quantity, destination, and timing.</td><td>Material review, project scope, and commercial follow-up.</td></tr></tbody></table></div></section>
      <section className="services-cta"><div className="container"><div><h2>Bring the room and the piece into one request.</h2><p>Plans, room photos, inspiration, and dimensions help establish a useful starting point.</p></div><Link className="button button--light" href="/rfq">Start a custom project<ArrowRight aria-hidden="true" /></Link></div></section>
    </>
  );
}
