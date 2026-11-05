import { describe, expect, it } from "vitest";
import { chair } from "@/data/catalog";

describe("chair catalog", () => {
  it("stores every price as a non-negative integer number of centavos", () => {
    const prices = [
      chair.basePrice,
      ...chair.options.flatMap((o) => (o.kind === "toggle" ? [o.price] : o.choices.map((c) => c.price))),
    ];
    for (const p of prices) expect(Number.isSafeInteger(p) && p >= 0).toBe(true);
  });

  it("has unique option ids and choice ids, and every default is a real choice", () => {
    const ids = chair.options.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const o of chair.options) {
      if (o.kind !== "choice") continue;
      const choiceIds = o.choices.map((c) => c.id);
      expect(new Set(choiceIds).size).toBe(choiceIds.length);
      expect(choiceIds).toContain(o.default);
    }
  });
});
