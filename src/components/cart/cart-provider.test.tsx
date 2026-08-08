// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CartProvider, useCart } from "./cart-provider";

function CartOpener() {
  const { openCart } = useCart();
  return <button type="button" onClick={openCart}>Open test cart</button>;
}

function CartAdder() {
  const { addLine } = useCart();
  return <button type="button" onClick={() => addLine({ id: "skiff:48:green", productHandle: "skiff-console", title: "Skiff Console", option: "48 in / Ocean Green", size: "48 in", panelFinish: "Ocean Green", unitPrice: 1295, quantity: 1 })}>Add test line</button>;
}

describe("CartProvider", () => {
  it("opens a native modal dialog and restores focus to its opener on close", async () => {
    const user = userEvent.setup();
    render(<CartProvider><CartOpener /></CartProvider>);
    const opener = screen.getByRole("button", { name: "Open test cart" });
    await user.click(opener);
    const dialog = screen.getByRole("dialog", { name: /your cart/i });
    expect(dialog.tagName).toBe("DIALOG");
    expect(dialog).toHaveAttribute("open");
    await user.click(screen.getByRole("button", { name: "Close cart" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("restores focus to the product action when adding a line opens the cart", async () => {
    const user = userEvent.setup();
    render(<CartProvider><CartAdder /></CartProvider>);
    const opener = screen.getByRole("button", { name: "Add test line" });
    await user.click(opener);
    await user.click(screen.getByRole("button", { name: "Close cart" }));
    expect(opener).toHaveFocus();
  });
});
