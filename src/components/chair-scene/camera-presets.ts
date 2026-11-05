export type Vec3 = readonly [number, number, number];

export interface CameraPreset {
  label: string;
  position: Vec3;
  target: Vec3;
}

/** OrbitControls limits. Presets must sit inside these or the controls would snap them. */
export const CONTROL_LIMITS = {
  minDistance: 1,
  maxDistance: 4.5,
  minPolarAngle: 0.35,
  maxPolarAngle: 1.45,
} as const;

export const CAMERA_PRESETS = {
  hero: { label: "Hero", position: [1.8, 1.3, 2.5], target: [0, 0.66, 0] },
  side: { label: "Side", position: [3, 1.05, 0], target: [0, 0.62, 0] },
  detail: { label: "Detail", position: [0.75, 1.2, 1.55], target: [0, 0.92, -0.2] },
  base: { label: "Base", position: [1.1, 0.5, 1.3], target: [0, 0.15, 0] },
} as const satisfies Record<string, CameraPreset>;

export type PresetId = keyof typeof CAMERA_PRESETS;

export const PRESET_ORDER: readonly PresetId[] = ["hero", "side", "detail", "base"];

/** Distance and polar angle (from +y) of the camera around its target. */
export function orbitOf({ position, target }: CameraPreset) {
  const [dx, dy, dz] = position.map((v, i) => v - target[i]);
  const distance = Math.hypot(dx, dy, dz);
  return { distance, polar: Math.acos(dy / distance) };
}
