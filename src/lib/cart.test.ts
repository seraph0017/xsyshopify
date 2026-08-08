import { describe, expect, it } from "vitest";

import { cartItemCount, cartSubtotal, setLineQuantity, type CartLine } from "./cart";
import { getProductByHandle, getProductOptionPrice } from "./catalog";

const lines: CartLine[] = [
  { id: "skiff:standard:ocean", productHandle: "skiff-console", title: "Skiff Console", option: "48 in / Ocean Green", size: "48 in", panelFinish: "Ocean Green", unitPrice: 1295, quantity: 2 },
  { id: "drift:standard:white", productHandle: "drift-bench", title: "Drift Bench", option: "60 in / Arctic White", size: "60 in", panelFinish: "Arctic White", unitPrice: 895, quantity: 1 },
];

describe("cart helpers", () => {
  it("calculates item count and subtotal without floating point drift", () => {
    expect(cartItemCount(lines)).toBe(3);
    expect(cartSubtotal(lines)).toBe(3485);
  });

  it("updates quantities and removes lines at zero", () => {
    expect(setLineQuantity(lines, lines[0].id, 4)[0].quantity).toBe(4);
    expect(setLineQuantity(lines, lines[0].id, 0)).toHaveLength(1);
  });

  it("prices standard furniture configurations as distinct line values", () => {
    const console = getProductByHandle("skiff-console")!;
    expect(getProductOptionPrice(console, "48 in")).toBe(1295);
    expect(getProductOptionPrice(console, "60 in")).toBe(1495);
    expect(cartSubtotal([
      { id: "48", productHandle: console.handle, title: console.name, option: "48 in / Ocean Green", size: "48 in", panelFinish: "Ocean Green", unitPrice: getProductOptionPrice(console, "48 in")!, quantity: 1 },
      { id: "60", productHandle: console.handle, title: console.name, option: "60 in / Graphite", size: "60 in", panelFinish: "Graphite", unitPrice: getProductOptionPrice(console, "60 in")!, quantity: 1 },
    ])).toBe(2790);
  });
});
