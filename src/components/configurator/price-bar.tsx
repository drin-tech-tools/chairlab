"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronUp, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chair, type ChairConfig } from "@/data/catalog";
import { formatCentavos, priceBreakdown } from "@/lib/configurator/price";
import { encodeConfig } from "@/lib/configurator/url";
import { useConfigurator } from "@/components/configurator/configurator-provider";

type ShareState = "idle" | "working" | "short" | "long" | "error";

const SHARE_MESSAGE: Record<ShareState, string> = {
  idle: "",
  working: "",
  short: "Short link copied",
  long: "Link copied",
  error: "Copy failed. The address bar has your link.",
};

/** Save the build for a short `/b/<id>` link; fall back to the long query URL if the store is unreachable. */
async function resolveShareUrl(config: ChairConfig): Promise<{ url: string; short: boolean }> {
  const { origin } = window.location;
  try {
    const res = await fetch("/api/configs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config }),
    });
    if (res.ok) {
      const { path } = (await res.json()) as { path: string };
      return { url: `${origin}${path}`, short: true };
    }
  } catch {
    // Offline or store down: the long URL still restores the build.
  }
  return { url: `${origin}/?${encodeConfig(chair, config)}`, short: false };
}

export function PriceBar() {
  const config = useConfigurator((s) => s.config);
  const price = useMemo(() => priceBreakdown(chair, config), [config]);
  const [share, setShare] = useState<ShareState>("idle");

  useEffect(() => {
    if (share === "idle" || share === "working") return;
    const t = setTimeout(() => setShare("idle"), 2500);
    return () => clearTimeout(t);
  }, [share]);

  async function copyLink() {
    setShare("working");
    const result = resolveShareUrl(config);
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
        // Start the clipboard write inside the click (Safari drops the permission after an await) with the text pending.
        const blob = result.then(({ url }) => new Blob([url], { type: "text/plain" }));
        await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]);
      } else {
        await navigator.clipboard.writeText((await result).url);
      }
      setShare((await result).short ? "short" : "long");
    } catch {
      setShare("error");
    }
  }

  return (
    <div className="border-t border-border bg-card/95 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur lg:px-8">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-1 py-1 text-xs text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
          Price breakdown
          <ChevronUp aria-hidden className="size-3.5 transition-transform group-open:rotate-180" />
        </summary>
        <dl data-testid="price-breakdown" className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 py-2 text-sm">
          <dt>{chair.name}</dt>
          <dd className="text-right tabular-nums">{formatCentavos(price.base)}</dd>
          {price.lines.map((line) => (
            <div key={line.optionId} className="contents">
              <dt className="text-muted-foreground">{line.label}</dt>
              <dd className="text-right tabular-nums">+{formatCentavos(line.amount)}</dd>
            </div>
          ))}
        </dl>
      </details>

      <div className="flex items-end justify-between gap-4 pt-1">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p data-testid="price-total" aria-live="polite" className="text-2xl font-semibold tracking-tight tabular-nums">
            {formatCentavos(price.total)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            size="lg"
            onClick={copyLink}
            disabled={share === "working"}
            aria-busy={share === "working"}
            className="h-11 px-4 active:scale-[0.98]"
          >
            {share === "short" || share === "long" ? <Check aria-hidden /> : <Link2 aria-hidden />}
            Copy share link
          </Button>
          <p role="status" aria-label="Share link" className="min-h-4 text-xs text-muted-foreground">
            {SHARE_MESSAGE[share]}
          </p>
        </div>
      </div>
    </div>
  );
}
