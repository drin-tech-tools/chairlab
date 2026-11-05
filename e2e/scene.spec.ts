import { expect, test } from "@playwright/test";

const stage = (page: import("@playwright/test").Page) => page.getByTestId("chair-stage");

test.describe("3D scene", () => {
  test("canvas mounts and becomes ready", async ({ page }) => {
    await page.goto("/");
    await expect(stage(page)).toHaveAttribute("data-mode", "webgl");
    await expect(stage(page)).toHaveAttribute("data-ready", "true", { timeout: 15_000 });
    await expect(stage(page).locator("canvas")).toBeVisible();
    await expect(page.getByRole("status", { name: "3D view" })).toHaveText("");
  });

  test("auto-spins by default", async ({ page }) => {
    await page.goto("/");
    await expect(stage(page)).toHaveAttribute("data-ready", "true", { timeout: 15_000 });
    await expect(stage(page)).toHaveAttribute("data-autorotate", "true");
  });

  test("reduced motion disables auto-spin", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(stage(page)).toHaveAttribute("data-ready", "true", { timeout: 15_000 });
    await expect(stage(page)).toHaveAttribute("data-autorotate", "false");
  });

  test("the stage describes the current build for screen readers", async ({ page }) => {
    await page.goto("/?frame=crimson&base=racing");
    await expect(page.getByRole("img", { name: /Crimson frame.*Racing Aluminum base/ })).toBeVisible();
  });
});

test.describe("without WebGL", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (type.startsWith("webgl")) return null;
        return (original as (...args: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof original;
    });
  });

  test("falls back to the flat preview and pricing still works", async ({ page }) => {
    await page.goto("/");
    await expect(stage(page)).toHaveAttribute("data-mode", "fallback");
    await expect(stage(page).locator("canvas")).toHaveCount(0);
    await expect(stage(page).locator("svg.chair-flat")).toBeVisible();
    await page.getByRole("switch", { name: /RGB strip/ }).check();
    await expect(page.getByTestId("price-total")).toHaveText("₱14,199");
  });
});
