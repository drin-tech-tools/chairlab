import "server-only";
import { createMemoryRepository } from "@/services/configs/memory-repository";
import type { ConfigRepository, SavedConfig } from "@/services/configs/repository";
import { createSupabaseRepository } from "@/services/configs/supabase-repository";

// One Map per server process, shared by route handlers and pages (they may be bundled separately).
const globalStore = globalThis as typeof globalThis & { __chairlabConfigs?: Map<string, SavedConfig> };

/**
 * Supabase when configured. `CONFIG_STORE=memory` opts into the in-memory fake for tests and local dev,
 * and is refused on Vercel production so a misconfigured deploy fails loudly instead of losing data.
 */
export function getConfigRepository(): ConfigRepository {
  if (process.env.CONFIG_STORE === "memory") {
    if (process.env.VERCEL_ENV === "production") throw new Error("CONFIG_STORE=memory is not allowed in production");
    globalStore.__chairlabConfigs ??= new Map();
    return createMemoryRepository(globalStore.__chairlabConfigs);
  }
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Config store not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or CONFIG_STORE=memory locally)");
  }
  return createSupabaseRepository({ url, serviceRoleKey });
}
