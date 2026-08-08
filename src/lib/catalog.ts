import type { ProductEvidence } from "./seo";

export type TransactionMode = "purchase" | "rfq";
export type ProductCategory = "console" | "sideboard" | "media" | "shelving" | "table" | "bench";
export type WidthBand = "up-to-48" | "48-to-72" | "72-plus";
export type PanelFinish = "ocean-green" | "graphite" | "cool-gray" | "burgundy" | "arctic-white";

export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductOption = {
  label: string;
  unitPrice?: number;
};

export type FinishOption = {
  value: PanelFinish;
  label: string;
  color: string;
};

export const panelFinishOptions: FinishOption[] = [
  { value: "ocean-green", label: "Ocean Green", color: "#234a3b" },
  { value: "graphite", label: "Graphite", color: "#3e4143" },
  { value: "cool-gray", label: "Cool Gray", color: "#a8abad" },
  { value: "burgundy", label: "Burgundy", color: "#6f1f29" },
  { value: "arctic-white", label: "Arctic White", color: "#f4f4f1" },
];

export type Product = {
  handle: string;
  name: string;
  partNumber: string;
  shortDescription: string;
  description: string;
  category: ProductCategory;
  widthBand: WidthBand;
  dimensions: { width: number; depth: number; height: number; display: string };
  panelFinishes: PanelFinish[];
  frameFinish: "brushed-aluminum";
  availability: "standard-configuration" | "custom-review";
  transactionMode: TransactionMode;
  dataStatus: "engineering-preview";
  evidence: ProductEvidence;
  previewPrice?: number;
  priceUnit?: string;
  image: string;
  imageAlt: string;
  options: ProductOption[];
  specs: ProductSpec[];
  compatibility: string;
  logisticsBoundary: string;
  featured?: boolean;
};

const commonFinishes: PanelFinish[] = ["ocean-green", "graphite", "cool-gray", "burgundy", "arctic-white"];

