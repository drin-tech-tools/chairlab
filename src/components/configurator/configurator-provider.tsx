"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import type { ChairConfig } from "@/data/catalog";
import { createConfiguratorStore, type ConfiguratorState, type ConfiguratorStore } from "@/stores/configurator";

const StoreContext = createContext<ConfiguratorStore | null>(null);

export function ConfiguratorProvider({ initialConfig, children }: { initialConfig: ChairConfig; children: ReactNode }) {
  const [store] = useState(() => createConfiguratorStore(initialConfig));
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useConfigurator<T>(selector: (state: ConfiguratorState) => T): T {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useConfigurator must be used inside <ConfiguratorProvider>");
  return useStore(store, selector);
}
