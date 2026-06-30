"use server";

import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/format";
import { getDefaultTenant } from "@/lib/tenant";

export async function getOrderForTracking(orderNumber: string) {
  const tenant = await getDefaultTenant();

  const order = await db.order.findUnique({
    where: {
      tenantId_orderNumber: {
        tenantId: tenant.id,
        orderNumber,
      },
    },
    include: {
      items: {
        include: { modifiers: true },
      },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) return null;

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    deliveryAddress: order.deliveryAddress,
    subtotal: decimalToNumber(order.subtotal),
    discountAmount: decimalToNumber(order.discountAmount),
    tax: decimalToNumber(order.tax),
    deliveryFee: decimalToNumber(order.deliveryFee),
    total: decimalToNumber(order.total),
    createdAt: order.createdAt.toISOString(),
    statusHistory: order.statusHistory.map((entry) => ({
      status: entry.status,
      note: entry.note,
      createdAt: entry.createdAt.toISOString(),
    })),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      variantName: item.variantName,
      totalPrice: decimalToNumber(item.totalPrice),
      modifiers: item.modifiers.map((m) => ({
        id: m.id,
        optionName: m.optionName,
        price: decimalToNumber(m.price),
      })),
    })),
  };
}

export type TrackingOrder = NonNullable<
  Awaited<ReturnType<typeof getOrderForTracking>>
>;
