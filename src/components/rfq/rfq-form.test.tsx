// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RfqForm } from "./rfq-form";

describe("RfqForm", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => vi.restoreAllMocks());

  it("links field errors to invalid controls", async () => {
    const user = userEvent.setup();
    render(<RfqForm />);
    await user.click(screen.getByRole("button", { name: /submit custom project/i }));
    const name = screen.getByLabelText(/name/i);
    expect(name).toHaveAttribute("aria-describedby", "name-error");
    expect(name).toHaveFocus();
  });

  it("announces success, scrolls it into view, and focuses the success heading", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ reference: "TF-20260808-ABC123", persisted: false }), { status: 201 }));
    const user = userEvent.setup();
    render(<RfqForm initialProject="sideboard" initialScope="Three closed bays for a living room wall with cable access at the rear." />);
    await user.type(screen.getByLabelText(/^Name/), "Alex Morgan");
    await user.type(screen.getByLabelText(/Work email/), "alex@example.com");
    await user.type(screen.getByLabelText(/postal code/i), "48104");
    await user.type(screen.getByLabelText(/Target dimensions/), 'About 72" wide x 18" deep x 30" high');
    await user.selectOptions(screen.getByLabelText(/Panel finish/), "ocean-green");
    await user.selectOptions(screen.getByLabelText(/Target timeline/), "4-8-weeks");
    await user.click(screen.getByLabelText(/I confirm these project details/));
    await user.click(screen.getByRole("button", { name: /submit custom project/i }));

    const status = await screen.findByRole("status");
    const heading = screen.getByRole("heading", { name: /Reference TF-20260808-ABC123/ });
    expect(status).toHaveAttribute("aria-live", "polite");
    await waitFor(() => expect(heading).toHaveFocus());
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
