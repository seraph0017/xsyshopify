// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { checkoutAnalyticsEvent, filePreviewAnalyticsEvent, rfqSubmissionAnalyticsEvent, searchAnalyticsDetail, trackEvent } from "./analytics";

describe("analytics production semantics", () => {
  it("uses a diagnostic checkout event until a valid Shopify checkout URL exists", () => {
    expect(checkoutAnalyticsEvent({ value: 42.5 })).toEqual({ name: "checkout_preview_diagnostic", detail: { value: 42.5, reason: "shopify_checkout_not_connected" } });
    expect(checkoutAnalyticsEvent({ value: 42.5, checkoutUrl: "https://example.myshopify.com/checkouts/token" }).name).toBe("begin_checkout");
  });

  it("uses preview RFQ semantics until the backend confirms persistence and omits references", () => {
    const preview = rfqSubmissionAnalyticsEvent({ persisted: false, projectType: "sideboard", panelFinish: "ocean-green", quantity: 3, country: "United States", fileCount: 2, reference: "TF-PRIVATE" });
    expect(preview).toEqual({ name: "rfq_preview_submit", detail: { project_type: "sideboard", panel_finish: "ocean-green", quantity_bucket: "2_to_5", country: "United States", file_count: 2, persisted: false } });
    expect(JSON.stringify(preview)).not.toContain("TF-PRIVATE");
    expect(rfqSubmissionAnalyticsEvent({ persisted: true, projectType: "sideboard", panelFinish: "graphite", quantity: 1, country: "Canada", fileCount: 0, referenceHash: "HASH" }).name).toBe("rfq_submit");
  });

  it("allowlists file extensions and reports only count and size buckets with preview semantics", () => {
    expect(filePreviewAnalyticsEvent([
      { name: "room.PNG", size: 500_000 },
      { name: "notes.exe", size: 3_000 },
      { name: "layout.pdf", size: 12_000_000 },
    ])).toEqual({
      name: "file_upload_preview",
      detail: { file_count: 3, extension_group: ["image", "other", "document"], total_size_bucket: "10_to_25mb" },
    });
  });

  it("dispatches analytics through the current furniture brand namespace", () => {
    let received: Event | undefined;
    window.addEventListener("tideform:analytics", (event) => { received = event; }, { once: true });
    trackEvent("search", { search_term: "sideboard" });
    expect(received).toBeInstanceOf(CustomEvent);
  });

  it("normalizes safe searches and redacts likely personal data", () => {
    expect(searchAnalyticsDetail("  Green   Sideboard ", 2)).toEqual({ search_term_normalized: "green sideboard", result_count: 2 });
    expect(searchAnalyticsDetail("alex@example.com", 0)).toEqual({ search_term_normalized: "redacted", result_count: 0 });
    expect(searchAnalyticsDetail("https://example.com/private-room", 0)).toEqual({ search_term_normalized: "redacted", result_count: 0 });
  });
});
