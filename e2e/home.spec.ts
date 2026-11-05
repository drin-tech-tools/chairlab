import { expect, test } from "@playwright/test";

test("home page renders the ChairLab shell", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ChairLab/);
  await expect(page.getByRole("heading", { level: 1, name: "ChairLab" })).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
});
