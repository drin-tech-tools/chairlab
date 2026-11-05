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

test.describe("camera presets", () => {
  test("choosing a preset presses it and stops the auto-spin", async ({ page }) => {
    await page.goto("/");
    await expect(stage(page)).toHaveAttribute("data-ready", "true", { timeout: 15_000 });
    const views = page.getByRole("group", { name: "Camera view" });
    await expect(views.getByRole("button", { name: "Hero" })).toHaveAttribute("aria-pressed", "true");

    await views.getByRole("button", { name: "Side" }).click();
    await expect(views.getByRole("button", { name: "Side" })).toHaveAttribute("aria-pressed", "true");
    await expect(views.getByRole("button", { name: "Hero" })).toHaveAttribute("aria-pressed", "false");
    await expect(stage(page)).toHaveAttribute("data-autorotate", "false");
  });
});

test.describe("hotspots", () => {
  test.use({ reducedMotion: "reduce" });

  test("a hotspot focuses its option and switches the camera view", async ({ page }) => {
    await page.goto("/");
    await expect(stage(page)).toHaveAttribute("data-ready", "true", { timeout: 15_000 });

    await page.getByRole("button", { name: "Edit Base" }).click();
    await expect(page.getByRole("group", { name: "Base", exact: true }).getByRole("radio", { name: /5-Star Nylon/ })).toBeFocused();
    await expect(page.getByRole("group", { name: "Camera view" }).getByRole("button", { name: "Base" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // The Base view frames the floor; go back to Hero so the backrest hotspots are in frame.
    await page.getByRole("group", { name: "Camera view" }).getByRole("button", { name: "Hero" }).click();
    await page.getByRole("button", { name: "Edit Lumbar pillow" }).click();
    await expect(page.getByRole("switch", { name: /Lumbar pillow/ })).toBeFocused();
  });
});

test.describe("save image", () => {
  test("downloads a PNG of the current build", async ({ page }) => {
    await page.goto("/?frame=crimson&rgb=1");
    await expect(stage(page)).toHaveAttribute("data-ready", "true", { timeout: 15_000 });

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Save image" }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^chairlab-gt-.+\.png$/);
    const path = await download.path();
    const { readFile } = await import("node:fs/promises");
    const bytes = await readFile(path);
    expect(bytes.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    expect(bytes.length).toBeGreaterThan(10_000);
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
    await expect(page.getByRole("group", { name: "Camera view" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Save image" })).toHaveCount(0);
    await page.getByRole("switch", { name: /RGB strip/ }).check();
    await expect(page.getByTestId("price-total")).toHaveText("₱14,199");
  });
});
