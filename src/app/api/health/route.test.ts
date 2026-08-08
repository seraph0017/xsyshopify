import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns a minimal non-cacheable health response", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(body).toEqual({ status: "ok" });
    expect(JSON.stringify(body)).not.toMatch(/hostname|version|environment|dependency/i);
  });
});
