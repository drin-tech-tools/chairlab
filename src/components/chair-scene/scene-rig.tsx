"use client";

import { useEffect, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CAMERA_PRESETS, type PresetId } from "@/components/chair-scene/camera-presets";

export interface CameraGoal {
  position: Vector3;
  target: Vector3;
}

export interface PresetRequest {
  id: PresetId;
  /** Bumped on every click so re-selecting the same preset re-frames after a manual orbit. */
  nonce: number;
}

/** Eases camera + orbit target to the requested preset. The caller clears goalRef when the visitor grabs the chair. */
export function CameraRig({
  request,
  goalRef,
  instant,
}: {
  request: PresetRequest;
  goalRef: RefObject<CameraGoal | null>;
  instant: boolean;
}) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const preset = CAMERA_PRESETS[request.id];
    goalRef.current = { position: new Vector3(...preset.position), target: new Vector3(...preset.target) };
    invalidate();
  }, [request, goalRef, invalidate]);

  useFrame((_, delta) => {
    const goal = goalRef.current;
    if (!goal || !controls) return;
    // Clamp: after an idle "demand" period the first delta can be seconds long.
    const k = instant ? 1 : 1 - Math.exp(-5 * Math.min(delta, 1 / 30));
    camera.position.lerp(goal.position, k);
    controls.target.lerp(goal.target, k);
    controls.update();
    const settled = camera.position.distanceTo(goal.position) < 1e-3 && controls.target.distanceTo(goal.target) < 1e-3;
    if (settled) goalRef.current = null;
    else invalidate();
  });

  return null;
}

/** Renders a fresh frame on demand and hands back the WebGL canvas, so capture works without preserveDrawingBuffer. */
export function CaptureBridge({ captureRef }: { captureRef: RefObject<(() => HTMLCanvasElement) | null> }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    captureRef.current = () => {
      gl.render(scene, camera);
      return gl.domElement;
    };
    return () => {
      captureRef.current = null;
    };
  }, [gl, scene, camera, captureRef]);

  return null;
}
