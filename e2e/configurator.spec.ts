import { expect, test, type Page } from "@playwright/test";

const total = (page: Page) => page.getByTestId("price-total");
const group = (page: Page, name: string) => page.getByRole("group", { name, exact: true });

test.describe("configurator", () => {
  test("changing options updates the live price", async ({ page }) => {
    await page.goto("/");
    await expect(total(page)).toHaveText("₱12,999");

    await group(page, "Base").getByRole("radio", { name: /Racing Aluminum/ }).check();
    await expect(total(page)).toHaveText("₱13,799");

    await page.getByRole("switch", { name: /Lumbar pillow/ }).check();
    await expect(total(page)).toHaveText("₱14,298");

    await group(page, "Upholstery").getByRole("radio", { name: /Premium Leather/ }).check();
    await expect(total(page)).toHaveText("₱16,798");

    await page.getByText("Price breakdown").click();
    const breakdown = page.getByTestId("price-breakdown");
    await expect(breakdown).toContainText("Base: Racing Aluminum");
    await expect(breakdown).toContainText("+₱800");
    await expect(breakdown).toContainText("Lumbar pillow");
  });

  test("free choices do not change the price and update the preview", async ({ page }) => {
    await page.goto("/");
    await group(page, "Frame").getByRole("radio", { name: "Gunmetal" }).check();
    await expect(total(page)).toHaveText("₱12,999");
    await expect(page.getByRole("img", { name: /Gunmetal frame/ })).toBeVisible();
  });

  test("RGB color appears only when the RGB strip is on", async ({ page }) => {
    await page.goto("/");
    await expect(group(page, "RGB color")).toHaveCount(0);
    await page.getByRole("switch", { name: /RGB strip/ }).check();
    await expect(total(page)).toHaveText("₱14,199");
    await group(page, "RGB color").getByRole("radio", { name: "Magenta" }).check();
    await expect(total(page)).toHaveText("₱14,199");
  });

  test("the URL tracks the config", async ({ page }) => {
    await page.goto("/");
    await group(page, "Base").getByRole("radio", { name: /Racing Aluminum/ }).check();
    await expect(page).toHaveURL(/[?&]base=racing(&|$)/);
    await page.getByRole("switch", { name: /Lumbar pillow/ }).check();
    await expect(page).toHaveURL(/[?&]lumbar=1(&|$)/);
  });

  test("a shared URL restores the build on first render", async ({ page }) => {
    await page.goto("/?base=racing&lumbar=1&rgb=1&rgbColor=amber&frame=white");
    await expect(total(page)).toHaveText("₱15,498");
    await expect(group(page, "Base").getByRole("radio", { name: /Racing Aluminum/ })).toBeChecked();
    await expect(group(page, "RGB color").getByRole("radio", { name: "Amber" })).toBeChecked();
    await expect(page.getByRole("switch", { name: /Lumbar pillow/ })).toBeChecked();
    await expect(page.getByRole("img", { name: /Arctic White frame/ })).toBeVisible();
  });

  test("server HTML already contains the shared price (no flash of defaults)", async ({ request }) => {
    const html = await (await request.get("/?base=racing")).text();
    expect(html).toContain("₱13,799");
  });

  test("invalid URL values fall back to defaults", async ({ page }) => {
    await page.goto("/?base=hover&lumbar=maybe");
    await expect(total(page)).toHaveText("₱12,999");
    await expect(group(page, "Base").getByRole("radio", { name: /5-Star Nylon/ })).toBeChecked();
  });

  test("copy share link falls back to the long URL when saving fails", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.route("**/api/configs", (route) => route.fulfill({ status: 503, json: { error: "store_unavailable" } }));
    await page.goto("/");
    await group(page, "Stitching").getByRole("radio", { name: /Cyan/ }).check();
    await expect(page).toHaveURL(/stitching=cyan/);

    await page.getByRole("button", { name: "Copy share link" }).click();
    await expect(page.getByRole("status", { name: "Share link" })).toHaveText("Link copied");
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe(page.url());

    const fresh = await context.newPage();
    await fresh.goto(copied);
    await expect(fresh.getByTestId("price-total")).toHaveText("₱13,299");
  });
});
