import { create } from "zustand";
import { chair, type ChairConfig } from "@/data/catalog";
import { defaultConfig } from "@/lib/configurator/validation";

interface ConfiguratorState {
  config: ChairConfig;
  setOption: <K extends keyof ChairConfig>(key: K, value: ChairConfig[K]) => void;
  /** Replace the whole config, e.g. after decoding a share URL. Callers validate first. */
  load: (config: ChairConfig) => void;
  reset: () => void;
}

export const useConfigurator = create<ConfiguratorState>()((set) => ({
  config: defaultConfig(chair),
  setOption: (key, value) => set((s) => ({ config: { ...s.config, [key]: value } })),
  load: (config) => set({ config: { ...config } }),
  reset: () => set({ config: defaultConfig(chair) }),
}));
