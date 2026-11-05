import type { AnyConfig, ConfigOf, Product } from "@/lib/configurator/types";
import { optionSchema } from "@/lib/configurator/validation";

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
  const config: AnyConfig = {};
  for (const option of product.options) {
    const raw = params.get(option.id);
    const value = option.kind === "toggle" ? { "1": true, "0": false }[raw ?? ""] : raw;
    const parsed = optionSchema(option).safeParse(value);
    config[option.id] = parsed.success ? parsed.data : option.default;
  }
  return config as ConfigOf<P>;
}
