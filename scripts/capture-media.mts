// Records the README GIFs and the link-preview image from a running server.
// Usage: CONFIG_STORE=memory npm run build && npm start, then `npm run media` (BASE_URL overrides the origin).
import { mkdir } from "node:fs/promises";
import { chromium, devices, type Page } from "@playwright/test";
import sharp from "sharp";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
const FRAME_MS = 100;

// Headless Metal on macOS is ~3x faster per screenshot than SwiftShader, so the GIFs come out smoother.
const gl = process.platform === "darwin" ? ["--enable-gpu", "--use-angle=metal"] : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"];
const browser = await chromium.launch({ args: gl });

async function open(options: Parameters<typeof browser.newContext>[0], path = "/") {
  const context = await browser.newContext({ ...options, baseURL });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseURL });
  const page = await context.newPage();
  await page.goto(path);
  await page.getByTestId("chair-stage").and(page.locator('[data-ready="true"]')).waitFor({ timeout: 30_000 });
  await page.waitForTimeout(800); // let the camera settle
  return page;
}

/** Screenshot the page every FRAME_MS while `script` runs, then encode an animated GIF `width` px wide. */
async function record(page: Page, file: string, width: number, script: (page: Page) => Promise<void>) {
  const frames: Buffer[] = [];
  const times: number[] = [];
  let running = true;
  const loop = (async () => {
    while (running) {
      const started = Date.now();
      frames.push(await page.screenshot({ animations: "allow" }));
      times.push(started);
      await page.waitForTimeout(Math.max(0, FRAME_MS - (Date.now() - started)));
    }
  })();
  await script(page);
  running = false;
  await loop;

  const resized = await Promise.all(frames.map((f) => sharp(f).resize({ width }).png().toBuffer()));
  const delay = times.map((t, i) => (times[i + 1] ?? t + 1500) - t); // hold the last frame
  await sharp(resized, { join: { animated: true } })
    .gif({ delay, loop: 0, effort: 10, colours: 128, dither: 0.6 })
    .toFile(file);
  console.log(`${file}: ${frames.length} frames`);
}

const step = (ms = 700) => (page: Page) => page.waitForTimeout(ms);
const pick = (page: Page, option: string, choice: string | RegExp) =>
  page.getByRole("group", { name: option, exact: true }).getByRole("radio", { name: choice }).check();
const view = (page: Page, name: string) =>
  page.getByRole("group", { name: "Camera view" }).getByRole("button", { name, exact: true }).click();

await mkdir("docs/media", { recursive: true });

// Desktop: configure, watch the price, copy a short link.
const desktop = await open({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await record(desktop, "docs/media/configure.gif", 800, async (page) => {
  await step(1200)(page);
  await pick(page, "Frame", "Crimson");
  await step()(page);
  await pick(page, "Upholstery", /Premium Leather/);
  await step()(page);
  await pick(page, "Stitching", /Pro · Volt/);
  await step()(page);
  await view(page, "Base");
  await pick(page, "Base", /Racing Aluminum/);
  await step(1200)(page);
  await view(page, "Hero");
  await page.getByRole("switch", { name: /RGB strip/ }).check();
  await step()(page);
  await pick(page, "RGB color", "Magenta");
  await step(1200)(page);
  await page.getByRole("button", { name: "Copy share link" }).click();
  await page.getByRole("status", { name: "Share link" }).getByText("Short link copied").waitFor();
  await step(1000)(page);
});
await desktop.context().close();

// Mobile: camera presets and the bottom sheet.
const mobile = await open({ ...devices["Pixel 7"], deviceScaleFactor: 1 }, "/?frame=white&color=cobalt&stitching=cyan&rgb=1");
await record(mobile, "docs/media/mobile.gif", 320, async (page) => {
  await step(1000)(page);
  for (const name of ["Side", "Detail", "Base", "Hero"]) {
    await view(page, name);
    await step(1100)(page);
  }
  await pick(page, "RGB color", "Lime");
  await step(1000)(page);
  await page.getByRole("switch", { name: /Lumbar pillow/ }).check();
  await step(1200)(page);
});
await mobile.context().close();

// Link preview (Next serves src/app/opengraph-image.png as og:image).
const og = await open({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 }, "/?frame=crimson&material=premium&stitching=volt&base=racing&rgb=1&rgbColor=magenta");
await og.screenshot({ path: "src/app/opengraph-image.png" });
console.log("src/app/opengraph-image.png");

await browser.close();
