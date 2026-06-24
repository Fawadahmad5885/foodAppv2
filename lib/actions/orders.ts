"use server";

import { DiscountScope, DiscountType } from "@prisma/client";
import { db } from "@/lib/db";
import {
  calculateCartSubtotal,
  calculateLineTotal,
} from "@/lib/cart-utils";
import { decimalToNumber } from "@/lib/format";
import type {
  CartLineItem,
  CheckoutInput,
  PlaceOrderResult,
} from "@/lib/types/storefront";
import { getDefaultTenant } from "@/lib/tenant";

async function generateOrderNumber(tenantId: string): Promise<string> {
  const count = await db.order.count({ where: { tenantId } });
  const seq = String(count + 1).padStart(5, "0");
  return `ORD-${seq}`;
}

async function resolveDiscount(
  tenantId: string,
  promoCode: string | undefined,
  subtotal: number,
) {
  if (!promoCode?.trim()) {
    return { discountAmount: 0, applied: null as null };
  }

  const discount = await db.discount.findFirst({
    where: {
      tenantId,
      code: promoCode.trim().toUpperCase(),
      isActive: true,
    },
  });

  if (!discount) {
    return { discountAmount: 0, applied: null, error: "Invalid promo code" };
  }

  const now = new Date();
  if (discount.startsAt && discount.startsAt > now) {
    return { discountAmount: 0, applied: null, error: "Promo code not yet active" };
  }
  if (discount.endsAt && discount.endsAt < now) {
    return { discountAmount: 0, applied: null, error: "Promo code expired" };
  }

  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
    return { discountAmount: 0, applied: null, error: "Promo code expired" };
  }

  const minOrder = discount.minOrderAmount
    ? decimalToNumber(discount.minOrderAmount)
    : 0;
  if (subtotal < minOrder) {
    return {
      discountAmount: 0,
      applied: null,
      error: `Minimum order of $${minOrder.toFixed(2)} required`,
    };
  }

  const value = decimalToNumber(discount.value);
  let discountAmount = 0;

  if (discount.type === DiscountType.PERCENTAGE) {
    discountAmount = subtotal * (value / 100);
  } else if (discount.type === DiscountType.FIXED_AMOUNT) {
    discountAmount = value;
  }

  const maxDiscount = discount.maxDiscountAmount
    ? decimalToNumber(discount.maxDiscountAmount)
    : null;
  if (maxDiscount !== null) {
    discountAmount = Math.min(discountAmount, maxDiscount);
  }

  discountAmount = Math.min(discountAmount, subtotal);

  return {
    discountAmount,
    applied: discount,
    error: undefined as string | undefined,
  };
}

export async function placeOrder(
  items: CartLineItem[],
  input: CheckoutInput,
): Promise<PlaceOrderResult> {
  if (!items.length) {
    return { success: false, error: "Your cart is empty" };
  }

  if (!input.customerName.trim()) {
    return { success: false, error: "Name is required" };
  }
  if (!input.customerPhone.trim()) {
    return { success: false, error: "Phone number is required" };
  }
  if (!input.deliveryAddress.trim()) {
    return { success: false, error: "Delivery address is required" };
  }

  try {
    const tenant = await getDefaultTenant();
    const subtotal = calculateCartSubtotal(items);

    const discountResult = await resolveDiscount(
      tenant.id,
      input.promoCode,
      subtotal,
    );
    if (discountResult.error && input.promoCode?.trim()) {
      return { success: false, error: discountResult.error };
    }

    const discountAmount = discountResult.discountAmount;
    const taxableSubtotal = Math.max(0, subtotal - discountAmount);

    const defaultTax = await db.taxCategory.findFirst({
      where: { tenantId: tenant.id, isDefault: true },
    });
    const taxRate = defaultTax ? decimalToNumber(defaultTax.rate) : 0;
    const tax = taxableSubtotal * taxRate;
    const deliveryFee = 2.99;
    const total = taxableSubtotal + tax + deliveryFee;

    const orderNumber = await generateOrderNumber(tenant.id);

    const order = await db.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          tenantId: tenant.id,
          orderNumber,
          status: "PENDING",
          subtotal,
          discountAmount,
          tax,
          deliveryFee,
          total,
          customerName: input.customerName.trim(),
          customerEmail: input.customerEmail?.trim() || null,
          customerPhone: input.customerPhone.trim(),
          deliveryAddress: input.deliveryAddress.trim(),
          notes: input.notes?.trim() || null,
          statusHistory: {
            create: { status: "PENDING", note: "Order placed" },
          },
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              productVariantId: item.variantId,
              name: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: calculateLineTotal(item),
              variantName: item.variantName,
              notes: item.notes,
              modifiers: {
                create: item.modifiers.map((mod) => ({
                  modifierOptionId: mod.optionId,
                  groupName: mod.groupName,
                  optionName: mod.optionName,
                  price: mod.price,
                  quantity: 1,
                })),
              },
            })),
          },
        },
      });

      if (discountResult.applied) {
        await tx.orderDiscount.create({
          data: {
            orderId: created.id,
            discountId: discountResult.applied.id,
            code: discountResult.applied.code,
            name: discountResult.applied.name,
            type: discountResult.applied.type,
            amount: discountAmount,
          },
        });
        await tx.discount.update({
          where: { id: discountResult.applied.id },
          data: { usageCount: { increment: 1 } },
        });
      }

      return created;
    });

    return { success: true, orderNumber: order.orderNumber, orderId: order.id };
  } catch (error) {
    console.error("placeOrder error:", error);
    return { success: false, error: "Failed to place order. Please try again." };
  }
}
