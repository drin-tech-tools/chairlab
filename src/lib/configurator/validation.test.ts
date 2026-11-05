import { describe, expect, it } from "vitest";
import { chair } from "@/data/catalog";
import { configSchema, defaultConfig } from "@/lib/configurator/validation";

describe("configSchema", () => {
  const schema = configSchema(chair);

  it("accepts the default config", () => {
    expect(schema.safeParse(defaultConfig(chair)).success).toBe(true);
  });

  it("rejects unknown choices, wrong types, missing and extra keys", () => {
    const d = defaultConfig(chair);
    expect(schema.safeParse({ ...d, base: "hover" }).success).toBe(false);
    expect(schema.safeParse({ ...d, lumbar: "1" }).success).toBe(false);
    const missing: Partial<typeof d> = { ...d };
    delete missing.rgb;
    expect(schema.safeParse(missing).success).toBe(false);
    expect(schema.safeParse({ ...d, price: 1 }).success).toBe(false);
  });
});
