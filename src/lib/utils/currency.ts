/** Currency formatting for pricing figures, kept out of the component tree. */

/** Format a numeric amount for display, e.g. `£3,000`. */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    // Quoted prices are round numbers; showing pence would imply false precision.
    maximumFractionDigits: 0,
  }).format(amount);
}
