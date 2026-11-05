import type { Choice, Product } from "@/lib/configurator/types";

/** The catalog entry for a selected choice. Throws if the option or choice is unknown. */
export function getChoice(product: Product, optionId: string, choiceId: string): Choice {
  const option = product.options.find((o) => o.id === optionId);
  const choice = option?.kind === "choice" ? option.choices.find((c) => c.id === choiceId) : undefined;
  if (!choice) throw new Error(`Unknown choice ${optionId}=${choiceId}`);
  return choice;
}
