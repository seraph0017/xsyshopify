// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { products } from "@/lib/catalog";

import { ProductCard } from "./product-card";

describe("ProductCard", () => {
  it("shows finish names so color is not the only identifier", () => {
    render(<ProductCard product={products[0]} />);
    expect(screen.getByText("Ocean Green · Graphite · Cool Gray · Burgundy · Arctic White")).toBeVisible();
  });

  it("loads the first row of product images eagerly and later cards lazily", () => {
    const { rerender } = render(<ProductCard product={products[0]} position={1} />);
    expect(screen.getByRole("img", { name: products[0].imageAlt })).toHaveAttribute("loading", "eager");

    rerender(<ProductCard product={products[1]} position={2} />);
    expect(screen.getByRole("img", { name: products[1].imageAlt })).toHaveAttribute("loading", "eager");

    rerender(<ProductCard product={products[4]} position={5} />);
    expect(screen.getByRole("img", { name: products[4].imageAlt })).toHaveAttribute("loading", "lazy");
  });
});
