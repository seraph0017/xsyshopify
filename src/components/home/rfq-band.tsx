import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

export function RfqBand() {
  return (
    <section className="rfq-band">
      <div className="container rfq-band__inner">
        <div>
          <h2>Need the piece to fit a specific room?</h2>
          <p>Share the furniture type, dimensions, panel color, quantity, destination, and timing in one custom-project request.</p>
        </div>
        <ol>
          <li><Check aria-hidden="true" /> Choose a starting furniture type</li>
          <li><Check aria-hidden="true" /> Add dimensions, finish, and room access</li>
          <li><Check aria-hidden="true" /> Receive a project reference for review</li>
        </ol>
        <Link className="button button--light" href="/custom-projects">Start a custom project<ArrowRight aria-hidden="true" size={17} /></Link>
      </div>
    </section>
  );
}
