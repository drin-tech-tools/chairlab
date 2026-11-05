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
