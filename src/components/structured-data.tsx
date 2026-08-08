import { isEvidencePublishable, shouldEmitEntitySchema, type ContentEvidence, type ProductEvidence, type SiteEnvironment, type SiteIdentityEvidence, siteIdentityEvidence } from "@/lib/seo";

type SchemaRecord = Record<string, unknown> | null;
type StructuredDataProps = {
  data: SchemaRecord | SchemaRecord[];
  evidence?: SiteIdentityEvidence | ProductEvidence | ContentEvidence;
  env?: SiteEnvironment;
  siteIdentity?: SiteIdentityEvidence;
};

export function StructuredData({ data, evidence = { status: "prototype" }, env = process.env, siteIdentity = siteIdentityEvidence }: StructuredDataProps) {
  if (!shouldEmitEntitySchema(env, siteIdentity) || !isEvidencePublishable(evidence)) return null;
  const records = (Array.isArray(data) ? data : [data]).filter((record): record is Record<string, unknown> => record !== null);
  if (!records.length) return null;
  const payload = Array.isArray(data) ? records : records[0];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replaceAll("<", "\\u003c") }}
    />
  );
}
