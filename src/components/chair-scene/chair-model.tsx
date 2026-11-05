"use client";

import { RoundedBox } from "@react-three/drei";
import type { ChairMaterials } from "@/components/chair-scene/materials";

// Procedural low-poly chair. Units ~ metres, floor at y=0, chair faces +z. Slots: docs/MODEL.md.
const LEG_COUNT = 5;
const ARM_PAD = "#2a2c33";
const PLASTIC = "#16171c";
const SLOT = "#0b0c10";

type Vec3 = [number, number, number];

function Upholstery({ m }: { m: ChairMaterials }) {
  return (
    <meshPhysicalMaterial
      color={m.upholstery.color}
      roughness={m.upholstery.roughness}
      clearcoat={m.upholstery.clearcoat}
      clearcoatRoughness={0.35}
    />
  );
}

function Frame({ m }: { m: ChairMaterials }) {
  return <meshStandardMaterial color={m.frame} roughness={0.45} metalness={0.3} />;
}

/** Rectangular seam of thin "thread" bars in the local XY plane. */
function Stitch({ width, height, position, color, rotation }: {
  width: number;
  height: number;
  position: Vec3;
  color: string;
  rotation?: Vec3;
}) {
  const t = 0.005;
  const bars: { size: Vec3; at: Vec3 }[] = [
    { size: [width, t, t], at: [0, height / 2, 0] },
    { size: [width, t, t], at: [0, -height / 2, 0] },
    { size: [t, height, t], at: [width / 2, 0, 0] },
    { size: [t, height, t], at: [-width / 2, 0, 0] },
  ];
  return (
    <group position={position} rotation={rotation}>
      {bars.map((bar, i) => (
        <mesh key={i} position={bar.at}>
          <boxGeometry args={bar.size} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Base({ m }: { m: ChairMaterials }) {
  const { racing } = m.base;
  const legMaterial = <meshStandardMaterial color={m.base.color} metalness={m.base.metalness} roughness={m.base.roughness} />;
  return (
    <group>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.06, 20]} />
        {legMaterial}
      </mesh>
      {Array.from({ length: LEG_COUNT }, (_, i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / LEG_COUNT, 0]}>
          <RoundedBox
            args={racing ? [0.06, 0.04, 0.34] : [0.045, 0.035, 0.34]}
            radius={racing ? 0.008 : 0.015}
            position={[0, 0.08, 0.17]}
            rotation={[0.1, 0, 0]}
            castShadow
          >
            {legMaterial}
          </RoundedBox>
          <mesh position={[0, 0.035, 0.33]} castShadow>
            <sphereGeometry args={[0.035, 16, 12]} />
            <meshStandardMaterial color={PLASTIC} roughness={0.6} />
          </mesh>
          <mesh position={[0.036, 0.035, 0.33]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.004, 12]} />
            <Frame m={m} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Backrest({ m, lumbar }: { m: ChairMaterials; lumbar: boolean }) {
  return (
    <group position={[0, 0.5, -0.24]} rotation={[-0.14, 0, 0]}>
      <RoundedBox args={[0.58, 0.86, 0.07]} radius={0.035} position={[0, 0.45, -0.045]} castShadow>
        <Frame m={m} />
      </RoundedBox>
      <RoundedBox args={[0.5, 0.82, 0.09]} radius={0.04} position={[0, 0.46, 0.02]} castShadow>
        <Upholstery m={m} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <RoundedBox key={side} args={[0.09, 0.62, 0.13]} radius={0.04} position={[side * 0.235, 0.36, 0.03]} castShadow>
          <Upholstery m={m} />
        </RoundedBox>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.12, 0.76, 0.025]}>
          <boxGeometry args={[0.06, 0.09, 0.1]} />
          <meshStandardMaterial color={SLOT} roughness={0.9} />
        </mesh>
      ))}
      <RoundedBox args={[0.26, 0.56, 0.02]} radius={0.008} position={[0, 0.38, 0.07]}>
        <Upholstery m={m} />
      </RoundedBox>
      <Stitch width={0.24} height={0.54} position={[0, 0.38, 0.081]} color={m.stitch} />
      <mesh position={[0, 0.66, 0.066]}>
        <boxGeometry args={[0.4, 0.005, 0.005]} />
        <meshStandardMaterial color={m.stitch} roughness={0.8} />
      </mesh>

      {lumbar && (
        <group>
          <RoundedBox args={[0.3, 0.13, 0.09]} radius={0.045} position={[0, 0.2, 0.11]} castShadow>
            <Upholstery m={m} />
          </RoundedBox>
          <Stitch width={0.24} height={0.08} position={[0, 0.2, 0.156]} color={m.stitch} />
        </group>
      )}

      {m.rgb && (
        <group>
          {[
            { size: [0.012, 0.8, 0.012] as Vec3, at: [-0.292, 0.45, -0.07] as Vec3 },
            { size: [0.012, 0.8, 0.012] as Vec3, at: [0.292, 0.45, -0.07] as Vec3 },
            { size: [0.58, 0.012, 0.012] as Vec3, at: [0, 0.885, -0.07] as Vec3 },
          ].map((strip, i) => (
            <mesh key={i} position={strip.at}>
              <boxGeometry args={strip.size} />
              <meshStandardMaterial color={m.rgb!} emissive={m.rgb!} emissiveIntensity={3} toneMapped={false} />
            </mesh>
          ))}
          <pointLight position={[0, 0.45, -0.3]} color={m.rgb} intensity={1.5} distance={1.6} />
        </group>
      )}
    </group>
  );
}

export function ChairModel({ materials: m, lumbar }: { materials: ChairMaterials; lumbar: boolean }) {
  return (
    <group>
      <Base m={m} />

      {/* Gas lift + mechanism */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.22, 16]} />
        <meshStandardMaterial color="#d6dadf" metalness={1} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.19, 0]} castShadow>
        <cylinderGeometry args={[0.034, 0.034, 0.12, 16]} />
        <meshStandardMaterial color={PLASTIC} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.22, 0.05, 0.22]} />
        <meshStandardMaterial color={PLASTIC} roughness={0.6} />
      </mesh>

      {/* Seat */}
      <RoundedBox args={[0.56, 0.05, 0.52]} radius={0.02} position={[0, 0.43, 0]} castShadow>
        <Frame m={m} />
      </RoundedBox>
      <RoundedBox args={[0.52, 0.09, 0.5]} radius={0.04} position={[0, 0.49, 0]} castShadow>
        <Upholstery m={m} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <RoundedBox key={side} args={[0.08, 0.06, 0.46]} radius={0.028} position={[side * 0.24, 0.55, 0]} castShadow>
          <Upholstery m={m} />
        </RoundedBox>
      ))}
      <Stitch width={0.3} height={0.36} position={[0, 0.537, 0.01]} rotation={[-Math.PI / 2, 0, 0]} color={m.stitch} />

      {/* Armrests */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.29, 0.4, 0]}>
            <boxGeometry args={[0.08, 0.03, 0.05]} />
            <Frame m={m} />
          </mesh>
          <mesh position={[side * 0.33, 0.52, 0]} castShadow>
            <boxGeometry args={[0.04, 0.24, 0.06]} />
            <Frame m={m} />
          </mesh>
          <RoundedBox args={[0.085, 0.035, 0.26]} radius={0.015} position={[side * 0.33, 0.655, 0.02]} castShadow>
            <meshStandardMaterial color={ARM_PAD} roughness={0.8} />
          </RoundedBox>
        </group>
      ))}

      <Backrest m={m} lumbar={lumbar} />
    </group>
  );
}
