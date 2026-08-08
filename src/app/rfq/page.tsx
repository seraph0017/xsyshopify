import type { Metadata } from "next";
import { Clock3, FileCheck2, ShieldCheck } from "lucide-react";

import { RfqForm } from "@/components/rfq/rfq-form";
import { StructuredData } from "@/components/structured-data";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { breadcrumbJsonLd, contactPageJsonLd, contentEvidenceForPath, routeMetadata } from "@/lib/seo";

const title = "Request Custom Furniture Pricing";
const description = "Share furniture type, dimensions, panel finish, configuration, quantity, destination, timeline, and reference-file metadata for review.";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const params = await searchParams;
  const isConfirmation = Boolean(params.reference || params.confirmation);
  return routeMetadata(title, description, "/rfq", isConfirmation);
}

export default async function RfqPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key] : undefined;
  const evidence = contentEvidenceForPath("/rfq");
  return (
    <>
      <StructuredData data={[
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Request a Quote", path: "/rfq" }]),
        contactPageJsonLd({ name: title, description, path: "/rfq", evidence }),
      ]} evidence={evidence} />
      <div className="rfq-page container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Request a Quote" }]} />
        <header className="rfq-header">
          <div><h1>Describe the piece and the room around it.</h1><p>Use this prototype request for custom dimensions, panel colors, storage layouts, work surfaces, project quantities, and delivery constraints.</p></div>
          <div className="rfq-principles"><div><FileCheck2 aria-hidden="true" /><span><strong>Useful project scope</strong>Furniture type, dimensions, finish, room needs, quantity, and destination.</span></div><div><ShieldCheck aria-hidden="true" /><span><strong>Metadata-only files</strong>No uploaded file bytes leave the browser in this prototype.</span></div><div><Clock3 aria-hidden="true" /><span><strong>Review before commitment</strong>Feasibility, materials, pricing, timing, and delivery remain production dependencies.</span></div></div>
        </header>
        <RfqForm initialProduct={value("product")} initialProject={value("project")} initialScope={value("scope")} />
      </div>
    </>
  );
}
