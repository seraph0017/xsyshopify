"use client";

import { Menu, Search, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { useCart } from "@/components/cart/cart-provider";

const navigation = [
  { href: "/products", label: "Furniture" },
  { href: "/collections/living", label: "Collections" },
  { href: "/materials", label: "Materials" },
  { href: "/custom-projects", label: "Custom Projects" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner container-wide">
          <Link className="wordmark" href="/" aria-label="TIDEFORM home">TIDEFORM</Link>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navigation.map((item) => <Link className={pathname.startsWith(item.href) ? "is-active" : ""} href={item.href} key={item.href}>{item.label}</Link>)}
          </nav>
          <div className="header-actions">
            <button className="icon-button icon-button--dark" onClick={() => setSearchOpen((current) => !current)} aria-expanded={searchOpen} aria-controls="header-search" aria-label={searchOpen ? "Close search" : "Search"}>{searchOpen ? <X aria-hidden="true" /> : <Search aria-hidden="true" />}</button>
            <button className="icon-button icon-button--dark cart-button" onClick={openCart} aria-label={`Cart with ${count} ${count === 1 ? "item" : "items"}`}><ShoppingCart aria-hidden="true" /><span>{count}</span></button>
            <Link className="button button--outline-light desktop-rfq" href="/rfq">Request a Quote</Link>
            <button className="icon-button icon-button--dark mobile-menu-button" onClick={() => setMenuOpen((current) => !current)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label="Toggle navigation">{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
          </div>
        </div>
        {searchOpen ? <div id="header-search" className="header-search is-open">
          <form className="container" onSubmit={submitSearch} role="search">
            <Search aria-hidden="true" />
            <label className="sr-only" htmlFor="site-search">Search products and resources</label>
            <input ref={searchInputRef} id="site-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search consoles, shelving, materials..." autoComplete="off" />
            <button className="button button--green" type="submit">Search</button>
          </form>
        </div> : null}
        {menuOpen ? <nav id="mobile-navigation" className="mobile-nav is-open" aria-label="Mobile navigation">
          {navigation.map((item) => <Link href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
          <Link href="/rfq" onClick={() => setMenuOpen(false)}>Request a Quote</Link>
        </nav> : null}
      </header>
    </>
  );
}
