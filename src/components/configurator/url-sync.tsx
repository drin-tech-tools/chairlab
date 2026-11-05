"use client";

import { useEffect, useState } from "react";
import { chair } from "@/data/catalog";
import { encodeConfig } from "@/lib/configurator/url";
import { useConfigurator } from "@/components/configurator/configurator-provider";

/**
 * Mirrors the config into the address bar so it is always a share link.
 * On a saved build (`/b/<id>`) the short URL stays until the visitor changes something.
 */
export function UrlSync({ savedId }: { savedId?: string }) {
  const config = useConfigurator((s) => s.config);
  const [initialQuery] = useState(() => encodeConfig(chair, config));

  useEffect(() => {
    const query = encodeConfig(chair, config);
    const next = savedId && query === initialQuery ? `/b/${savedId}` : `/?${query}`;
    if (window.location.pathname + window.location.search !== next) window.history.replaceState(null, "", next);
  }, [config, savedId, initialQuery]);

  return null;
}
