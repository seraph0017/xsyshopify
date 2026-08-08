import { describe, expect, it } from "vitest";

import { MAX_RFQ_BODY_BYTES } from "@/lib/rfq";

import { POST } from "./route";

const valid = {
  name: "Alex Morgan",
  email: "alex@example.com",
  company: "Fixture Lab",
  country: "United States",
  postalCode: "48104",
  projectType: "sideboard",
  dimensions: 'About 72" wide x 18" deep x 30" high',
  panelFinish: "ocean-green",
  scope: "Three closed bays for a living room wall with cable access at the rear.",
  quantity: 1,
  timeline: "4-8-weeks",
  consent: true,
};

function request(body: string, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/rfq", {
    method: "POST",
    body,
    headers: { "content-type": "application/json", ...headers },
  });
}

describe("POST /api/rfq", () => {
  it("returns 422 field errors for business validation failures", async () => {
    const response = await POST(request(JSON.stringify({ ...valid, country: "Mars", quantity: 1.5 })));
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ errors: { country: expect.any(String), quantity: expect.any(String) } });
  });

  it("returns 400 for malformed JSON", async () => {
    expect((await POST(request("{"))).status).toBe(400);
  });

  it("returns 413 before parsing an oversized declared body", async () => {
    const response = await POST(request("{}", { "content-length": String(MAX_RFQ_BODY_BYTES + 1) }));
    expect(response.status).toBe(413);
  });

  it("returns 413 when actual UTF-8 body bytes exceed the cap", async () => {
    const body = JSON.stringify({ ...valid, scope: "x".repeat(MAX_RFQ_BODY_BYTES) });
    const response = await POST(request(body));
    expect(response.status).toBe(413);
  });

  it("accepts a valid request without files and reports zero file metadata", async () => {
    const response = await POST(request(JSON.stringify(valid)));
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ persisted: false, fileMetadataCount: 0 });
  });
});
