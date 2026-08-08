"use client";

import { Download } from "lucide-react";

import { trackEvent } from "@/lib/analytics";

export function TrackedDownload({ href, name, meta }: { href: string; name: string; meta: string }) {
  return (
    <a className="download-link" href={href} download onClick={() => trackEvent("resource_download", { resource_name: name, resource_url: href })}>
      <span><strong>{name}</strong><small>{meta}</small></span><Download aria-hidden="true" />
    </a>
  );
}
