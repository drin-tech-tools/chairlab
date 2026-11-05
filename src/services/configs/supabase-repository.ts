import type { ConfigRepository, SavedConfig } from "@/services/configs/repository";

interface ConfigRow {
  id: string;
  product_id: string;
  config: Record<string, unknown>;
  total_centavos: number;
  created_at: string;
}

const COLUMNS = "id,product_id,config,total_centavos,created_at";

/**
 * PostgREST over fetch (no supabase-js needed for two calls). Server-only: uses the service-role key,
 * which bypasses RLS; the table itself grants nothing to anon/authenticated.
 */
export function createSupabaseRepository({
  url,
  serviceRoleKey,
  fetch: request = fetch,
}: {
  url: string;
  serviceRoleKey: string;
  fetch?: typeof fetch;
}): ConfigRepository {
  const endpoint = `${url.replace(/\/+$/, "")}/rest/v1/configs`;
  const headers: Record<string, string> = { apikey: serviceRoleKey, "Content-Type": "application/json" };
  // New `sb_secret_…` keys go in `apikey` only; legacy service_role JWTs also need the Bearer header.
  if (serviceRoleKey.split(".").length === 3) headers.Authorization = `Bearer ${serviceRoleKey}`;

  return {
    async save(record) {
      const res = await request(`${endpoint}?on_conflict=id`, {
        method: "POST",
        headers: { ...headers, Prefer: "resolution=ignore-duplicates,return=minimal" },
        body: JSON.stringify({
          id: record.id,
          product_id: record.productId,
          config: record.config,
          total_centavos: record.totalCentavos,
        }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Supabase save failed with HTTP ${res.status}`);
    },

    async get(id): Promise<SavedConfig | null> {
      const res = await request(`${endpoint}?id=eq.${encodeURIComponent(id)}&select=${COLUMNS}&limit=1`, {
        headers,
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Supabase get failed with HTTP ${res.status}`);
      const [row] = (await res.json()) as ConfigRow[];
      return row
        ? {
            id: row.id,
            productId: row.product_id,
            config: row.config,
            totalCentavos: row.total_centavos,
            createdAt: row.created_at,
          }
        : null;
    },
  };
}
