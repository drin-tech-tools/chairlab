import { describe, expect, it } from "vitest";
import { chair, type ChairConfig } from "@/data/catalog";
import { formatCentavos, priceBreakdown } from "@/lib/configurator/price";
import { defaultConfig } from "@/lib/configurator/validation";

const base = (): ChairConfig => defaultConfig(chair);

describe("priceBreakdown", () => {
  it("prices the default chair at the ₱12,999 base with no add-ons", () => {
    expect(priceBreakdown(chair, base())).toEqual({ base: 1_299_900, lines: [], total: 1_299_900 });
  });

  it.each<[string, Partial<ChairConfig>, number]>([
    ["premium leather", { material: "premium" }, 250_000],
    ["RGB strip", { rgb: true }, 120_000],
    ["racing base", { base: "racing" }, 80_000],
    ["lumbar pillow", { lumbar: true }, 49_900],
    ["Pro stitching", { stitching: "crimson" }, 30_000],
  ])("adds %s exactly once", (_name, patch, delta) => {
    const result = priceBreakdown(chair, { ...base(), ...patch });
    expect(result.total).toBe(1_299_900 + delta);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].amount).toBe(delta);
  });

  it("does not charge for free choices like colors or RGB color", () => {
    const result = priceBreakdown(chair, { ...base(), frame: "crimson", color: "cobalt", rgbColor: "magenta" });
    expect(result.total).toBe(1_299_900);
  });

  it("sums a fully loaded chair to ₱18,298 as an integer", () => {
    const result = priceBreakdown(chair, {
      ...base(),
      material: "premium",
      rgb: true,
      base: "racing",
      lumbar: true,
      stitching: "gold",
    });
    expect(result.total).toBe(1_829_800);
    expect(Number.isSafeInteger(result.total)).toBe(true);
    expect(result.lines.map((l) => l.optionId)).toEqual(["material", "stitching", "base", "lumbar", "rgb"]);
  });

  it("throws on a choice that is not in the catalog", () => {
    const bad = { ...base(), base: "hover" } as unknown as ChairConfig;
    expect(() => priceBreakdown(chair, bad)).toThrow(/base/);
  });
});

describe("formatCentavos", () => {
  it("formats whole pesos without decimals", () => {
    expect(formatCentavos(1_299_900)).toBe("₱12,999");
  });

  it("keeps centavos when present", () => {
    expect(formatCentavos(49_950)).toBe("₱499.50");
  });
});
