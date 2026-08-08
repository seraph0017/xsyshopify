import { ArrowUpRight, BookOpen, Ruler, Wrench } from "lucide-react";
import Link from "next/link";

const resources = [
  { title: "Measure your space", text: "Capture room, wall, access-path, and clearance dimensions before choosing a piece.", href: "/resources/measuring-for-furniture", icon: Ruler },
  { title: "Care for frame and panel", text: "Keep finish-specific care instructions tied to confirmed production materials.", href: "/resources", icon: BookOpen },
  { title: "Plan assembly and access", text: "Check package path, room access, leveling, and anchoring needs before delivery.", href: "/resources", icon: Wrench },
];

export function ResourcesPreview() {
  return (
    <section className="section resource-preview">
      <div className="container">
        <div className="section-heading"><div><h2>Plan the piece before it reaches the room.</h2><p>Measuring, access, assembly, and care guidance stay readable in HTML and explicit about details still awaiting production confirmation.</p></div></div>
        <div className="resource-list">
          {resources.map(({ title, text, href, icon: Icon }) => (
            <Link href={href} key={title}>
              <Icon aria-hidden="true" />
              <span><strong>{title}</strong><small>{text}</small></span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
