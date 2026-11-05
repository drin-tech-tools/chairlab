"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronUp, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chair } from "@/data/catalog";
import { formatCentavos, priceBreakdown } from "@/lib/configurator/price";
import { encodeConfig } from "@/lib/configurator/url";
import { useConfigurator } from "@/components/configurator/configurator-provider";

type CopyState = "idle" | "copied" | "error";

export function PriceBar() {
  const config = useConfigurator((s) => s.config);
  const price = useMemo(() => priceBreakdown(chair, config), [config]);
  const [copy, setCopy] = useState<CopyState>("idle");

  useEffect(() => {
    if (copy === "idle") return;
    const t = setTimeout(() => setCopy("idle"), 2500);
    return () => clearTimeout(t);
  }, [copy]);

  async function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}?${encodeConfig(chair, config)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopy("copied");
    } catch {
      setCopy("error");
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
          <Button size="lg" onClick={copyLink} className="h-11 px-4 active:scale-[0.98]">
            {copy === "copied" ? <Check aria-hidden /> : <Link2 aria-hidden />}
            Copy share link
          </Button>
          <p role="status" aria-label="Share link" className="min-h-4 text-xs text-muted-foreground">
            {copy === "copied" ? "Link copied" : copy === "error" ? "Copy failed. The address bar has your link." : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
