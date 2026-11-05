"use client";

import { chair, type ChairConfig } from "@/data/catalog";
import { formatCentavos } from "@/lib/configurator/price";
import type { Choice, ChoiceOption, Option, ToggleOption } from "@/lib/configurator/types";
import { useConfigurator } from "@/components/configurator/configurator-provider";

const options: readonly Option[] = chair.options;
const priceTag = (amount: number) => (amount > 0 ? `+${formatCentavos(amount)}` : "");

export function OptionPanel() {
  const config = useConfigurator((s) => s.config);
  const setOption = useConfigurator((s) => s.setOption);
  // Values come straight from the catalog, so they are valid for their option by construction.
  const set = (id: string, value: string | boolean) => setOption(id as keyof ChairConfig, value as never);
  const value = (id: string) => config[id as keyof ChairConfig];

  return (
    <div className="divide-y divide-border">
      {options.map((option) => {
        if (option.kind === "toggle") {
          return <ToggleRow key={option.id} option={option} checked={value(option.id) === true} onChange={set} />;
        }
        if (option.requires && value(option.requires) !== true) return null;
        return <ChoiceGroup key={option.id} option={option} selected={String(value(option.id))} onChange={set} />;
      })}
    </div>
  );
}

function ChoiceGroup({
  option,
  selected,
  onChange,
}: {
  option: ChoiceOption;
  selected: string;
  onChange: (id: string, value: string) => void;
}) {
  const current = option.choices.find((c) => c.id === selected);
  const swatches = option.choices.every((c) => c.hex);

  return (
    <fieldset id={`option-${option.id}`} className="scroll-mt-4 py-5">
      <legend className="float-left text-sm font-medium">{option.label}</legend>
      <span className="float-right text-sm text-muted-foreground">{current?.label}</span>
      <div className={swatches ? "clear-both flex flex-wrap gap-3 pt-3" : "clear-both flex flex-wrap gap-2 pt-3"}>
        {option.choices.map((choice) =>
          swatches ? (
            <Swatch key={choice.id} name={option.id} choice={choice} checked={choice.id === selected} onChange={onChange} />
          ) : (
            <Pill key={choice.id} name={option.id} choice={choice} checked={choice.id === selected} onChange={onChange} />
          ),
        )}
      </div>
    </fieldset>
  );
}

interface ChoiceProps {
  name: string;
  choice: Choice;
  checked: boolean;
  onChange: (id: string, value: string) => void;
}

// The real radio sits invisibly on top of its visual, so clicks, keyboard arrows and screen readers all hit it.
function Swatch({ name, choice, checked, onChange }: ChoiceProps) {
  return (
    <label
      title={choice.label}
      className="relative grid size-10 place-items-center rounded-full ring-1 ring-border has-checked:ring-2 has-checked:ring-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary"
    >
      <input
        type="radio"
        name={name}
        value={choice.id}
        checked={checked}
        onChange={() => onChange(name, choice.id)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      <span aria-hidden className="size-7 rounded-full ring-1 ring-white/15" style={{ backgroundColor: choice.hex }} />
      <span className="sr-only">
        {choice.label} {priceTag(choice.price)}
      </span>
    </label>
  );
}

function Pill({ name, choice, checked, onChange }: ChoiceProps) {
  return (
    <label className="relative flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm transition-colors hover:bg-muted has-checked:border-primary has-checked:bg-primary/10 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary">
      <input
        type="radio"
        name={name}
        value={choice.id}
        checked={checked}
        onChange={() => onChange(name, choice.id)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      {choice.hex && <span aria-hidden className="size-3 rounded-full" style={{ backgroundColor: choice.hex }} />}
      <span>{choice.label}</span>
      {choice.price > 0 && <span className="text-muted-foreground tabular-nums">{priceTag(choice.price)}</span>}
    </label>
  );
}

function ToggleRow({
  option,
  checked,
  onChange,
}: {
  option: ToggleOption;
  checked: boolean;
  onChange: (id: string, value: boolean) => void;
}) {
  return (
    <label id={`option-${option.id}`} className="group flex scroll-mt-4 cursor-pointer items-center justify-between gap-4 py-5">
      <span className="text-sm">
        <span className="font-medium">{option.label}</span>{" "}
        <span className="text-muted-foreground tabular-nums">{priceTag(option.price)}</span>
      </span>
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-muted ring-1 ring-border transition-colors group-has-checked:bg-primary group-has-focus-visible:outline-2 group-has-focus-visible:outline-offset-2 group-has-focus-visible:outline-primary">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onChange(option.id, e.target.checked)}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
        />
        <span
          aria-hidden
          className="absolute top-0.5 left-0.5 size-5 rounded-full bg-foreground motion-safe:transition-transform group-has-checked:translate-x-5 group-has-checked:bg-primary-foreground"
        />
      </span>
    </label>
  );
}
