export type MenuModifierOption = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  calories: number | null;
  isDefault: boolean;
};

export type MenuModifierGroup = {
  id: string;
  name: string;
  description: string | null;
  minSelections: number;
  maxSelections: number;
  isRequired: boolean;
  options: MenuModifierOption[];
};

export type MenuVariant = {
  id: string;
  name: string;
  price: number;
  isDefault: boolean;
};

export type MenuProduct = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  prepTimeMinutes: number | null;
  calories: number | null;
  isFeatured: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spicyLevel: number;
  categoryId: string;
  variants: MenuVariant[];
  modifierGroups: MenuModifierGroup[];
  tags: string[];
};

export type MenuCategory = {
  id: string;
  name: string;
  description: string | null;
  products: MenuProduct[];
};

export type MenuCombo = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  items: { productName: string; variantName: string | null; quantity: number }[];
};

export type StorefrontMenu = {
  tenant: { id: string; slug: string; name: string };
  categories: MenuCategory[];
  combos: MenuCombo[];
  taxRate: number;
};

export type CartModifier = {
  optionId: string;
  groupId: string;
  groupName: string;
  optionName: string;
  price: number;
};

export type CartLineItem = {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string | null;
  variantId: string | null;
  variantName: string | null;
  unitPrice: number;
  quantity: number;
  modifiers: CartModifier[];
  notes?: string;
};

export type CheckoutInput = {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  deliveryAddress: string;
  notes?: string;
  promoCode?: string;
};

export type PlaceOrderResult =
  | { success: true; orderNumber: string; orderId: string }
  | { success: false; error: string };
