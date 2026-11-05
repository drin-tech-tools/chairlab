import { describe, expect, it } from "vitest";
import { chair } from "@/data/catalog";
import { CAMERA_PRESETS, CONTROL_LIMITS, orbitOf, PRESET_ORDER } from "@/components/chair-scene/camera-presets";
import { HOTSPOTS } from "@/components/chair-scene/hotspots-data";

describe("camera presets", () => {
  it("lists Hero, Side, Detail, Base in order", () => {
    expect(PRESET_ORDER.map((id) => CAMERA_PRESETS[id].label)).toEqual(["Hero", "Side", "Detail", "Base"]);
  });

  it.each(PRESET_ORDER)("%s sits inside the orbit limits, so controls never snap it", (id) => {
    const { distance, polar } = orbitOf(CAMERA_PRESETS[id]);
    expect(distance).toBeGreaterThanOrEqual(CONTROL_LIMITS.minDistance);
    expect(distance).toBeLessThanOrEqual(CONTROL_LIMITS.maxDistance);
    expect(polar).toBeGreaterThanOrEqual(CONTROL_LIMITS.minPolarAngle);
    expect(polar).toBeLessThanOrEqual(CONTROL_LIMITS.maxPolarAngle);
  });
});

describe("hotspots", () => {
  const optionIds = chair.options.map((o) => o.id as string);

  it("each points at a real catalog option and a real preset", () => {
    for (const h of HOTSPOTS) {
      expect(optionIds).toContain(h.option);
      expect(PRESET_ORDER).toContain(h.preset);
    }
  });

  it("has unique options", () => {
    expect(new Set(HOTSPOTS.map((h) => h.option)).size).toBe(HOTSPOTS.length);
  });
});
