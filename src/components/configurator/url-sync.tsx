"use client";

import { useEffect } from "react";
import { chair } from "@/data/catalog";
import { encodeConfig } from "@/lib/configurator/url";
import { useConfigurator } from "@/components/configurator/configurator-provider";

/** Mirrors the config into the address bar so it is always the share link. */
export function UrlSync() {
  const config = useConfigurator((s) => s.config);
  useEffect(() => {
    const search = `?${encodeConfig(chair, config)}`;
    if (window.location.search !== search) window.history.replaceState(null, "", search);
  }, [config]);
  return null;
}
