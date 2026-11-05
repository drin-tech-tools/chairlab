import type { ConfigOf, Product } from "@/lib/configurator/types";

// All prices in integer centavos.
export const chair = {
  id: "chairlab-gt",
  name: "ChairLab GT",
  basePrice: 1_299_900,
  options: [
    {
      kind: "choice",
      id: "frame",
      label: "Frame",
      default: "black",
      choices: [
        { id: "black", label: "Midnight Black", price: 0, hex: "#121214" },
        { id: "white", label: "Arctic White", price: 0, hex: "#e8e8ec" },
        { id: "gunmetal", label: "Gunmetal", price: 0, hex: "#4a4f57" },
        { id: "crimson", label: "Crimson", price: 0, hex: "#b3122e" },
      ],
    },
    {
      kind: "choice",
      id: "material",
      label: "Upholstery",
      default: "fabric",
      choices: [
        { id: "fabric", label: "Breathable Fabric", price: 0 },
        { id: "leather", label: "PU Leather", price: 0 },
        { id: "premium", label: "Premium Leather", price: 250_000 },
      ],
    },
    {
      kind: "choice",
      id: "color",
      label: "Upholstery color",
      default: "onyx",
      choices: [
        { id: "onyx", label: "Onyx", price: 0, hex: "#1a1a1d" },
        { id: "slate", label: "Slate", price: 0, hex: "#3b3f46" },
        { id: "ivory", label: "Ivory", price: 0, hex: "#ece6da" },
        { id: "ember", label: "Ember Red", price: 0, hex: "#a51d2d" },
        { id: "cobalt", label: "Cobalt", price: 0, hex: "#1f4fbf" },
      ],
    },
    {
      kind: "choice",
      id: "stitching",
      label: "Stitching",
      default: "tonal",
      choices: [
        { id: "tonal", label: "Tonal", price: 0 },
        { id: "crimson", label: "Pro · Crimson", price: 30_000, hex: "#e0213f" },
        { id: "cyan", label: "Pro · Cyan", price: 30_000, hex: "#00d1ff" },
        { id: "volt", label: "Pro · Volt", price: 30_000, hex: "#b6ff00" },
        { id: "gold", label: "Pro · Gold", price: 30_000, hex: "#e8b923" },
      ],
    },
    {
      kind: "choice",
      id: "base",
      label: "Base",
      default: "star",
      choices: [
        { id: "star", label: "5-Star Nylon", price: 0 },
        { id: "racing", label: "Racing Aluminum", price: 80_000 },
      ],
    },
    { kind: "toggle", id: "lumbar", label: "Lumbar pillow", price: 49_900, default: false },
    { kind: "toggle", id: "rgb", label: "RGB strip", price: 120_000, default: false },
    {
      kind: "choice",
      id: "rgbColor",
      label: "RGB color",
      default: "cyan",
      choices: [
        { id: "cyan", label: "Cyan", price: 0, hex: "#00e5ff" },
        { id: "magenta", label: "Magenta", price: 0, hex: "#ff2bd6" },
        { id: "lime", label: "Lime", price: 0, hex: "#7cff00" },
        { id: "amber", label: "Amber", price: 0, hex: "#ffb000" },
      ],
    },
  ],
} as const satisfies Product;

export type ChairConfig = ConfigOf<typeof chair>;
