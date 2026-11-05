import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const audit = (page: Page) => new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

test.describe("launch readiness", () => {
  test("the configurator has no WCAG A/AA violations", async ({ page }) => {
    await page.goto("/?rgb=1");
    await expect(page.getByRole("img", { name: /ChairLab GT/ })).toBeVisible();
    expect((await audit(page)).violations).toEqual([]);
  });

  test("the not-found build page has no WCAG A/AA violations", async ({ page }) => {
    await page.goto("/b/Zz_0000000");
    await expect(page.getByRole("heading", { name: "Build not found" })).toBeVisible();
    expect((await audit(page)).violations).toEqual([]);
  });

  test("pages ship link-preview metadata and an app icon", async ({ page, request }) => {
    await page.goto("/");
    const og = page.locator('meta[property="og:image"]');
    await expect(og).toHaveAttribute("content", /opengraph-image/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    const image = await request.get(new URL((await og.getAttribute("content"))!).pathname);
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toBe("image/png");

    const icon = await page.locator('link[rel="icon"]').first().getAttribute("href");
    expect((await request.get(icon!)).status()).toBe(200);
  });

  test("responses carry baseline security headers", async ({ request }) => {
    for (const path of ["/", "/api/configs/Zz_0000000"]) {
      const headers = (await request.get(path)).headers();
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
      expect(headers["permissions-policy"]).toContain("camera=()");
    }
  });
});
