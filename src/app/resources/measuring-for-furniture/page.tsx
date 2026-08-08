import type { Metadata } from "next";
import { AlertTriangle, ArrowRight, DoorOpen, Ruler, SquareDashed } from "lucide-react";
import Link from "next/link";

import { StructuredData } from "@/components/structured-data";
import { RouteAnalytics } from "@/components/analytics/route-analytics";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FactStatus } from "@/components/ui/fact-status";
import { articleJsonLd, breadcrumbJsonLd, contentEvidenceForPath, routeMetadata } from "@/lib/seo";

const title = "How to Measure for Furniture";
const description = "Measure the room, usable wall, furniture envelope, access path, outlets, baseboards, and operating clearances before ordering or requesting custom furniture.";

export const metadata: Metadata = routeMetadata(title, description, "/resources/measuring-for-furniture");

export default function MeasuringGuidePage() {
  const evidence = contentEvidenceForPath("/resources/measuring-for-furniture");
  return (
    <>
      <StructuredData data={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Resources", path: "/resources" }, { name: title, path: "/resources/measuring-for-furniture" }]), articleJsonLd({ headline: title, description, path: "/resources/measuring-for-furniture", dateModified: "2026-08-08", evidence })]} evidence={evidence} />
      <RouteAnalytics name="view_guide" detail={{ content_id: "measuring-for-furniture", content_type: "measuring", evidence_status: "prototype" }} />
      <article className="guide-page container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Resources", href: "/resources" }, { label: "Measuring for furniture" }]} />
        <header className="guide-header"><h1>Measure the room and the route, not just the wall.</h1><p className="article-answer">A useful furniture measurement records the maximum finished envelope, usable wall width, baseboards, outlets, nearby doors and drawers, circulation clearance, and every doorway, turn, stair, or lift on the delivery path.</p></header>
        <FactStatus appliesTo="Early selection and custom-project information gathering" doesNotCover="Final fit approval, package dimensions, installation, anchoring, code clearance, or site verification" market="Prototype market presentation" unitSystem="Inches; state another unit explicitly when used" lastReviewed="August 8, 2026" evidenceStatus="Prototype planning guidance / production review pending" contentOwner="Furniture support content / production owner pending" sourceStatus="Prototype measuring workflow / final product and site records pending" />
        <section className="guide-section planning-grid"><div><Ruler aria-hidden="true" /><h2>1. Define the furniture envelope</h2><p>Record maximum width, depth, and height. Include handles, doors, top overhangs, feet, cable space, and the clearance needed to operate doors or drawers.</p></div><div><SquareDashed aria-hidden="true" /><h2>2. Record the usable wall</h2><p>Measure between fixed obstructions. Note baseboard projection, outlets, switches, vents, windowsills, radiators, and floor slope.</p></div><div><DoorOpen aria-hidden="true" /><h2>3. Walk the access path</h2><p>Measure the narrowest doorway, corridor, turn, stair, and lift. Record thresholds and any point where the package must rotate.</p></div></section>
        <section className="guide-section"><h2>Measurement checklist</h2><div className="spec-table-wrap"><table><thead><tr><th>Area</th><th>Record</th><th>Why it matters</th></tr></thead><tbody><tr><td>Furniture position</td><td>Usable width, depth limit, height limit</td><td>Defines the finished envelope.</td></tr><tr><td>Wall and floor</td><td>Baseboards, outlets, vents, slope</td><td>Affects fit, leveling, and cable space.</td></tr><tr><td>Operation</td><td>Door, drawer, chair, and circulation clearances</td><td>Prevents nearby elements from blocking use.</td></tr><tr><td>Delivery path</td><td>Doors, turns, stairs, lift, thresholds</td><td>Determines packaging and assembly review.</td></tr><tr><td>Reference</td><td>Photos or plan with measurement points</td><td>Reduces ambiguity during custom review.</td></tr></tbody></table></div></section>
        <section className="limitation-block"><AlertTriangle aria-hidden="true" /><div><h2>Measure twice and keep the reference points visible.</h2><p>This guide organizes inputs but does not certify fit. Final product dimensions, packaging, assembly, site conditions, and installation responsibility must be confirmed before production.</p></div></section>
        <section className="guide-cta"><div><h2>Ready to share the room and target dimensions?</h2><p>Add plans or photos and describe what should change from the standard piece.</p></div><Link className="button button--dark" href="/rfq">Start a custom project<ArrowRight aria-hidden="true" /></Link></section>
      </article>
    </>
  );
}
