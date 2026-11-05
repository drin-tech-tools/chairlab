"use client";

import type { RefObject } from "react";
import { Html } from "@react-three/drei";
import { HOTSPOTS, type Hotspot } from "@/components/chair-scene/hotspots-data";

/** DOM buttons pinned to 3D points; portalled outside the stage's role="img" so they stay accessible. */
export function Hotspots({
  portal,
  onSelect,
}: {
  portal: RefObject<HTMLElement | null>;
  onSelect: (hotspot: Hotspot) => void;
}) {
  return HOTSPOTS.map((hotspot) => (
    <Html
      key={hotspot.option}
      position={[...hotspot.position]}
      center
      portal={portal as RefObject<HTMLElement>}
      zIndexRange={[5, 0]}
    >
      <button
        type="button"
        aria-label={`Edit ${hotspot.label}`}
        title={hotspot.label}
        onClick={() => onSelect(hotspot)}
        className="pointer-events-auto grid size-7 cursor-pointer place-items-center rounded-full bg-background/70 ring-1 ring-white/30 backdrop-blur-sm transition-transform hover:scale-110 hover:ring-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span aria-hidden className="size-2 rounded-full bg-primary motion-safe:animate-pulse" />
      </button>
    </Html>
  ));
}
