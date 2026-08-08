// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RouteAnalytics } from "./route-analytics";

const { trackEvent } = vi.hoisted(() => ({ trackEvent: vi.fn() }));

vi.mock("@/lib/analytics", () => ({ trackEvent }));

describe("RouteAnalytics", () => {
  beforeEach(() => trackEvent.mockClear());

  it("sends once for the same route state and again after soft-navigation details change", () => {
    const { rerender } = render(<RouteAnalytics name="search" detail={{ search_term: "sideboard", result_count: 2 }} />);
    rerender(<RouteAnalytics name="search" detail={{ search_term: "sideboard", result_count: 2 }} />);
    rerender(<RouteAnalytics name="search" detail={{ search_term: "bench", result_count: 1 }} />);

    expect(trackEvent).toHaveBeenCalledTimes(2);
    expect(trackEvent).toHaveBeenNthCalledWith(1, "search", { search_term: "sideboard", result_count: 2 });
    expect(trackEvent).toHaveBeenNthCalledWith(2, "search", { search_term: "bench", result_count: 1 });
  });
});
