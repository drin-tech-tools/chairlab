import { Suspense } from "react";
import { ChairStage } from "@/components/chair-scene/chair-stage";
import { ConfiguratorProvider } from "@/components/configurator/configurator-provider";
import { OptionPanel } from "@/components/configurator/option-panel";
import { PriceBar } from "@/components/configurator/price-bar";
import { UrlSync } from "@/components/configurator/url-sync";
import { chair } from "@/data/catalog";
import { decodeConfig } from "@/lib/configurator/url";

const STAGE =
  "relative bg-[radial-gradient(ellipse_at_50%_45%,oklch(0.25_0.02_265),var(--background)_70%)]";
const SHEET =
  "relative -mt-5 flex min-h-0 flex-col rounded-t-3xl border-t border-border bg-card lg:mt-0 lg:rounded-none lg:border-t-0 lg:border-l";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="relative grid h-[100dvh] grid-rows-[minmax(0,42fr)_minmax(0,58fr)] overflow-hidden lg:grid-cols-[minmax(0,1fr)_420px] lg:grid-rows-1">
      <h1 className="absolute top-4 left-4 z-10 text-lg font-semibold tracking-tight lg:top-6 lg:left-8">ChairLab</h1>
      {/* Static shell + skeleton prerender; the config for this URL streams in the same response. */}
      <Suspense fallback={<ConfiguratorSkeleton />}>
        <Configurator searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Configurator({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) params.set(key, first);
  }

  return (
    <ConfiguratorProvider initialConfig={decodeConfig(chair, params)}>
      <UrlSync />
      <section aria-label="Chair preview" className={STAGE}>
        <ChairStage />
      </section>
      <aside aria-label="Configure your chair" className={SHEET}>
        <SheetHandle />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-4 lg:px-8 lg:pt-8">
          <h2 className="text-xl font-semibold tracking-tight lg:text-2xl">Build your {chair.name}</h2>
          <OptionPanel />
        </div>
        <PriceBar />
      </aside>
    </ConfiguratorProvider>
  );
}

function SheetHandle() {
  return <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-muted lg:hidden" />;
}

function ConfiguratorSkeleton() {
  return (
    <>
      <section aria-label="Loading chair preview" aria-busy className={STAGE}>
        <div className="flex h-full items-center justify-center px-4 pt-14 pb-8 lg:p-16">
          <div className="aspect-[5/7] h-full max-h-full animate-pulse rounded-3xl bg-muted/40 motion-reduce:animate-none" />
        </div>
      </section>
      <aside aria-label="Loading options" aria-busy className={SHEET}>
        <SheetHandle />
        <div className="space-y-6 px-5 pt-4 lg:px-8 lg:pt-8">
          <div className="h-7 w-2/3 rounded-md bg-muted" />
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="flex gap-3">
                {Array.from({ length: 4 }, (_, j) => (
                  <div key={j} className="size-10 rounded-full bg-muted motion-safe:animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
