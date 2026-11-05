import { describe, expect, it, vi } from "vitest";
import { createSupabaseRepository } from "@/services/configs/supabase-repository";

const URL_BASE = "https://proj.supabase.co/";
const record = { id: "AbCdEf_123", productId: "chairlab-gt", config: { base: "racing" }, totalCentavos: 1_379_900 };

function mockFetch(response: Response) {
  return vi.fn<typeof fetch>().mockResolvedValue(response);
}

describe("Supabase config repository", () => {
  it("upserts with ignore-duplicates against the configs table", async () => {
    const fetch = mockFetch(new Response(null, { status: 201 }));
    await createSupabaseRepository({ url: URL_BASE, serviceRoleKey: "sb_secret_x", fetch }).save(record);

    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("https://proj.supabase.co/rest/v1/configs?on_conflict=id");
    expect(init?.method).toBe("POST");
    const headers = new Headers(init?.headers);
    expect(headers.get("apikey")).toBe("sb_secret_x");
    expect(headers.get("prefer")).toBe("resolution=ignore-duplicates,return=minimal");
    expect(JSON.parse(String(init?.body))).toEqual({
      id: "AbCdEf_123",
      product_id: "chairlab-gt",
      config: { base: "racing" },
      total_centavos: 1_379_900,
    });
  });

  it("sends a Bearer header only for legacy JWT service-role keys", async () => {
    const newKey = mockFetch(new Response(null, { status: 201 }));
    await createSupabaseRepository({ url: URL_BASE, serviceRoleKey: "sb_secret_x", fetch: newKey }).save(record);
    expect(new Headers(newKey.mock.calls[0][1]?.headers).has("authorization")).toBe(false);

    const legacy = mockFetch(new Response(null, { status: 201 }));
    await createSupabaseRepository({ url: URL_BASE, serviceRoleKey: "aaa.bbb.ccc", fetch: legacy }).save(record);
    expect(new Headers(legacy.mock.calls[0][1]?.headers).get("authorization")).toBe("Bearer aaa.bbb.ccc");
  });

  it("maps a row on get and URL-encodes the id filter", async () => {
    const row = { id: "AbCdEf_123", product_id: "chairlab-gt", config: { base: "racing" }, total_centavos: 1_379_900, created_at: "2026-11-06T00:00:00Z" };
    const fetch = mockFetch(Response.json([row]));
    const saved = await createSupabaseRepository({ url: URL_BASE, serviceRoleKey: "k", fetch }).get("AbCdEf_123");

    expect(String(fetch.mock.calls[0][0])).toContain("/rest/v1/configs?id=eq.AbCdEf_123&select=");
    expect(saved).toEqual({ ...record, createdAt: "2026-11-06T00:00:00Z" });
  });

  it("returns null when no row matches", async () => {
    const fetch = mockFetch(Response.json([]));
    expect(await createSupabaseRepository({ url: URL_BASE, serviceRoleKey: "k", fetch }).get("AbCdEf_123")).toBeNull();
  });

  it("throws on HTTP errors without leaking the key", async () => {
    const fetch = mockFetch(new Response("boom", { status: 500 }));
    const repo = createSupabaseRepository({ url: URL_BASE, serviceRoleKey: "sb_secret_dont_leak", fetch });
    await expect(repo.save(record)).rejects.toThrow(/500/);
    await expect(repo.save(record)).rejects.not.toThrow(/dont_leak/);
  });
});
