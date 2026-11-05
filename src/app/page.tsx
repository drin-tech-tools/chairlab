import { Configurator, ConfiguratorLayout } from "@/components/configurator/configurator-shell";
import { chair } from "@/data/catalog";
import { decodeConfig } from "@/lib/configurator/url";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <ConfiguratorLayout>
      <FromQuery searchParams={searchParams} />
    </ConfiguratorLayout>
  );
}

async function FromQuery({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) params.set(key, first);
  }
  return <Configurator initialConfig={decodeConfig(chair, params)} />;
}
