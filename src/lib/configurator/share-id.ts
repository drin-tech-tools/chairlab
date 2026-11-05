import type { ConfigOf, Product } from "@/lib/configurator/types";
import { encodeConfig } from "@/lib/configurator/url";

export const SHARE_ID_LENGTH = 10;
export const SHARE_ID_PATTERN = /^[A-Za-z0-9_-]{10}$/;

/**
 * Content-addressed short id: base64url(SHA-256(product + canonical query)), first 10 chars (60 bits).
 * Same build -> same id, so saves are idempotent and the table is bounded by the catalog's
 * combinations (9,600 for the chair), which makes the public POST endpoint spam-proof.
 */
export async function shareId<P extends Product>(product: P, config: ConfigOf<P>): Promise<string> {
  const canonical = `${product.id}?${encodeConfig(product, config)}`;
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical)));
  const base64 = btoa(String.fromCharCode(...digest));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").slice(0, SHARE_ID_LENGTH);
}
