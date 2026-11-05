import { z } from "zod";
import type { AnyConfig, ConfigOf, Option, Product } from "@/lib/configurator/types";

export function optionSchema(option: Option) {
  return option.kind === "toggle"
    ? z.boolean()
    : z.enum(option.choices.map((c) => c.id) as [string, ...string[]]);
}

/** Strict schema for trust boundaries (API bodies, stored rows): every key, nothing extra. */
export function configSchema<P extends Product>(product: P) {
  const shape = Object.fromEntries(product.options.map((o) => [o.id, optionSchema(o)]));
  return z.strictObject(shape) as unknown as z.ZodType<ConfigOf<P>>;
}

export function defaultConfig<P extends Product>(product: P): ConfigOf<P> {
  const config: AnyConfig = Object.fromEntries(product.options.map((o) => [o.id, o.default]));
  return config as ConfigOf<P>;
}

/**
 * Lenient: untrusted or stale input (URL params, stored rows that predate catalog changes).
 * Each invalid or missing field falls back to its default; unknown keys are dropped.
 */
export function coerceConfig<P extends Product>(product: P, raw: unknown): ConfigOf<P> {
  const source = raw !== null && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const config: AnyConfig = {};
  for (const option of product.options) {
    const value = Object.hasOwn(source, option.id) ? source[option.id] : undefined;
    const parsed = optionSchema(option).safeParse(value);
    config[option.id] = parsed.success ? parsed.data : option.default;
  }
  return config as ConfigOf<P>;
}
