import type { Metadata } from "next";
import { ArrowRight, BookOpenText, PackageOpen, Ruler, Sparkles } from "lucide-react";
import Link from "next/link";

import { StructuredData } from "@/components/structured-data";
import { RouteAnalytics } from "@/components/analytics/route-analytics";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FactStatus } from "@/components/ui/fact-status";
import { breadcrumbJsonLd, collectionPageJsonLd, contentEvidenceForPath, routeMetadata } from "@/lib/seo";

const title = "Furniture Care, Assembly, and Measuring Guides";
const description = "Plan room dimensions, delivery access, assembly, anchoring, and finish-specific care for aluminum-frame and panel furniture.";

export const metadata: Metadata = routeMetadata(title, description, "/resources");

const resources = [
  { icon: Ruler, title: "Measure for furniture", text: "Record room, wall, access path, outlets, baseboards, and operating clearances.", href: "/resources/measuring-for-furniture" },
  { icon: PackageOpen, title: "Delivery and assembly", text: "Confirm package dimensions, route, lift or stair access, assembly method, leveling, and anchoring before delivery.", href: "/resources" },
  { icon: Sparkles, title: "Care by finish", text: "Use only care instructions tied to the approved aluminum finish and confirmed panel specification.", href: "/materials" },
];

export default function ResourcesPage() {
  const evidence = contentEvidenceForPath("/resources");
  return (
    <>
      <StructuredData data={[
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Resources", path: "/resources" }]),
        collectionPageJsonLd({ name: title, description, path: "/resources", evidence }),
      ]} evidence={evidence} />
      <RouteAnalytics name="view_guide" detail={{ content_id: "resources", content_type: "support", evidence_status: "prototype" }} />
      <div className="page-intro resources-intro container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Resources" }]} />
        <h1>Plan the room, delivery, and everyday use.</h1>
        <p>These guides help record room dimensions, delivery access, operating clearances, assembly questions, anchoring needs, and finish-specific care dependencies before selecting or requesting furniture. They organize planning inputs only. Released instructions must come from the approved product configuration and confirmed material, hardware, packaging, delivery, and installation records.</p>
        <FactStatus appliesTo="Prototype space planning and information collection" doesNotCover="Released assembly instructions, finish-specific care, anchoring design, packaging dimensions, or delivery service levels" market="Prototype market presentation" unitSystem="Inches unless a project states otherwise" lastReviewed="August 8, 2026" evidenceStatus="Prototype / production documentation pending" contentOwner="Furniture support content / production owner pending" sourceStatus="Prototype planning guidance / released product manuals pending" />
      </div>
      <section className="resource-feature-grid container">{resources.map(({ icon: Icon, title, text, href }) => <Link href={href} key={title}><Icon aria-hidden="true" /><span><strong>{title}</strong><small>{text}</small></span><ArrowRight aria-hidden="true" /></Link>)}</section>
      <section className="pdp-section container"><div className="pdp-section__title"><h2>Guide scope and production dependency</h2><p>Each planning topic stays separate from the released instruction it depends on.</p></div><div className="spec-table-wrap"><table><thead><tr><th>Topic</th><th>Use this prototype for</th><th>Production dependency</th></tr></thead><tbody><tr><td>Measuring</td><td>Recording room, wall, clearance, and access-path dimensions.</td><td>Final product and package dimensions plus site verification.</td></tr><tr><td>Delivery and assembly</td><td>Identifying route, lift, stair, leveling, and anchoring questions.</td><td>Approved packaging, hardware, instructions, and service scope.</td></tr><tr><td>Care</td><td>Identifying the finish and the care information required.</td><td>Confirmed aluminum finish and panel specification.</td></tr></tbody></table></div></section>
      <section className="article-section article-section--white"><div className="container two-column-copy"><div><BookOpenText aria-hidden="true" /><h2>Care guidance follows the confirmed finish.</h2><p>Generic claims can damage real surfaces. The production site needs finish-specific cleaning agents, methods, restrictions, spill response, repair guidance, and source evidence.</p></div><div><PackageOpen aria-hidden="true" /><h2>Assembly guidance follows the released product.</h2><p>Final instructions need verified fasteners, sequence, tooling, leveling, anchoring, safety notes, package contents, and revision control.</p></div></div></section>
      <section className="resource-rfq container"><div><h2>Planning a piece for a constrained space?</h2><p>Use the measuring guide, then add the room and access details to a custom request.</p></div><Link className="button button--dark" href="/rfq">Start a custom project</Link></section>
    </>
  );
}
