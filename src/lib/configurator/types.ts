/** Money is always an integer number of centavos (₱1 = 100). Never floats. */
export type Centavos = number;

export interface Choice {
  readonly id: string;
  readonly label: string;
  readonly price: Centavos;
  /** Swatch / material color for UI and 3D. */
  readonly hex?: string;
}

export interface ChoiceOption {
  readonly kind: "choice";
  readonly id: string;
  readonly label: string;
  readonly choices: readonly [Choice, ...Choice[]];
  readonly default: string;
  /** Id of a toggle that must be on for this option to apply (UI hides it otherwise). */
  readonly requires?: string;
}

export interface ToggleOption {
  readonly kind: "toggle";
  readonly id: string;
  readonly label: string;
  readonly price: Centavos;
  readonly default: boolean;
}

export type Option = ChoiceOption | ToggleOption;

/** Any configurable product (chair today; headset/sneaker later). */
export interface Product {
  readonly id: string;
  readonly name: string;
  readonly basePrice: Centavos;
  readonly options: readonly Option[];
}

/** Typed selections for a product declared `as const satisfies Product`. */
export type ConfigOf<P extends Product> = {
  -readonly [O in P["options"][number] as O["id"]]: O extends ChoiceOption
    ? O["choices"][number]["id"]
    : boolean;
};

/** Untyped view used internally by the generic engine. */
export type AnyConfig = Record<string, string | boolean>;
