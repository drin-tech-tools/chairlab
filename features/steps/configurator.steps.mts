import { After, Before, Given, Then, When, setDefaultTimeout } from "@cucumber/cucumber";
import { chromium, expect, type Browser, type BrowserContext, type Page } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
setDefaultTimeout(30_000);

let browser: Browser;
let context: BrowserContext;
let page: Page;
let copied = "";

Before(async () => {
  // Same software WebGL as the Playwright suite, so the 3D scene really mounts.
  browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  context = await browser.newContext({ baseURL });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseURL });
  page = await context.newPage();
});

After(async () => {
  await browser?.close();
});

const group = (name: string) => page.getByRole("group", { name, exact: true });

Given("I open the home page", async () => {
  await page.goto("/");
});

Then("I see the {string} heading", async (name: string) => {
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
});

When("I choose {string} for {string}", async (choice: string, option: string) => {
  await group(option).getByRole("radio", { name: choice }).check();
});

When("I turn on {string}", async (name: string) => {
  await page.getByRole("switch", { name }).check();
});

Then("the total is {string}", async (total: string) => {
  await expect(page.getByTestId("price-total")).toHaveText(total);
});

When("I copy the share link", async () => {
  await page.getByRole("button", { name: "Copy share link" }).click();
});

Then("I am told {string}", async (message: string) => {
  await expect(page.getByRole("status", { name: "Share link" })).toHaveText(message);
  copied = await page.evaluate(() => navigator.clipboard.readText());
});

When("I open the copied link in a new tab", async () => {
  page = await context.newPage();
  await page.goto(copied);
});

Then("the page address is a short link", async () => {
  await expect(page).toHaveURL(/\/b\/[A-Za-z0-9_-]{10}$/);
});

Then("{string} is selected for {string}", async (choice: string, option: string) => {
  await expect(group(option).getByRole("radio", { name: choice })).toBeChecked();
});

Then("{string} is on", async (name: string) => {
  await expect(page.getByRole("switch", { name })).toBeChecked();
});
