import { describe, expect, it } from "vitest";
import { chair, type ChairConfig } from "@/data/catalog";
import { defaultConfig } from "@/lib/configurator/validation";
import { chairMaterials, shade } from "@/components/chair-scene/materials";

const base = (): ChairConfig => defaultConfig(chair);

describe("chairMaterials", () => {
  it("maps catalog colors onto the frame, upholstery and RGB slots", () => {
    const m = chairMaterials({ ...base(), frame: "crimson", color: "cobalt", rgb: true, rgbColor: "amber" });
    expect(m.frame).toBe("#b3122e");
    expect(m.upholstery.color).toBe("#1f4fbf");
    expect(m.rgb).toBe("#ffb000");
  });

  it("turns the RGB slot off when the strip is off", () => {
    expect(chairMaterials({ ...base(), rgb: false, rgbColor: "lime" }).rgb).toBeNull();
  });

  it("derives tonal stitching from the upholstery and uses the accent for Pro", () => {
    const tonal = chairMaterials({ ...base(), color: "ivory", stitching: "tonal" });
    expect(tonal.stitch).toBe(shade("#ece6da", 0.65));
    expect(chairMaterials({ ...base(), stitching: "volt" }).stitch).toBe("#b6ff00");
  });

  it("makes leather glossier than fabric and premium glossier than leather", () => {
    const [fabric, leather, premium] = (["fabric", "leather", "premium"] as const).map(
      (material) => chairMaterials({ ...base(), material }).upholstery,
    );
    expect(fabric.roughness).toBeGreaterThan(leather.roughness);
    expect(leather.roughness).toBeGreaterThan(premium.roughness);
    expect(premium.clearcoat).toBeGreaterThan(leather.clearcoat);
    expect(fabric.clearcoat).toBe(0);
  });

  it("uses polished metal for the racing base and matte nylon for the star base", () => {
    expect(chairMaterials({ ...base(), base: "racing" }).base).toMatchObject({ metalness: 1, racing: true });
    expect(chairMaterials({ ...base(), base: "star" }).base).toMatchObject({ metalness: 0, racing: false });
  });
});

describe("shade", () => {
  it("scales each channel and keeps a 6-digit hex", () => {
    expect(shade("#808080", 0.5)).toBe("#404040");
    expect(shade("#ffffff", 1)).toBe("#ffffff");
    expect(shade("#ff0000", 0)).toBe("#000000");
  });
});
