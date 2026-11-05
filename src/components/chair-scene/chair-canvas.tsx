"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import type { ChairConfig } from "@/data/catalog";
import { ChairModel } from "@/components/chair-scene/chair-model";
import { chairMaterials } from "@/components/chair-scene/materials";

export interface ChairCanvasProps {
  config: ChairConfig;
  /** Off under prefers-reduced-motion. Also stops for good once the visitor grabs the chair. */
  autoRotate: boolean;
  onReady: () => void;
  onContextLost: () => void;
}

const TARGET: [number, number, number] = [0, 0.66, 0];

/** Default export so the stage can lazy-load three/R3F/drei as one chunk. */
export default function ChairCanvas({ config, autoRotate, onReady, onContextLost }: ChairCanvasProps) {
  const materials = useMemo(() => chairMaterials(config), [config]);
  const [grabbed, setGrabbed] = useState(false);
  const spinning = autoRotate && !grabbed;

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [1.8, 1.3, 2.5], fov: 35 }}
      // Render continuously only while spinning; otherwise only when something changes.
      frameloop={spinning ? "always" : "demand"}
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

      <ChairModel materials={materials} lumbar={config.lumbar} />
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

      <OrbitControls
        makeDefault
        target={TARGET}
        enablePan={false}
        minDistance={1.5}
        maxDistance={4.5}
        minPolarAngle={0.35}
        maxPolarAngle={1.45}
        enableDamping={autoRotate}
        autoRotate={spinning}
        autoRotateSpeed={0.8}
        onStart={() => setGrabbed(true)}
      />
    </Canvas>
  );
}
