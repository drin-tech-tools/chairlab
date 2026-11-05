import { chair, type ChairConfig } from "@/data/catalog";
import { getChoice } from "@/lib/configurator/choice";

/** Multiply each RGB channel of a #rrggbb color by `factor` (0..1). */
export function shade(hex: string, factor: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const channel = (shift: number) => Math.round(((n >> shift) & 0xff) * factor);
  return `#${[16, 8, 0].map((s) => channel(s).toString(16).padStart(2, "0")).join("")}`;
}

const FINISH = {
  fabric: { roughness: 0.95, clearcoat: 0 },
  leather: { roughness: 0.5, clearcoat: 0.25 },
  premium: { roughness: 0.32, clearcoat: 0.7 },
} as const;

export interface ChairMaterials {
  frame: string;
  upholstery: { color: string; roughness: number; clearcoat: number };
  stitch: string;
  base: { color: string; metalness: number; roughness: number; racing: boolean };
  /** Emissive strip color, or null when the RGB strip is off. */
  rgb: string | null;
}

/** Store config -> render material slots. Shared by the 3D model and the flat fallback (see docs/MODEL.md). */
export function chairMaterials(config: ChairConfig): ChairMaterials {
  const hex = (id: keyof ChairConfig) => getChoice(chair, id, String(config[id])).hex;
  const upholstery = hex("color") ?? "#1a1a1d";
  const racing = config.base === "racing";

  return {
    frame: hex("frame") ?? "#121214",
    upholstery: { color: upholstery, ...FINISH[config.material] },
    stitch: hex("stitching") ?? shade(upholstery, 0.65),
    base: racing
      ? { color: "#c9ced4", metalness: 1, roughness: 0.25, racing }
      : { color: "#34363e", metalness: 0, roughness: 0.7, racing },
    rgb: config.rgb ? (hex("rgbColor") ?? null) : null,
  };
}
