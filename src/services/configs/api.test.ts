import { beforeEach, describe, expect, it } from "vitest";
import { chair } from "@/data/catalog";
import { defaultConfig } from "@/lib/configurator/validation";
import { handleGetConfig, handleSaveConfig } from "@/services/configs/api";
import { createMemoryRepository } from "@/services/configs/memory-repository";
import type { ConfigRepository } from "@/services/configs/repository";

let repo: ConfigRepository;
const getRepo = () => repo;
const racing = { ...defaultConfig(chair), base: "racing", lumbar: true };

const post = (body: unknown, headers: Record<string, string> = { "content-type": "application/json" }) =>
  new Request("http://localhost/api/configs", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

describe("POST /api/configs", () => {
  beforeEach(() => {
    repo = createMemoryRepository();
  });

  it("saves a valid build and returns its short id, share path and price", async () => {
    const res = await handleSaveConfig(post({ config: racing }), getRepo);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({ path: `/b/${body.id}`, totalCentavos: 1_379_900 + 49_900 });
    expect(res.headers.get("location")).toBe(`/api/configs/${body.id}`);
    expect((await repo.get(body.id))?.config).toEqual(racing);
  });

  it("is idempotent: the same build returns the same id", async () => {
    const a = await (await handleSaveConfig(post({ config: racing }), getRepo)).json();
    const b = await (await handleSaveConfig(post({ config: { ...racing } }), getRepo)).json();
    expect(a.id).toBe(b.id);
  });

  it("rejects non-JSON content types", async () => {
    const res = await handleSaveConfig(post({ config: racing }, { "content-type": "text/plain" }), getRepo);
    expect(res.status).toBe(415);
  });

  it("rejects bodies over 2 KB", async () => {
    const res = await handleSaveConfig(post({ config: racing, pad: "x".repeat(3_000) }), getRepo);
    expect(res.status).toBe(413);
  });

  it("rejects malformed JSON", async () => {
    expect((await handleSaveConfig(post("{nope"), getRepo)).status).toBe(400);
  });

  it.each([
    ["unknown choice", { config: { ...racing, base: "hover" } }],
    ["missing option", { config: { base: "racing" } }],
    ["extra config key", { config: { ...racing, price: 1 } }],
    ["extra body key", { config: racing, total: 1 }],
    ["client-supplied price is never trusted", { config: racing, totalCentavos: 1 }],
  ])("rejects %s with 400 and issue paths", async (_name, body) => {
    const res = await handleSaveConfig(post(body), getRepo);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("invalid_config");
    expect(json.issues.length).toBeGreaterThan(0);
  });

  it("returns 503 when the store is unavailable or unconfigured", async () => {
    const failing: ConfigRepository = { save: () => Promise.reject(new Error("down")), get: () => Promise.resolve(null) };
    expect((await handleSaveConfig(post({ config: racing }), () => failing)).status).toBe(503);
    const unconfigured = () => {
      throw new Error("not configured");
    };
    expect((await handleSaveConfig(post({ config: racing }), unconfigured)).status).toBe(503);
  });
});

describe("GET /api/configs/[id]", () => {
  beforeEach(() => {
    repo = createMemoryRepository();
  });

  it("returns a saved build with immutable caching", async () => {
    const { id } = await (await handleSaveConfig(post({ config: racing }), getRepo)).json();
    const res = await handleGetConfig(id, getRepo);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toContain("immutable");
    expect(await res.json()).toMatchObject({ id, productId: chair.id, config: racing, totalCentavos: 1_429_800 });
  });

  it("404s for unknown and malformed ids without hitting the store", async () => {
    expect((await handleGetConfig("AbCdEf_123", getRepo)).status).toBe(404);
    const exploding = () => {
      throw new Error("should not be called");
    };
    expect((await handleGetConfig("../../etc", exploding)).status).toBe(404);
  });
});
