import { describe, expect, it } from "vitest";
import { chair, type ChairConfig } from "@/data/catalog";
import { decodeConfig, encodeConfig } from "@/lib/configurator/url";
import { defaultConfig } from "@/lib/configurator/validation";

const custom: ChairConfig = {
  ...defaultConfig(chair),
  frame: "gunmetal",
  material: "premium",
  stitching: "cyan",
  base: "racing",
  lumbar: true,
  rgb: true,
  rgbColor: "lime",
};

describe("URL serialization", () => {
  it("round-trips a config", () => {
    expect(decodeConfig(chair, encodeConfig(chair, custom))).toEqual(custom);
  });

  it("encodes booleans as 1/0 with option ids as keys", () => {
    const params = new URLSearchParams(encodeConfig(chair, custom));
    expect(params.get("lumbar")).toBe("1");
    expect(params.get("base")).toBe("racing");
  });

  it("accepts a leading ? and URLSearchParams", () => {
    const qs = encodeConfig(chair, custom);
    expect(decodeConfig(chair, `?${qs}`)).toEqual(custom);
    expect(decodeConfig(chair, new URLSearchParams(qs))).toEqual(custom);
  });

  it("returns defaults for an empty query", () => {
    expect(decodeConfig(chair, "")).toEqual(defaultConfig(chair));
  });

  it("falls back per field on invalid values and ignores unknown params", () => {
    const decoded = decodeConfig(chair, "base=hover&lumbar=yes&frame=gunmetal&__proto__=x&evil=1");
    expect(decoded).toEqual({ ...defaultConfig(chair), frame: "gunmetal" });
    expect(Object.keys(decoded).sort()).toEqual(chair.options.map((o) => o.id).sort());
  });
});
