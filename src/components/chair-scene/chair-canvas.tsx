"use client";

import { useMemo, useRef, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import type { ChairConfig } from "@/data/catalog";
import { CAMERA_PRESETS, CONTROL_LIMITS } from "@/components/chair-scene/camera-presets";
import { ChairModel } from "@/components/chair-scene/chair-model";
import { Hotspots } from "@/components/chair-scene/hotspots";
import type { Hotspot } from "@/components/chair-scene/hotspots-data";
import { chairMaterials } from "@/components/chair-scene/materials";
import { CameraRig, CaptureBridge, type CameraGoal, type PresetRequest } from "@/components/chair-scene/scene-rig";

export interface ChairCanvasProps {
  config: ChairConfig;
  reducedMotion: boolean;
  /** Auto-spin; the stage turns it off for reduced motion and after the first interaction. */
  spinning: boolean;
  preset: PresetRequest;
  showHotspots: boolean;
  hotspotPortal: RefObject<HTMLElement | null>;
  captureRef: RefObject<(() => HTMLCanvasElement) | null>;
  onHotspot: (hotspot: Hotspot) => void;
  onInteract: () => void;
  onReady: () => void;
  onContextLost: () => void;
}

const HERO = CAMERA_PRESETS.hero;

/** Default export so the stage can lazy-load three/R3F/drei as one chunk. */
export default function ChairCanvas({
  config,
  reducedMotion,
  spinning,
  preset,
  showHotspots,
  hotspotPortal,
  captureRef,
  onHotspot,
  onInteract,
  onReady,
  onContextLost,
}: ChairCanvasProps) {
  const materials = useMemo(() => chairMaterials(config), [config]);
  const goalRef = useRef<CameraGoal | null>(null);
  const animateRgb = Boolean(materials.rgb) && !reducedMotion;

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [...HERO.position], fov: 35 }}
      // Continuous frames only for spin / RGB pulse; otherwise render on change (camera moves invalidate themselves).
      frameloop={spinning || animateRgb ? "always" : "demand"}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          (event) => {
            event.preventDefault();
            onContextLost();
          },
          { once: true },
        );
        onReady();
      }}
    >
      <hemisphereLight intensity={0.45} groundColor="#0b0c10" />
      <directionalLight position={[2.5, 4, 3]} intensity={2.2} />
      <directionalLight position={[-3, 2, -2.5]} intensity={0.9} color="#a9b8ff" />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2} position={[0, 3, 2]} scale={[4, 1, 1]} />
        <Lightformer intensity={1.2} position={[-3, 1, 0]} rotation-y={Math.PI / 2} scale={[3, 2, 1]} />
        <Lightformer intensity={0.8} position={[3, 1, -1]} rotation-y={-Math.PI / 2} scale={[3, 2, 1]} />
      </Environment>

      <ChairModel materials={materials} lumbar={config.lumbar} animateRgb={animateRgb} />
      <ContactShadows
        key={materials.base.racing ? "racing" : "star"}
        position={[0, 0.001, 0]}
        opacity={0.65}
        scale={2.4}
        blur={2.4}
        far={1.2}
        resolution={512}
        frames={1}
      />
      {showHotspots && <Hotspots portal={hotspotPortal} onSelect={onHotspot} />}

      <OrbitControls
        makeDefault
        target={[...HERO.target]}
        enablePan={false}
        {...CONTROL_LIMITS}
        enableDamping={!reducedMotion}
        autoRotate={spinning}
        autoRotateSpeed={0.8}
        onStart={() => {
          goalRef.current = null;
          onInteract();
        }}
      />
      <CameraRig request={preset} goalRef={goalRef} instant={reducedMotion} />
      <CaptureBridge captureRef={captureRef} />
    </Canvas>
  );
}
