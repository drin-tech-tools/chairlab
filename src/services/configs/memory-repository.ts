import type { ConfigRepository, SavedConfig } from "@/services/configs/repository";

// ponytail: process-local Map; data is lost on restart and not shared across instances. Tests/local dev only.
export function createMemoryRepository(rows = new Map<string, SavedConfig>()): ConfigRepository {
  return {
    async save(record) {
      if (!rows.has(record.id)) rows.set(record.id, structuredClone({ ...record, createdAt: new Date().toISOString() }));
    },
    async get(id) {
      const row = rows.get(id);
      return row ? structuredClone(row) : null;
    },
  };
}
