import type { Metadata } from "next";
import { Frame, Layers3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { StructuredData } from "@/components/structured-data";
import { RouteAnalytics } from "@/components/analytics/route-analytics";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FactStatus } from "@/components/ui/fact-status";
import { articleJsonLd, breadcrumbJsonLd, contentEvidenceForPath, routeMetadata } from "@/lib/seo";

const title = "Materials and Construction";
const description = "Understand the visible aluminum frame and marine-grade panel construction used in the TIDEFORM furniture prototype, including evidence boundaries and care dependencies.";

export const metadata: Metadata = routeMetadata(title, description, "/materials", { imagePath: "/images/furniture/lifestyle/material-detail.png", imageWidth: 1024, imageHeight: 1024 });

export default function MaterialsPage() {
  const evidence = contentEvidenceForPath("/materials");
  return (
    <>
      <StructuredData data={[
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Materials", path: "/materials" }]),
        articleJsonLd({ headline: title, description, path: "/materials", dateModified: "2026-08-08", evidence }),
      ]} evidence={evidence} />
      <RouteAnalytics name="view_guide" detail={{ content_id: "materials", content_type: "materials", evidence_status: "prototype" }} />
      <div className="page-intro container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Materials" }]} />
        <h1>Frame and panel, read as one piece.</h1>
        <p>The collection is designed as finished furniture made from two visible parts: an aluminum frame and marine-grade panel surfaces used for tops, shelves, sides, doors, or seats. Marine-grade panel is a neutral working term here. The exact panel substrate, thickness, finish system, edge treatment, connection details, and performance data remain supplier-confirmation items before production.</p>
        <FactStatus appliesTo="The visual and information architecture of this furniture prototype" doesNotCover="Confirmed panel substrate, performance ratings, outdoor suitability, load capacity, finish chemistry, or warranties" market="Prototype market presentation" unitSystem="Product dimensions shown in inches" lastReviewed="August 8, 2026" evidenceStatus="Prototype / supplier material evidence pending" contentOwner="Product and material content / production owner pending" sourceStatus="Prototype fixtures and generated imagery / supplier specifications pending" />
      </div>
      <section className="materials-story container">
        <Image src="/images/furniture/lifestyle/material-detail.png" alt="Close view of a brushed aluminum frame meeting a matte green panel" width={1024} height={1024} priority style={{ width: "100%", height: "auto" }} />
        <div>
          <article><Frame aria-hidden="true" /><h2>Aluminum frame</h2><p>The frame sets the furniture&apos;s spacing, edges, and visual rhythm. This prototype shows a brushed silver finish; alloy, temper, surface process, connection details, and load data remain pending.</p></article>
          <article><Layers3 aria-hidden="true" /><h2>Marine-grade panel</h2><p>The panels form work surfaces, shelves, sides, doors, and seats. Marine-grade panel is a neutral working term. The specific substrate and production specifications remain supplier-confirmation items.</p></article>
        </div>
      </section>
      <section className="pdp-section container"><div className="pdp-section__title"><h2>Construction facts and confirmation points</h2><p>Visible roles are separated from production facts that still need approved records.</p></div><div className="spec-table-wrap"><table><thead><tr><th>Component</th><th>Role in the furniture</th><th>Confirmed before production</th></tr></thead><tbody><tr><td>Aluminum frame</td><td>Defines the visible structure, spacing, and edges.</td><td>Alloy, finish process, connections, and final dimensions.</td></tr><tr><td>Marine-grade panel</td><td>Forms tops, shelves, sides, doors, or seats.</td><td>Substrate, thickness, surface system, edges, and care.</td></tr><tr><td>Hardware</td><td>Connects parts and supports doors or adjustable elements.</td><td>Fasteners, hinges, feet, assembly sequence, and replacement parts.</td></tr></tbody></table></div></section>
      <section className="article-section article-section--white"><div className="container two-column-copy"><div><h2>Visible in the prototype</h2><p>The current collection shows the combination of aluminum frames and panel surfaces, along with a provisional finish palette.</p></div><div><h2>Confirmed before production</h2><p>Panel composition, performance data, intended environment, certifications, warranties, and care requirements depend on approved supplier evidence.</p></div></div></section>
      <section className="resource-rfq container"><div><h2>Need a finish outside the standard palette?</h2><p>Share a color reference and the intended room or project context for review.</p></div><Link className="button button--dark" href="/rfq">Request a material match</Link></section>
    </>
  );
}
