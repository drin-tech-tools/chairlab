"use client";

import { Component, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useConfigurator } from "@/components/configurator/configurator-provider";
import { describeChair, FlatChair } from "@/components/chair-scene/flat-chair";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

// three + R3F + drei load only on the client, after hydration, and only when WebGL exists.
const ChairCanvas = dynamic(() => import("@/components/chair-scene/chair-canvas"), { ssr: false });

let webglSupport: boolean | undefined;
function detectWebGL(): boolean {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}
const noopSubscribe = () => () => {};

class SceneErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const FLAT_PADDING = "px-4 pt-14 pb-8 lg:p-16";

/**
 * 3D chair when possible; the flat SVG while it loads, and as the fallback
 * when WebGL is missing, the chunk/scene throws, or the GPU context is lost.
 */
export function ChairStage() {
  const config = useConfigurator((s) => s.config);
  const reducedMotion = usePrefersReducedMotion();
  const webgl = useSyncExternalStore(noopSubscribe, detectWebGL, () => null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  const mode = failed || webgl === false ? "fallback" : webgl ? "webgl" : "pending";
  const showCanvas = mode === "webgl";
  const showFlat = !showCanvas || !ready;

  return (
    <>
      <div
        data-testid="chair-stage"
        data-mode={mode}
        data-ready={String(showCanvas && ready)}
        data-autorotate={String(!reducedMotion)}
        role="img"
        aria-label={describeChair(config)}
        className="absolute inset-0"
      >
        {showFlat && (
          <div className={cn("absolute inset-0 flex items-center justify-center", FLAT_PADDING)}>
            <FlatChair />
          </div>
        )}
        {showCanvas && (
          <SceneErrorBoundary onError={() => setFailed(true)}>
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none",
                ready ? "opacity-100" : "opacity-0",
              )}
            >
              <ChairCanvas
                config={config}
                autoRotate={!reducedMotion}
                onReady={() => setReady(true)}
                onContextLost={() => setFailed(true)}
              />
            </div>
          </SceneErrorBoundary>
        )}
      </div>
      <p
        role="status"
        aria-label="3D view"
        className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 text-xs text-muted-foreground lg:bottom-8"
      >
        {showCanvas && !ready ? "Loading 3D view" : ""}
      </p>
    </>
  );
}
