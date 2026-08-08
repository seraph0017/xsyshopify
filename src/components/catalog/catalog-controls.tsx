"use client";

import { Filter, RotateCcw, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore, type FormEvent } from "react";

type CatalogControlsProps = {
  resultCount: number;
};

export function CatalogControls({ resultCount }: CatalogControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [queryDraft, setQueryDraft] = useState({ source: urlQuery, value: urlQuery });
  const query = queryDraft.source === urlQuery ? queryDraft.value : urlQuery;
  const isMobile = useSyncExternalStore(subscribeMobile, getMobileSnapshot, getServerMobileSnapshot);
  const [filtersOpen, setFiltersOpen] = useState(false);

  function update(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    router.push(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update("q", query.trim());
  }

  return (
    <aside className="catalog-controls" aria-label="Catalog filters">
      <button className="catalog-filter-toggle" type="button" aria-expanded={filtersOpen} aria-controls="catalog-filter-fields" onClick={() => setFiltersOpen((current) => !current)}><Filter aria-hidden="true" size={17} />Filters</button>
      <form className="catalog-search" onSubmit={submit} role="search">
        <label htmlFor="catalog-query">Search catalog</label>
        <div><Search aria-hidden="true" size={17} /><input id="catalog-query" name="q" value={query} onChange={(event) => setQueryDraft({ source: urlQuery, value: event.target.value })} placeholder="Console, shelf, table..." /></div>
      </form>
      {!isMobile || filtersOpen ? <div id="catalog-filter-fields" className="catalog-filter-fields">
        <FilterSelect id="category" label="Furniture type" value={searchParams.get("category") ?? ""} onChange={(value) => update("category", value)} options={[["", "All furniture"], ["console", "Consoles"], ["sideboard", "Sideboards"], ["media", "Media consoles"], ["shelving", "Shelving"], ["table", "Work tables"], ["bench", "Benches"]]} />
        <FilterSelect id="width" label="Width" value={searchParams.get("width") ?? ""} onChange={(value) => update("width", value)} options={[["", "All widths"], ["up-to-48", "Up to 48 in"], ["48-to-72", "48 to 72 in"], ["72-plus", "72 in and up"]]} />
        <FilterSelect id="panel" label="Panel finish" value={searchParams.get("panel") ?? ""} onChange={(value) => update("panel", value)} options={[["", "All panel finishes"], ["ocean-green", "Ocean Green"], ["graphite", "Graphite"], ["cool-gray", "Cool Gray"], ["burgundy", "Burgundy"], ["arctic-white", "Arctic White"]]} />
        <FilterSelect id="frame" label="Frame finish" value={searchParams.get("frame") ?? ""} onChange={(value) => update("frame", value)} options={[["", "All frame finishes"], ["brushed-aluminum", "Brushed Aluminum"]]} />
        <FilterSelect id="availability" label="Catalog status" value={searchParams.get("availability") ?? ""} onChange={(value) => update("availability", value)} options={[["", "All catalog statuses"], ["standard-configuration", "Standard configuration"], ["custom-review", "Custom review"]]} />
        <FilterSelect id="mode" label="Order path" value={searchParams.get("mode") ?? ""} onChange={(value) => update("mode", value)} options={[["", "All order paths"], ["purchase", "Standard purchase"], ["rfq", "Custom project"]]} />
        <div className="catalog-controls__footer"><strong>{resultCount}</strong> results</div>
        <button className="reset-filters" onClick={() => router.push(pathname, { scroll: false })} type="button"><RotateCcw aria-hidden="true" size={15} />Clear all filters</button>
      </div> : null}
    </aside>
  );
}

function subscribeMobile(callback: () => void) {
  const media = window.matchMedia("(max-width: 700px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia("(max-width: 700px)").matches;
}

function getServerMobileSnapshot() {
  return false;
}

function FilterSelect({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return (
    <div className="filter-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => <option value={optionValue} key={optionValue || "all"}>{optionLabel}</option>)}
      </select>
    </div>
  );
}
