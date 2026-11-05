import type { ChairConfig } from "@/data/catalog";
import type { PresetId, Vec3 } from "@/components/chair-scene/camera-presets";

export interface Hotspot {
  option: keyof ChairConfig;
  label: string;
  /** World position on the procedural model (docs/MODEL.md). */
  position: Vec3;
  preset: PresetId;
}

export const HOTSPOTS = [
  { option: "frame", label: "Frame", position: [0.33, 0.7, 0.12], preset: "hero" },
  { option: "color", label: "Upholstery", position: [-0.12, 0.56, 0.14], preset: "hero" },
  { option: "stitching", label: "Stitching", position: [0.1, 1, -0.22], preset: "detail" },
  { option: "lumbar", label: "Lumbar pillow", position: [0, 0.72, -0.1], preset: "detail" },
  { option: "rgb", label: "RGB strip", position: [0.29, 1.33, -0.43], preset: "side" },
  { option: "base", label: "Base", position: [0, 0.1, 0.26], preset: "base" },
] as const satisfies readonly Hotspot[];
