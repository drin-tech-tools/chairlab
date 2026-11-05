import { describe, expect, it } from "vitest";
import { chair } from "@/data/catalog";
import { getChoice } from "@/lib/configurator/choice";

describe("getChoice", () => {
  it("returns the catalog entry", () => {
    expect(getChoice(chair, "base", "racing")).toMatchObject({ label: "Racing Aluminum", price: 80_000 });
  });

  it("throws for unknown options, unknown choices and toggles", () => {
    expect(() => getChoice(chair, "wheels", "x")).toThrow();
    expect(() => getChoice(chair, "base", "hover")).toThrow();
    expect(() => getChoice(chair, "lumbar", "1")).toThrow();
  });
});
