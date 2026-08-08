import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function ApplicationBand() {
  return (
    <section className="application-band">
      <div className="application-band__image">
        <Image src="/images/furniture/lifestyle/hero-sideboard.png" alt="Ocean-green sideboard bringing low storage to a bright living room" fill sizes="(max-width: 800px) 100vw, 58vw" />
      </div>
      <div className="application-band__copy">
        <h2>Storage that reads as part of the room.</h2>
        <p>Long horizontal lines, quiet panel color, and a visible aluminum frame keep the piece visually open while giving everyday objects a defined place.</p>
        <Link className="text-link text-link--light" href="/collections/living">Explore the living collection<ArrowRight aria-hidden="true" size={18} /></Link>
      </div>
    </section>
  );
}
