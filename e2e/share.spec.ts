import { expect, test } from "@playwright/test";

const SHORT_LINK = /\/b\/[A-Za-z0-9_-]{10}$/;

test.describe("save and share", () => {
  test("copy share link saves the build and copies a short /b/<id> link that restores it", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/?frame=crimson&base=racing&lumbar=1");
    await expect(page.getByTestId("price-total")).toHaveText("₱14,298");

    await page.getByRole("button", { name: "Copy share link" }).click();
    await expect(page.getByRole("status", { name: "Share link" })).toHaveText("Short link copied");
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(SHORT_LINK);

    const fresh = await context.newPage();
    await fresh.goto(copied);
    await expect(fresh).toHaveURL(SHORT_LINK);
    await expect(fresh.getByTestId("price-total")).toHaveText("₱14,298");
    await expect(fresh.getByRole("group", { name: "Frame", exact: true }).getByRole("radio", { name: "Crimson" })).toBeChecked();

    // Editing a saved build leaves the short link for the long, editable URL.
    await fresh.getByRole("switch", { name: /Lumbar pillow/ }).uncheck();
    await expect(fresh).toHaveURL(/\/\?.*lumbar=0/);
    await expect(fresh.getByTestId("price-total")).toHaveText("₱13,799");
  });

  test("the same build always gets the same short id", async ({ request }) => {
    const body = await (await request.get("/?base=racing")).text();
    expect(body).toContain("₱13,799");
    const config = {
      frame: "black", material: "fabric", color: "onyx", stitching: "tonal",
      base: "racing", lumbar: false, rgb: false, rgbColor: "cyan",
    };
    const a = await request.post("/api/configs", { data: { config } });
    const b = await request.post("/api/configs", { data: { config } });
    expect(a.status()).toBe(201);
    expect((await a.json()).id).toBe((await b.json()).id);

    const { id } = await a.json();
    const got = await request.get(`/api/configs/${id}`);
    expect(got.status()).toBe(200);
    expect(await got.json()).toMatchObject({ id, config, totalCentavos: 1_379_900 });
  });

  test("the API rejects invalid builds and client-supplied prices", async ({ request }) => {
    const res = await request.post("/api/configs", { data: { config: { base: "hover" }, totalCentavos: 1 } });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("invalid_config");
  });

  test("unknown and malformed ids show a not-found page and 404 from the API", async ({ page, request }) => {
    await page.goto("/b/Zz_0000000");
    await expect(page.getByRole("heading", { name: "Build not found" })).toBeVisible();
    await page.getByRole("link", { name: "Start a new build" }).click();
    await expect(page.getByTestId("price-total")).toHaveText("₱12,999");

    expect((await request.get("/api/configs/Zz_0000000")).status()).toBe(404);
    expect((await request.get("/api/configs/not-an-id")).status()).toBe(404);
  });
});
