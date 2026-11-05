import { After, Before, Given, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { chromium, expect, type Browser, type Page } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
setDefaultTimeout(30_000);

let browser: Browser;
let page: Page;

Before(async () => {
  browser = await chromium.launch();
  page = await browser.newPage();
});

After(async () => {
  await browser?.close();
});

Given("I open the home page", async () => {
  await page.goto(baseURL);
});

Then("I see the {string} heading", async (name: string) => {
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
});
