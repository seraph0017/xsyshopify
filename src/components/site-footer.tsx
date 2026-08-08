import Link from "next/link";

const groups = [
  { title: "Furniture", links: [["All furniture", "/products"], ["Living collection", "/collections/living"], ["Materials", "/materials"], ["Custom projects", "/custom-projects"]] },
  { title: "Support", links: [["Care & assembly", "/resources"], ["Measuring guide", "/resources/measuring-for-furniture"], ["Request a quote", "/rfq"], ["Search", "/search"]] },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="footer-brand">
          <Link className="wordmark" href="/">TIDEFORM</Link>
          <p>Furniture shaped by brushed aluminum frames and marine-grade panel surfaces.</p>
          <span>Prototype catalog. Material, product, and business verification pending.</span>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <h2>{group.title}</h2>
            <ul>{group.links.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>
          </div>
        ))}
        <div>
          <h2>Before launch</h2>
          <ul className="muted-links">
            <li>Company - verification pending</li>
            <li>Contact - verification pending</li>
            <li>Shipping & returns - verification pending</li>
            <li>Privacy & terms - legal review pending</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom"><span>TIDEFORM prototype</span><span>Standard furniture + custom projects</span></div>
    </footer>
  );
}
