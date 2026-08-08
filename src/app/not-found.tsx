import type { Metadata } from "next";
import { Search } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  alternates: { canonical: "/404" },
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="not-found container">
      <p className="ui-label">404 / page not found</p>
      <h1>The requested furniture page is not here.</h1>
      <p>Return to the furniture catalog, search the site, or start a custom request for a room-specific piece.</p>
      <div className="button-row"><Link className="button button--dark" href="/products">Browse furniture</Link><Link className="button button--outline-dark" href="/search"><Search aria-hidden="true" size={17} />Search TIDEFORM</Link><Link className="button button--green" href="/rfq">Start a custom project</Link></div>
    </div>
  );
}
