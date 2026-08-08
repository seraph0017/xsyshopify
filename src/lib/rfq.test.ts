import { describe, expect, it } from "vitest";

import { createRfqReference, parseRfqInput, validateRfq, type RfqInput } from "./rfq";

const validInput: RfqInput = {
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
  files: [{ name: "living-room-plan.pdf", size: 1_048_576, type: "application/pdf" }],
};

describe("RFQ validation", () => {
  it("requires contact, destination, furniture type, dimensions, finish, scope, quantity, timeline, and consent", () => {
    const errors = validateRfq({ ...validInput, name: "", email: "bad", postalCode: "", projectType: "", dimensions: "", panelFinish: "", scope: "", quantity: 0, timeline: "", consent: false });
    expect(Object.keys(errors)).toEqual(expect.arrayContaining(["name", "email", "postalCode", "projectType", "dimensions", "panelFinish", "scope", "quantity", "timeline", "consent"]));
  });

  it("enforces furniture reference file count, extension, and size", () => {
    const errors = validateRfq({
      ...validInput,
      files: [
        ...validInput.files,
        { name: "one.exe", size: 1_000, type: "application/octet-stream" },
        { name: "two.pdf", size: 26 * 1024 * 1024, type: "application/pdf" },
        { name: "three.png", size: 1_000, type: "image/png" },
        { name: "four.jpg", size: 1_000, type: "image/jpeg" },
        { name: "five.zip", size: 1_000, type: "application/zip" },
      ],
    });
    expect(errors.files).toBeTruthy();
  });

  it("accepts a complete request and creates stable day-scoped references", () => {
    expect(validateRfq(validInput)).toEqual({});
    expect(createRfqReference(new Date("2026-08-08T12:00:00Z"), "A1B2C3")).toBe("TF-20260808-A1B2C3");
  });

  it.each([
    ["country", "Mars"],
    ["projectType", "arbitrary-project"],
    ["timeline", "yesterday"],
    ["quantity", 1.5],
    ["quantity", -42],
  ] as const)("rejects invalid %s business values", (field, value) => {
    expect(validateRfq({ ...validInput, [field]: value })).toHaveProperty(field);
  });

  it("enforces field lengths and accepts omitted files as an empty list", () => {
    expect(validateRfq({ ...validInput, scope: "x".repeat(4_001) })).toHaveProperty("scope");
    expect(validateRfq({ ...validInput, name: "x".repeat(101) })).toHaveProperty("name");
    const parsed = parseRfqInput({ ...validInput, files: undefined });
    expect(parsed.value.files).toEqual([]);
    expect(parsed.errors).toEqual({});
  });

  it("validates file name, MIME type, and nonnegative bounded size", () => {
    expect(validateRfq({ ...validInput, files: [{ name: "../room.pdf", type: "application/pdf", size: 10 }] })).toHaveProperty("files");
    expect(validateRfq({ ...validInput, files: [{ name: "room.pdf", type: "text/html", size: 10 }] })).toHaveProperty("files");
    expect(validateRfq({ ...validInput, files: [{ name: "room.pdf", type: "application/pdf", size: -1 }] })).toHaveProperty("files");
  });

  it("parses an unknown body without trusting its shape", () => {
    const parsed = parseRfqInput(null);
    expect(parsed.errors).toHaveProperty("name");
    expect(parsed.errors).toHaveProperty("email");
    expect(parsed.value.files).toEqual([]);
  });
});
