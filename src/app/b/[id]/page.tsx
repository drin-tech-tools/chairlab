import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Configurator, ConfiguratorLayout } from "@/components/configurator/configurator-shell";
import { loadSavedChair } from "@/services/configs/api";
import { getConfigRepository } from "@/services/configs/store";

export const metadata: Metadata = {
  title: "Saved build | ChairLab",
  description: "A ChairLab GT gaming chair build. Open it to orbit in 3D, tweak it and share your own.",
};

export default function SavedBuild({ params }: PageProps<"/b/[id]">) {
  return (
    <ConfiguratorLayout>
      <FromStore params={params} />
    </ConfiguratorLayout>
  );
}

async function FromStore({ params }: Pick<PageProps<"/b/[id]">, "params">) {
  const { id } = await params;
  // Same server process as the API: read the store directly instead of calling our own HTTP endpoint.
  const saved = await loadSavedChair(id, getConfigRepository());
  if (!saved) notFound();
  return <Configurator initialConfig={saved.config} savedId={saved.id} />;
}
