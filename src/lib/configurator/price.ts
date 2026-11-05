import type { AnyConfig, Centavos, ConfigOf, Product } from "@/lib/configurator/types";

export interface PriceLine {
  optionId: string;
  label: string;
  amount: Centavos;
}

export interface PriceBreakdown {
  base: Centavos;
  lines: PriceLine[];
  total: Centavos;
}

/** Base + every non-zero add-on, in catalog order. Throws on choices not in the catalog. */
export function priceBreakdown<P extends Product>(product: P, config: ConfigOf<P>): PriceBreakdown {
  const selected = config as unknown as AnyConfig;
  const lines: PriceLine[] = [];

  for (const option of product.options) {
    const value = selected[option.id];
    if (option.kind === "toggle") {
      if (value === true && option.price > 0) {
        lines.push({ optionId: option.id, label: option.label, amount: option.price });
      }
      continue;
    }
    const choice = option.choices.find((c) => c.id === value);
    if (!choice) throw new Error(`Invalid choice for "${option.id}": ${String(value)}`);
    if (choice.price > 0) {
      lines.push({ optionId: option.id, label: `${option.label}: ${choice.label}`, amount: choice.price });
    }
  }

  const total = lines.reduce((sum, line) => sum + line.amount, product.basePrice);
  return { base: product.basePrice, lines, total };
}

const pesoWhole = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
const pesoCents = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

/** Display only — the division never feeds back into arithmetic. */
export function formatCentavos(amount: Centavos): string {
  return (amount % 100 === 0 ? pesoWhole : pesoCents).format(amount / 100);
}
