import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({ title, description, link }: { title: string; description?: string; link?: { href: string; label: string } }) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {link ? (
        <Link className="text-link" href={link.href}>
          {link.label}<ArrowRight aria-hidden="true" size={17} />
        </Link>
      ) : null}
    </div>
  );
}