export const products: Product[] = [
  {
    handle: "skiff-console",
    name: "Skiff Console",
    partNumber: "TF-CON-48",
    shortDescription: "A narrow console with an open lower shelf and a clear aluminum frame.",
    description: "An entry or living-room console shaped by a brushed aluminum frame and matte panel surfaces. Standard sizes demonstrate the ecommerce path; other dimensions and colors route to a custom project.",
    category: "console",
    widthBand: "up-to-48",
    dimensions: { width: 48, depth: 16, height: 30, display: '48" W x 16" D x 30" H' },
    panelFinishes: commonFinishes,
    frameFinish: "brushed-aluminum",
    availability: "standard-configuration",
    transactionMode: "purchase",
    dataStatus: "engineering-preview",
    evidence: { status: "prototype" },
    previewPrice: 1295,
    priceUnit: "prototype price",
    image: "/images/furniture/products/skiff-console.png",
    imageAlt: "Skiff console with a brushed silver aluminum frame and dark green panel surfaces",
    options: [{ label: "48 in", unitPrice: 1295 }, { label: "60 in", unitPrice: 1495 }],
    specs: [
      { label: "Standard dimensions", value: '48" W x 16" D x 30" H' },
      { label: "Frame", value: "Brushed aluminum frame" },
      { label: "Panel", value: "Marine-grade panel; substrate confirmation pending" },
      { label: "Assembly", value: "Production method and packaging pending" },
    ],
    compatibility: "Finish chips, panel composition, hardware, and final dimensions require supplier confirmation before production release.",
    logisticsBoundary: "Prototype price excludes verified inventory, shipping, taxes, assembly service, and delivery access review.",
    featured: true,
  },
  {
    handle: "haven-sideboard",
    name: "Haven Sideboard",
    partNumber: "TF-SID-72",
    shortDescription: "Three closed bays bring calm storage to living and dining spaces.",
    description: "A low sideboard with three panel-fronted compartments inside a precise aluminum frame. The standard piece is prepared for ecommerce; adjusted storage layouts and project colors use RFQ.",
    category: "sideboard",
    widthBand: "48-to-72",
    dimensions: { width: 72, depth: 18, height: 30, display: '72" W x 18" D x 30" H' },
    panelFinishes: commonFinishes,
    frameFinish: "brushed-aluminum",
    availability: "standard-configuration",
    transactionMode: "purchase",
    dataStatus: "engineering-preview",
    evidence: { status: "prototype" },
    previewPrice: 2395,
    priceUnit: "prototype price",
    image: "/images/furniture/products/haven-sideboard.png",
    imageAlt: "Haven sideboard with three ocean-green doors and a brushed aluminum frame",
    options: [{ label: "72 in", unitPrice: 2395 }, { label: "84 in", unitPrice: 2695 }],
    specs: [
      { label: "Standard dimensions", value: '72" W x 18" D x 30" H' },
      { label: "Frame", value: "Brushed aluminum frame" },
      { label: "Panel", value: "Marine-grade panel; substrate confirmation pending" },
      { label: "Storage", value: "Three closed bays; shelf and hinge details pending" },
    ],
    compatibility: "Door hardware, shelf layout, panel composition, and finish samples require production confirmation.",
    logisticsBoundary: "Delivery method, packaging, installation clearance, and regional availability remain project dependencies.",
    featured: true,
  },
  {
    handle: "cove-media-console",
    name: "Cove Media Console",
    partNumber: "TF-MED-72",
    shortDescription: "Low media storage with closed ends and an open equipment bay.",
    description: "A long, low media piece combining panel-fronted storage with an open center bay. Cable routing and equipment clearances are confirmed for each final configuration.",
    category: "media",
    widthBand: "48-to-72",
    dimensions: { width: 72, depth: 18, height: 20, display: '72" W x 18" D x 20" H' },
    panelFinishes: commonFinishes,
    frameFinish: "brushed-aluminum",
    availability: "standard-configuration",
    transactionMode: "purchase",
    dataStatus: "engineering-preview",
    evidence: { status: "prototype" },
    previewPrice: 1995,
    priceUnit: "prototype price",
    image: "/images/furniture/products/cove-media-console.png",
    imageAlt: "Cove media console with graphite panels and a brushed aluminum frame",
    options: [{ label: "72 in", unitPrice: 1995 }, { label: "84 in", unitPrice: 2295 }],
    specs: [
      { label: "Standard dimensions", value: '72" W x 18" D x 20" H' },
      { label: "Frame", value: "Brushed aluminum frame" },
      { label: "Panel", value: "Marine-grade panel; substrate confirmation pending" },
      { label: "Equipment bay", value: "Final opening and cable details pending" },
    ],
    compatibility: "Confirm equipment dimensions, ventilation, cable path, panel finish, and hardware before ordering production furniture.",
    logisticsBoundary: "Prototype price excludes verified freight, room-of-choice delivery, installation, and returns policy.",
    featured: true,
  },
  {
    handle: "pier-open-shelving",
    name: "Pier Open Shelving",
    partNumber: "TF-SHE-36",
    shortDescription: "Four open panel shelves held in a slender aluminum frame.",
    description: "An upright open shelf for books, objects, and everyday storage. The standard height demonstrates purchase flow; wall anchoring and project-specific layouts require final review.",
    category: "shelving",
    widthBand: "up-to-48",
    dimensions: { width: 36, depth: 18, height: 72, display: '36" W x 18" D x 72" H' },
    panelFinishes: commonFinishes,
    frameFinish: "brushed-aluminum",
    availability: "standard-configuration",
    transactionMode: "purchase",
    dataStatus: "engineering-preview",
    evidence: { status: "prototype" },
    previewPrice: 1895,
    priceUnit: "prototype price",
    image: "/images/furniture/products/pier-shelving.png",
    imageAlt: "Pier open shelving with burgundy panels and a brushed aluminum frame",
    options: [{ label: "36 in", unitPrice: 1895 }, { label: "48 in", unitPrice: 2195 }],
    specs: [
      { label: "Standard dimensions", value: '36" W x 18" D x 72" H' },
      { label: "Frame", value: "Brushed aluminum frame" },
      { label: "Panel", value: "Marine-grade panel; substrate confirmation pending" },
      { label: "Anchoring", value: "Wall-restraint method pending site and supplier review" },
    ],
    compatibility: "Final shelf spacing, anchoring, load guidance, and panel construction require supplier confirmation.",
    logisticsBoundary: "Tall-furniture delivery, assembly, anchoring, and site access are not included in prototype terms.",
    featured: true,
  },
  {
    handle: "wayfinder-work-table",
    name: "Wayfinder Work Table",
    partNumber: "TF-TAB-CUSTOM",
    shortDescription: "A configurable work surface for studios, offices, and project rooms.",
    description: "A generous panel work surface on an open aluminum frame. Dimensions, cable needs, finish, quantity, access, and intended use are collected before project pricing.",
    category: "table",
    widthBand: "48-to-72",
    dimensions: { width: 60, depth: 30, height: 29, display: 'Starting at 60" W x 30" D x 29" H' },
    panelFinishes: commonFinishes,
    frameFinish: "brushed-aluminum",
    availability: "custom-review",
    transactionMode: "rfq",
    dataStatus: "engineering-preview",
    evidence: { status: "prototype" },
    image: "/images/furniture/products/wayfinder-work-table.png",
    imageAlt: "Wayfinder work table with a graphite panel top and brushed aluminum frame",
    options: [{ label: "Standard work table" }, { label: "Shared studio table" }, { label: "Project configuration" }],
    specs: [
      { label: "Starting dimensions", value: '60" W x 30" D x 29" H' },
      { label: "Frame", value: "Brushed aluminum frame" },
      { label: "Panel", value: "Marine-grade panel; substrate confirmation pending" },
      { label: "Configuration", value: "Dimensions and project needs confirmed by quote" },
    ],
    compatibility: "Ergonomics, intended equipment, cable routing, support, and site requirements are reviewed during quoting.",
    logisticsBoundary: "All configurations require project pricing, packaging, destination, and delivery-access review.",
  },
  {
    handle: "drift-bench",
    name: "Drift Bench",
    partNumber: "TF-BEN-60",
    shortDescription: "A long bench with an open shelf for entryways and shared spaces.",
    description: "A simple panel seat and lower shelf held by a clear aluminum frame. Standard sizes demonstrate ecommerce; upholstery, special lengths, and project quantities use RFQ.",
    category: "bench",
    widthBand: "48-to-72",
    dimensions: { width: 60, depth: 16, height: 18, display: '60" W x 16" D x 18" H' },
    panelFinishes: commonFinishes,
    frameFinish: "brushed-aluminum",
    availability: "standard-configuration",
    transactionMode: "purchase",
    dataStatus: "engineering-preview",
    evidence: { status: "prototype" },
    previewPrice: 895,
    priceUnit: "prototype price",
    image: "/images/furniture/products/drift-bench.png",
    imageAlt: "Drift bench with arctic-white panels and a brushed aluminum frame",
    options: [{ label: "60 in", unitPrice: 895 }, { label: "72 in", unitPrice: 1095 }],
    specs: [
      { label: "Standard dimensions", value: '60" W x 16" D x 18" H' },
      { label: "Frame", value: "Brushed aluminum frame" },
      { label: "Panel", value: "Marine-grade panel; substrate confirmation pending" },
      { label: "Use", value: "Final seating guidance and load data pending" },
    ],
    compatibility: "Seat use, load guidance, panel composition, hardware, and finish samples require supplier verification.",
    logisticsBoundary: "Prototype price excludes verified stock, shipping, installation, and commercial-use suitability.",
  },
];

