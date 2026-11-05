import { beforeEach, describe, expect, it } from "vitest";
import { chair } from "@/data/catalog";
import { defaultConfig } from "@/lib/configurator/validation";
import { useConfigurator } from "@/stores/configurator";

const store = useConfigurator;

describe("configurator store", () => {
  beforeEach(() => store.getState().reset());

  it("starts with the catalog defaults", () => {
    expect(store.getState().config).toEqual(defaultConfig(chair));
  });

  it("sets one option without touching the others", () => {
    store.getState().setOption("base", "racing");
    expect(store.getState().config).toEqual({ ...defaultConfig(chair), base: "racing" });
  });

  it("loads a full config and resets back to defaults", () => {
    const loaded = { ...defaultConfig(chair), rgb: true, rgbColor: "amber" as const };
    store.getState().load(loaded);
    expect(store.getState().config).toEqual(loaded);
    store.getState().reset();
    expect(store.getState().config).toEqual(defaultConfig(chair));
  });

  it("does not share the defaults object between resets", () => {
    store.getState().setOption("lumbar", true);
    store.getState().reset();
    expect(defaultConfig(chair).lumbar).toBe(false);
  });

  it("rejects catalog-invalid values at compile time", () => {
    // Never runs: typecheck fails if ChairConfig loses its literal unions.
    const typeOnly = () => {
      // @ts-expect-error "hover" is not a base choice
      store.getState().setOption("base", "hover");
      // @ts-expect-error toggles take booleans
      store.getState().setOption("lumbar", "1");
    };
    expect(typeof typeOnly).toBe("function");
  });
});
