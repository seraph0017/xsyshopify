// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/components/cart/cart-provider", () => ({ useCart: () => ({ count: 0, openCart: vi.fn() }) }));

describe("SiteHeader", () => {
  it("presents furniture-first navigation and branding", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "TIDEFORM home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Furniture" })).toHaveAttribute("href", "/products");
    expect(screen.getByRole("link", { name: "Materials" })).toHaveAttribute("href", "/materials");
    expect(screen.getByRole("link", { name: "Custom Projects" })).toHaveAttribute("href", "/custom-projects");
  });

  it("focuses search on open, removes it on close, and restores the opener", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);
    const opener = screen.getByRole("button", { name: "Search" });
    expect(screen.queryByRole("textbox", { name: /search products/i })).not.toBeInTheDocument();
    await user.click(opener);
    expect(screen.getByRole("textbox", { name: /search products/i })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Close search" }));
    expect(screen.queryByRole("textbox", { name: /search products/i })).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("does not render mobile navigation links while the menu is closed", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);
    expect(screen.queryByRole("navigation", { name: /mobile/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /toggle navigation/i }));
    expect(screen.getByRole("navigation", { name: /mobile/i })).toBeInTheDocument();
  });
});