export type CatalogFilters = {
  query?: string;
  category?: ProductCategory;
  width?: WidthBand;
  panelFinish?: PanelFinish;
  frameFinish?: Product["frameFinish"];
  availability?: Product["availability"];
  transactionMode?: TransactionMode;
};

export type CatalogQueryParams = Record<string, string | string[] | undefined>;

const categoryValues = new Set<ProductCategory>(["console", "sideboard", "media", "shelving", "table", "bench"]);
const widthValues = new Set<WidthBand>(["up-to-48", "48-to-72", "72-plus"]);
const panelFinishValues = new Set<PanelFinish>(panelFinishOptions.map((finish) => finish.value));
const frameFinishValues = new Set<Product["frameFinish"]>(["brushed-aluminum"]);
const availabilityValues = new Set<Product["availability"]>(["standard-configuration", "custom-review"]);
const modeValues = new Set<TransactionMode>(["purchase", "rfq"]);

export function parseCatalogFilters(params: CatalogQueryParams): CatalogFilters {
  const value = (key: string) => typeof params[key] === "string" ? params[key].trim() : "";
  const filters: CatalogFilters = {};
  const query = value("q");
  const category = value("category") as ProductCategory;
  const width = value("width") as WidthBand;
  const panelFinish = value("panel") as PanelFinish;
  const frameFinish = value("frame") as Product["frameFinish"];
  const availability = value("availability") as Product["availability"];
  const transactionMode = value("mode") as TransactionMode;

  if (query) filters.query = query;
  if (categoryValues.has(category)) filters.category = category;
  if (widthValues.has(width)) filters.width = width;
  if (panelFinishValues.has(panelFinish)) filters.panelFinish = panelFinish;
  if (frameFinishValues.has(frameFinish)) filters.frameFinish = frameFinish;
  if (availabilityValues.has(availability)) filters.availability = availability;
  if (modeValues.has(transactionMode)) filters.transactionMode = transactionMode;
  return filters;
}

export function hasActiveCatalogFilters(params: CatalogQueryParams): boolean {
  const trackingKeys = new Set(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "msclkid"]);
  return Object.entries(params).some(([key, value]) => !trackingKeys.has(key) && value !== undefined && value !== "");
}

export function filterCatalog(items: Product[], filters: CatalogFilters): Product[] {
  const query = filters.query?.trim().toLowerCase();
  return items.filter((product) => {
    const haystack = `${product.name} ${product.partNumber} ${product.shortDescription} ${product.category}`.toLowerCase();
    return (!query || haystack.includes(query))
      && (!filters.category || product.category === filters.category)
      && (!filters.width || product.widthBand === filters.width)
      && (!filters.panelFinish || product.panelFinishes.includes(filters.panelFinish))
      && (!filters.frameFinish || product.frameFinish === filters.frameFinish)
      && (!filters.availability || product.availability === filters.availability)
      && (!filters.transactionMode || product.transactionMode === filters.transactionMode);
  });
}

export function getProductByHandle(handle: string): Product | undefined {
  return products.find((product) => product.handle === handle);
}

export function getProductOptionPrice(product: Product, label: string): number | undefined {
  return product.options.find((option) => option.label === label)?.unitPrice;
}

export function getPanelFinish(value: PanelFinish): FinishOption {
  return panelFinishOptions.find((finish) => finish.value === value) ?? panelFinishOptions[0];
}

export const productCategories: Array<{ value: ProductCategory; label: string }> = [
  { value: "console", label: "Consoles" },
  { value: "sideboard", label: "Sideboards" },
  { value: "media", label: "Media Consoles" },
  { value: "shelving", label: "Shelving" },
  { value: "table", label: "Work Tables" },
  { value: "bench", label: "Benches" },
];
