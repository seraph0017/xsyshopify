import { expect, test } from "@playwright/test";

test("homepage presents finished frame-and-panel furniture", async ({ page }) => {
  const imageWarnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" && message.text().includes("either width or height modified")) imageWarnings.push(message.text());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Furniture built from frame and panel.");
  await expect(page.getByText(/aluminum frame and marine-grade panel surfaces/i)).toBeVisible();
  await expect(page.getByText(/lightweight aluminum structure/i)).toHaveCount(0);
  await expect(page.getByText(/Furniture shaped by brushed aluminum frames and marine-grade panel surfaces/i)).toBeVisible();
  expect(imageWarnings).toEqual([]);
});

test("search navigates from the header to matching results", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const input = page.getByRole("textbox", { name: /search products and resources/i });
  await expect(input).toBeFocused();
  await input.fill("Skiff");
  await page.getByRole("button", { name: "Search", exact: true }).last().click();
  await expect(page).toHaveURL(/\/search\?q=Skiff/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Search furniture");
  await expect(page.getByRole("link", { name: "Skiff Console", exact: true })).toBeVisible();
});

test("catalog filters update the URL and unknown values are ignored", async ({ page, isMobile }) => {
  const lcpWarnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" && message.text().includes("Largest Contentful Paint")) lcpWarnings.push(message.text());
  });
  await page.goto("/products?category=mars");
  await expect(page.getByText(/Marine-grade panel surfaces meet brushed aluminum frames/i)).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "6 pieces" })).toBeVisible();
  if (isMobile) await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.getByLabel("Furniture type").selectOption("sideboard");
  await expect(page).toHaveURL(/category=sideboard/);
  await expect(page.getByRole("heading", { level: 2, name: "1 piece" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Haven Sideboard", exact: true })).toBeVisible();
  expect(lcpWarnings).toEqual([]);
});

test("PDP option pricing reaches the modal cart", async ({ page }) => {
  await page.goto("/products/skiff-console");
  await page.getByLabel("Size").selectOption("60 in");
  await page.getByLabel("Panel finish").selectOption("graphite");
  await expect(page.getByText("$1,495", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /^add to cart$/i }).click();
  await expect(page.getByRole("button", { name: "Cart with 1 item", exact: true })).toBeVisible();
  const dialog = page.getByRole("dialog", { name: /your cart/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("60 in / Graphite", { exact: true })).toBeVisible();
  await expect(dialog.getByText("$1495.00 preview", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Close cart" }).click();
  await expect(dialog).toBeHidden();
});

test("RFQ validates and announces a prototype success", async ({ page }) => {
  await page.goto("/rfq?project=sideboard&scope=Three%20closed%20bays%20for%20a%20living%20room%20wall%20with%20cable%20access%20at%20the%20rear.");
  await page.getByLabel(/^Name/).fill("Alex Morgan");
  await page.getByLabel(/Work email/).fill("alex@example.com");
  await page.getByLabel(/postal code/i).fill("48104");
  await page.getByLabel(/Target dimensions/).fill('About 72" wide x 18" deep x 30" high');
  await page.getByLabel(/Panel finish/).selectOption("ocean-green");
  await page.getByLabel(/Target timeline/).selectOption("4-8-weeks");
  await page.getByLabel(/I confirm these project details/).check();
  await page.getByRole("button", { name: /submit custom project/i }).click();
  const status = page.getByRole("status");
  await expect(status).toContainText("Custom project accepted");
  await expect(status.getByRole("heading", { name: /Reference TF-/ })).toBeFocused();
});

test("materials and custom-project routes expose furniture-first content", async ({ page, isMobile }) => {
  const imageWarnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" && message.text().includes("either width or height modified")) imageWarnings.push(message.text());
  });
  await page.goto("/materials");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Frame and panel, read as one piece.");
  await expect(page.locator(".page-intro").getByText(/Marine-grade panel is a neutral working term/i)).toBeVisible();
  await expect(page.getByText(/aluminum-extrusion/i)).toHaveCount(0);
  await expect(page.getByText(/specific substrate and production specifications remain/i)).toBeVisible();
  if (isMobile) await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("link", { name: "Custom Projects", exact: true }).first().click();
  await expect(page).toHaveURL(/\/custom-projects$/);
  const heading = page.getByRole("heading", { level: 1 });
  const callToAction = page.getByRole("link", { name: "Describe your project", exact: true });
  const heroImage = page.getByRole("img", { name: /Long ocean-green sideboard/i });

  await expect(heading).toContainText("Shape it around the room");
  await expect(callToAction).toBeVisible();
  await expect(heroImage).toBeVisible();

  const copyBox = await page.locator(".custom-hero__copy").boundingBox();
  const mediaBox = await heroImage.boundingBox();
  expect(copyBox).not.toBeNull();
  expect(mediaBox).not.toBeNull();
  expect(copyBox!.y + copyBox!.height <= mediaBox!.y || mediaBox!.y + mediaBox!.height <= copyBox!.y || copyBox!.x + copyBox!.width <= mediaBox!.x || mediaBox!.x + mediaBox!.width <= copyBox!.x).toBe(true);
  expect(imageWarnings).toEqual([]);
});
