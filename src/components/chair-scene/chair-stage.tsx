"use client";

import { Component, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { chair, type ChairConfig } from "@/data/catalog";
import { formatCentavos, priceBreakdown } from "@/lib/configurator/price";
import { useConfigurator } from "@/components/configurator/configurator-provider";
import { CAMERA_PRESETS, PRESET_ORDER, type PresetId } from "@/components/chair-scene/camera-presets";
import { describeChair, FlatChair } from "@/components/chair-scene/flat-chair";
import type { Hotspot } from "@/components/chair-scene/hotspots-data";
import type { PresetRequest } from "@/components/chair-scene/scene-rig";
import { downloadSceneImage } from "@/components/chair-scene/screenshot";
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

/** Scroll the option's panel row into view and focus its selected (or first) input. */
function focusOption(optionId: string, smooth: boolean) {
  const row = document.getElementById(`option-${optionId}`);
  if (!row) return;
  row.scrollIntoView({ block: "nearest", behavior: smooth ? "smooth" : "auto" });
  (row.querySelector<HTMLInputElement>("input:checked") ?? row.querySelector("input"))?.focus({ preventScroll: true });
}

const imageName = (c: ChairConfig) => `chairlab-gt-${c.frame}-${c.color}-${c.base}.png`;

const FLAT_PADDING = "px-4 pt-14 pb-8 lg:p-16";
const GLASS = "bg-background/60 ring-1 ring-border backdrop-blur-md";

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
  const [interacted, setInteracted] = useState(false);
  const [preset, setPreset] = useState<PresetRequest>({ id: "hero", nonce: 0 });
  const hotspotLayer = useRef<HTMLDivElement>(null);
  const captureRef = useRef<(() => HTMLCanvasElement) | null>(null);

  const mode = failed || webgl === false ? "fallback" : webgl ? "webgl" : "pending";
  const showCanvas = mode === "webgl";
  const live = showCanvas && ready;
  const spinning = !reducedMotion && !interacted;

  function choosePreset(id: PresetId) {
    setInteracted(true);
    setPreset((p) => ({ id, nonce: p.nonce + 1 }));
  }

  function onHotspot(hotspot: Hotspot) {
    choosePreset(hotspot.preset);
    focusOption(hotspot.option, !reducedMotion);
  }

  function saveImage() {
    const frame = captureRef.current?.();
    if (!frame) return;
    downloadSceneImage(frame, {
      title: chair.name,
      subtitle: formatCentavos(priceBreakdown(chair, config).total),
      filename: imageName(config),
    });
  }

  return (
    <>
      <div
        data-testid="chair-stage"
        data-mode={mode}
        data-ready={String(live)}
        data-autorotate={String(spinning)}
        role="img"
        aria-label={describeChair(config)}
        className="absolute inset-0"
      >
        {!live && (
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
                reducedMotion={reducedMotion}
                spinning={spinning}
                preset={preset}
                showHotspots={ready}
                hotspotPortal={hotspotLayer}
                captureRef={captureRef}
                onHotspot={onHotspot}
                onInteract={() => setInteracted(true)}
                onReady={() => setReady(true)}
                onContextLost={() => setFailed(true)}
              />
            </div>
          </SceneErrorBoundary>
        )}
      </div>

      {/* Interactive overlays live outside role="img" so assistive tech can reach them. */}
      <div ref={hotspotLayer} className="pointer-events-none absolute inset-0 overflow-hidden" />

      {live && (
        <>
          <button
            type="button"
            onClick={saveImage}
            className={cn(
              "absolute top-3 right-4 z-10 inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] lg:top-5 lg:right-8",
              GLASS,
            )}
          >
            <Download aria-hidden className="size-3.5" />
            Save image
          </button>
          <div
            role="group"
            aria-label="Camera view"
            className={cn(
              // Phone: vertical stack on the right edge, clear of the chair and its hotspots. Desktop: bottom-center bar.
              "absolute top-1/2 right-3 z-10 flex -translate-y-1/2 flex-col gap-1 rounded-3xl p-1",
              "lg:top-auto lg:right-auto lg:bottom-6 lg:left-1/2 lg:-translate-x-1/2 lg:translate-y-0 lg:flex-row lg:rounded-full",
              GLASS,
            )}
          >
            {PRESET_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={preset.id === id}
                onClick={() => choosePreset(id)}
                className="h-8 rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
              >
                {CAMERA_PRESETS[id].label}
              </button>
            ))}
          </div>
        </>
      )}

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
