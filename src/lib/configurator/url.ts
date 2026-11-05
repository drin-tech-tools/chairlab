import type { AnyConfig, ConfigOf, Product } from "@/lib/configurator/types";
import { coerceConfig } from "@/lib/configurator/validation";

/** Every option is written (not just non-defaults) so links survive default changes. */
export function encodeConfig<P extends Product>(product: P, config: ConfigOf<P>): string {
  const selected = config as unknown as AnyConfig;
  const params = new URLSearchParams();
  for (const option of product.options) {
    const value = selected[option.id];
    params.set(option.id, typeof value === "boolean" ? (value ? "1" : "0") : value);
  }
  return params.toString();
}

/** Lenient: untrusted input, each invalid or missing field falls back to its default; unknown keys are ignored. */
export function decodeConfig<P extends Product>(product: P, query: string | URLSearchParams): ConfigOf<P> {
  const params = typeof query === "string" ? new URLSearchParams(query) : query;
  const raw: Record<string, unknown> = {};
  for (const option of product.options) {
    const value = params.get(option.id);
    raw[option.id] = option.kind === "toggle" ? { "1": true, "0": false }[value ?? ""] : value;
  }
  return coerceConfig(product, raw);
}
