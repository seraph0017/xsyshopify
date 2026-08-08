// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { getProductByHandle } from "@/lib/catalog";

import { ProductPurchase } from "./product-purchase";

const addLine = vi.fn();
vi.mock("@/components/cart/cart-provider", () => ({ useCart: () => ({ addLine }) }));

describe("ProductPurchase", () => {
  it("adds the selected furniture size and panel finish as one distinct cart line", async () => {
    const user = userEvent.setup();
    render(<ProductPurchase product={getProductByHandle("skiff-console")!} />);
    await user.selectOptions(screen.getByLabelText("Size"), "60 in");
    await user.selectOptions(screen.getByLabelText("Panel finish"), "graphite");
    expect(screen.getByText("$1,495")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /add to cart/i }));
    expect(addLine).toHaveBeenCalledWith(expect.objectContaining({
      id: "skiff-console:60 in:graphite",
      option: "60 in / Graphite",
      unitPrice: 1495,
    }));
  });
});
