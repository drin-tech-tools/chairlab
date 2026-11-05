/** A saved build. `config` is stored as-is; callers coerce it against the current catalog. */
export interface SavedConfig {
  id: string;
  productId: string;
  config: Record<string, unknown>;
  /** Price snapshot at save time, integer centavos. Display prices are recomputed from the catalog. */
  totalCentavos: number;
  createdAt: string;
}

export type NewConfig = Omit<SavedConfig, "createdAt">;

/** Storage port. Adapters: Supabase (production) and in-memory (tests / local dev). */
export interface ConfigRepository {
  /** Idempotent: saving an existing id is a no-op. */
  save(record: NewConfig): Promise<void>;
  get(id: string): Promise<SavedConfig | null>;
}
