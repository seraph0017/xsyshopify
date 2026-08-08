export type AnalyticsEvent =
  | "view_item_list"
  | "select_item"
  | "view_item"
  | "select_furniture_option"
  | "view_custom_projects"
  | "view_guide"
  | "search"
  | "add_to_cart"
  | "view_cart"
  | "begin_checkout"
  | "checkout_preview_diagnostic"
  | "rfq_start"
  | "rfq_submit"
  | "rfq_preview_submit"
  | "file_upload_preview"
  | "resource_download";

export type AnalyticsEnvelope = { name: AnalyticsEvent; detail: Record<string, unknown> };

const allowedFileExtensions = new Set(["pdf", "png", "jpg", "jpeg", "zip"]);
const likelyPersonalData = /@|https?:\/\/|www\.|\b\+?\d[\d\s().-]{7,}\d\b/i;

export function searchAnalyticsDetail(query: string, resultCount: number) {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, " ");
  return {
    search_term_normalized: normalized.length > 64 || likelyPersonalData.test(normalized) ? "redacted" : normalized,
    result_count: Math.max(0, Math.trunc(resultCount)),
  };
}

export function checkoutAnalyticsEvent(input: { value: number; checkoutUrl?: string }): AnalyticsEnvelope {
  let productionCheckout = false;
  if (input.checkoutUrl) {
    try {
      const url = new URL(input.checkoutUrl);
      productionCheckout = url.protocol === "https:" && url.hostname.endsWith(".myshopify.com") && url.pathname.startsWith("/checkouts/");
    } catch {
      productionCheckout = false;
    }
  }
  return productionCheckout
    ? { name: "begin_checkout", detail: { value: input.value } }
    : { name: "checkout_preview_diagnostic", detail: { value: input.value, reason: "shopify_checkout_not_connected" } };
}

export function rfqSubmissionAnalyticsEvent(input: {
  persisted: boolean;
  projectType: string;
  panelFinish: string;
  quantity: number;
  country: string;
  fileCount: number;
  reference?: string;
  referenceHash?: string;
}): AnalyticsEnvelope {
  const quantityBucket = input.quantity <= 1 ? "1" : input.quantity <= 5 ? "2_to_5" : input.quantity <= 20 ? "6_to_20" : "21_plus";
  return {
    name: input.persisted ? "rfq_submit" : "rfq_preview_submit",
    detail: {
      ...(input.persisted && input.referenceHash ? { reference_hash: input.referenceHash } : {}),
      project_type: input.projectType,
      panel_finish: input.panelFinish,
      quantity_bucket: quantityBucket,
      country: input.country,
      file_count: input.fileCount,
      persisted: input.persisted,
    },
  };
}

function sizeBucket(size: number): string {
  if (size < 1024 * 1024) return "under_1mb";
  if (size < 10 * 1024 * 1024) return "1_to_10mb";
  return "10_to_25mb";
}

export function filePreviewAnalyticsEvent(files: Array<{ name: string; size: number }>): AnalyticsEnvelope {
  const extensionGroup = (name: string) => {
    const extension = name.toLowerCase().split(".").pop() ?? "";
    if (![...allowedFileExtensions].includes(extension)) return "other";
    if (["png", "jpg", "jpeg"].includes(extension)) return "image";
    if (extension === "pdf") return "document";
    return "archive";
  };
  return {
    name: "file_upload_preview",
    detail: {
      file_count: files.length,
      extension_group: files.map((file) => extensionGroup(file.name)),
      total_size_bucket: sizeBucket(files.reduce((total, file) => total + file.size, 0)),
    },
  };
}

export function trackEvent(name: AnalyticsEvent, detail: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("tideform:analytics", { detail: { name, ...detail } }));
}

export function trackAnalyticsEnvelope(event: AnalyticsEnvelope) {
  trackEvent(event.name, event.detail);
}
