import { describe, expect, it } from "vitest";
import { chair, type ChairConfig } from "@/data/catalog";
import { SHARE_ID_PATTERN, shareId } from "@/lib/configurator/share-id";
import { defaultConfig } from "@/lib/configurator/validation";

const base = (): ChairConfig => defaultConfig(chair);

describe("shareId", () => {
  it("is a 10-char URL-safe id", async () => {
    const id = await shareId(chair, base());
    expect(id).toMatch(SHARE_ID_PATTERN);
    expect(id).toHaveLength(10);
  });

  it("is deterministic: the same build always gets the same id", async () => {
    expect(await shareId(chair, base())).toBe(await shareId(chair, { ...base() }));
  });

  it("ignores key order", async () => {
    const shuffled = Object.fromEntries(Object.entries(base()).reverse()) as ChairConfig;
    expect(await shareId(chair, shuffled)).toBe(await shareId(chair, base()));
  });

  it("differs for different builds", async () => {
    expect(await shareId(chair, { ...base(), lumbar: true })).not.toBe(await shareId(chair, base()));
  });
});

describe("SHARE_ID_PATTERN", () => {
  it.each(["", "short", "abcdefghijk", "abc/efghij", "abc efghij", "../../etc0"])("rejects %j", (bad) => {
    expect(SHARE_ID_PATTERN.test(bad)).toBe(false);
  });
});
