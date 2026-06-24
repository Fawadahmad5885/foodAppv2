export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function decimalToNumber(value: { toString(): string } | number): number {
  return typeof value === "number" ? value : Number(value.toString());
}
