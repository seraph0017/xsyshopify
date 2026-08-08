import Image from "next/image";
import Link from "next/link";

export function HomeHero() {
  return (
    <section className="home-hero">
      <div className="home-hero__copy">
        <div>
          <h1>Furniture built from frame and panel.</h1>
          <p>Modular storage, tables, and shelving made with an aluminum frame and marine-grade panel surfaces.</p>
          <div className="button-row">
            <Link className="button button--green" href="/products">Shop furniture</Link>
            <Link className="button button--outline-dark" href="/custom-projects">Customize a piece</Link>
          </div>
        </div>
      </div>
      <div className="home-hero__media">
        <Image className="home-hero__image" src="/images/furniture/lifestyle/hero-sideboard.png" alt="Ocean-green sideboard with a brushed aluminum frame in a bright living room" fill priority sizes="(max-width: 840px) 100vw, 58vw" />
      </div>
    </section>
  );
}
