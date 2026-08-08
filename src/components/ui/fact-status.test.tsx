import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FactStatus } from "./fact-status";

describe("FactStatus", () => {
  it("renders every applicability and evidence field visibly", () => {
    const html = renderToStaticMarkup(<FactStatus
      appliesTo="Planning"
      doesNotCover="Released production claims"
      market="United States"
      unitSystem="Inch and metric"
      lastReviewed="August 8, 2026"
      evidenceStatus="Prototype / operator review pending"
      contentOwner="Furniture content / production owner pending"
      sourceStatus="Prototype fixture / supplier sources pending"
    />);
    for (const label of ["Applies to", "Does not cover", "Market", "Unit system", "Last reviewed", "Evidence / review status", "Content owner", "Source status"]) {
      expect(html).toContain(label);
    }
  });
});
