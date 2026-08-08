import { ArrowRight, Frame, Layers3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function ServicesPreview() {
  return (
    <section className="section section--white material-preview">
      <div className="container material-preview__grid">
        <div className="material-preview__media">
          <Image src="/images/furniture/lifestyle/material-detail.png" alt="Close view of a brushed aluminum furniture frame meeting a dark green panel" width={1024} height={1024} sizes="(max-width: 840px) 100vw, 48vw" />
        </div>
        <div className="material-preview__copy">
          <h2>Two materials. One clear structure.</h2>
          <p>The aluminum frame defines the furniture&apos;s rhythm. Matte panel surfaces make the top, shelves, sides, and doors usable and calm.</p>
          <div className="material-points">
            <div><Frame aria-hidden="true" /><span><strong>Aluminum frame</strong><small>Brushed silver finish shown throughout this prototype.</small></span></div>
            <div><Layers3 aria-hidden="true" /><span><strong>Marine-grade panel</strong><small>Exact substrate and production specifications remain supplier-confirmation items.</small></span></div>
          </div>
          <Link className="text-link" href="/materials">Materials and construction<ArrowRight aria-hidden="true" size={17} /></Link>
        </div>
      </div>
    </section>
  );
}
