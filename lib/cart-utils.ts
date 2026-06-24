import type { CartLineItem, CartModifier } from "@/lib/types/storefront";

export function getLineItemKey(
  productId: string,
  variantId: string | null,
  modifiers: CartModifier[],
): string {
  const modKey = modifiers
    .map((m) => m.optionId)
    .sort()
    .join(",");
  return `${productId}:${variantId ?? "base"}:${modKey}`;
}

export function calculateLineTotal(item: CartLineItem): number {
  const modifiersTotal = item.modifiers.reduce((sum, m) => sum + m.price, 0);
  return (item.unitPrice + modifiersTotal) * item.quantity;
}

export function calculateCartSubtotal(items: CartLineItem[]): number {
  return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
}

export function generateCartItemId(): string {
  return `ci_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
