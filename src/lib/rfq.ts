export type RfqFile = { name: string; size: number; type: string };

export type RfqInput = {
  name: string;
  email: string;
  company: string;
  country: string;
  postalCode: string;
  projectType: string;
  dimensions: string;
  panelFinish: string;
  scope: string;
  quantity: number;
  timeline: string;
  consent: boolean;
  files: RfqFile[];
};

export type RfqErrors = Partial<Record<keyof RfqInput, string>>;
export const MAX_RFQ_BODY_BYTES = 64 * 1024;

const allowedExtensions = new Set(["pdf", "png", "jpg", "jpeg", "zip"]);
const allowedMimeTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/zip",
  "application/x-zip-compressed",
]);
const allowedCountries = new Set(["United States", "Canada"]);
const allowedProjectTypes = new Set(["console", "sideboard", "media-console", "shelving", "work-table", "bench", "collection", "other"]);
const allowedPanelFinishes = new Set(["ocean-green", "graphite", "cool-gray", "burgundy", "arctic-white", "supplier-match", "not-sure"]);
const allowedTimelines = new Set(["less-than-4-weeks", "4-8-weeks", "8-12-weeks", "planning"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maxFileBytes = 25 * 1024 * 1024;

const emptyInput: RfqInput = {
  name: "",
  email: "",
  company: "",
  country: "",
  postalCode: "",
  projectType: "",
  dimensions: "",
  panelFinish: "",
  scope: "",
  quantity: Number.NaN,
  timeline: "",
  consent: false,
  files: [],
};

function asRecord(input: unknown): Record<string, unknown> {
  return input !== null && typeof input === "object" && !Array.isArray(input)
    ? input as Record<string, unknown>
    : {};
}

function stringField(record: Record<string, unknown>, key: string): string {
  return typeof record[key] === "string" ? record[key] : "";
}

function normalizeFiles(value: unknown): RfqFile[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return [{ name: "", size: -1, type: "" }];
  return value.map((candidate) => {
    const file = asRecord(candidate);
    return {
      name: typeof file.name === "string" ? file.name : "",
      size: typeof file.size === "number" ? file.size : -1,
      type: typeof file.type === "string" ? file.type : "",
    };
  });
}

export function parseRfqInput(input: unknown): { value: RfqInput; errors: RfqErrors } {
  const record = asRecord(input);
  const value: RfqInput = {
    ...emptyInput,
    name: stringField(record, "name"),
    email: stringField(record, "email"),
    company: stringField(record, "company"),
    country: stringField(record, "country"),
    postalCode: stringField(record, "postalCode"),
    projectType: stringField(record, "projectType"),
    dimensions: stringField(record, "dimensions"),
    panelFinish: stringField(record, "panelFinish"),
    scope: stringField(record, "scope"),
    quantity: typeof record.quantity === "number" ? record.quantity : Number.NaN,
    timeline: stringField(record, "timeline"),
    consent: record.consent === true,
    files: normalizeFiles(record.files),
  };
  return { value, errors: validateNormalizedRfq(value) };
}

function validateNormalizedRfq(input: RfqInput): RfqErrors {
  const errors: RfqErrors = {};
  const nameLength = input.name.trim().length;
  if (nameLength < 1 || nameLength > 100) errors.name = "Enter a name up to 100 characters.";
  const email = input.email.trim();
  if (email.length > 254 || !emailPattern.test(email)) errors.email = "Enter a valid email up to 254 characters.";
  if (input.company.trim().length > 120) errors.company = "Enter a company name up to 120 characters.";
  if (!allowedCountries.has(input.country)) errors.country = "Select United States or Canada.";
  const postalLength = input.postalCode.trim().length;
  if (postalLength < 1 || postalLength > 20) errors.postalCode = "Enter a destination postal code up to 20 characters.";
  if (!allowedProjectTypes.has(input.projectType)) errors.projectType = "Select a listed furniture type.";
  const dimensionsLength = input.dimensions.trim().length;
  if (dimensionsLength < 5 || dimensionsLength > 500) errors.dimensions = "Describe target width, depth, and height in 5 to 500 characters.";
  if (!allowedPanelFinishes.has(input.panelFinish)) errors.panelFinish = "Select a listed panel finish or Not sure yet.";
  const scopeLength = input.scope.trim().length;
  if (scopeLength < 20 || scopeLength > 4_000) errors.scope = "Describe the room and configuration in 20 to 4,000 characters.";
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 10_000) {
    errors.quantity = "Enter a whole-number quantity from 1 to 10,000.";
  }
  if (!allowedTimelines.has(input.timeline)) errors.timeline = "Select a listed target timeline.";
  if (!input.consent) errors.consent = "Confirm that we may use these details to prepare the request.";

  if (input.files.length > 5) {
    errors.files = "Attach up to five files.";
  } else {
    const invalidFile = input.files.find((file) => {
      const extension = file.name.toLowerCase().split(".").pop() ?? "";
      return file.name.length < 1
        || file.name.length > 180
        || file.name.includes("/")
        || file.name.includes("\\")
        || file.name.includes("..")
        || !allowedExtensions.has(extension)
        || !allowedMimeTypes.has(file.type.toLowerCase())
        || !Number.isInteger(file.size)
        || file.size < 0
        || file.size > maxFileBytes;
    });
    if (invalidFile) errors.files = "Use valid PDF, PNG, JPG, or ZIP metadata up to 25 MB each.";
  }
  return errors;
}

export function validateRfq(input: unknown): RfqErrors {
  return parseRfqInput(input).errors;
}

export function createRfqReference(date = new Date(), entropy = crypto.randomUUID().slice(0, 6).toUpperCase()): string {
  const day = date.toISOString().slice(0, 10).replaceAll("-", "");
  return `TF-${day}-${entropy.toUpperCase()}`;
}
