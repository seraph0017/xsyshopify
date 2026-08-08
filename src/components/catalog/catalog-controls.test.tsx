// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CatalogControls } from "./catalog-controls";

const push = vi.fn();
let currentParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/products",
  useRouter: () => ({ push }),
  useSearchParams: () => currentParams,
}));

describe("CatalogControls", () => {
  beforeEach(() => {
    push.mockClear();
    currentParams = new URLSearchParams("q=console&utm_source=test");
  });

  it("keeps the controlled query synchronized with URL changes and can clear it", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<CatalogControls resultCount={2} />);
    const input = screen.getByRole("textbox", { name: /search catalog/i });
    expect(input).toHaveValue("console");

    currentParams = new URLSearchParams("q=sideboard&utm_source=test");
    rerender(<CatalogControls resultCount={1} />);
    expect(input).toHaveValue("sideboard");

    await user.clear(input);
    await user.keyboard("{Enter}");
    expect(push).toHaveBeenLastCalledWith("/products?utm_source=test", { scroll: false });
  });

  it("keeps mobile filters collapsed by default and expands them on command", async () => {
    Object.defineProperty(window, "matchMedia", { configurable: true, value: () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }) });
    const user = userEvent.setup();
    render(<CatalogControls resultCount={10} />);
    const toggle = screen.getByRole("button", { name: /^filters$/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByLabelText("Category")).not.toBeInTheDocument();
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText("Furniture type")).toBeInTheDocument();
    expect(screen.getByLabelText("Width")).toBeInTheDocument();
    expect(screen.getByLabelText("Panel finish")).toBeInTheDocument();
  });
});
