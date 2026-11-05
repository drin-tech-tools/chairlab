import { createStore } from "zustand/vanilla";
import { chair, type ChairConfig } from "@/data/catalog";
import { defaultConfig } from "@/lib/configurator/validation";

export interface ConfiguratorState {
  config: ChairConfig;
  setOption: <K extends keyof ChairConfig>(key: K, value: ChairConfig[K]) => void;
  /** Replace the whole config. Callers validate first. */
  load: (config: ChairConfig) => void;
  reset: () => void;
}

export type ConfiguratorStore = ReturnType<typeof createConfiguratorStore>;

/**
 * One store per request/tree (not a module singleton) so SSR never leaks one
 * visitor's config into another's render. See ConfiguratorProvider.
 */
export function createConfiguratorStore(initial: ChairConfig = defaultConfig(chair)) {
  return createStore<ConfiguratorState>()((set) => ({
    config: { ...initial },
    setOption: (key, value) => set((s) => ({ config: { ...s.config, [key]: value } })),
    load: (config) => set({ config: { ...config } }),
    reset: () => set({ config: defaultConfig(chair) }),
  }));
}
