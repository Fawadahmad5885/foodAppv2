"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireVendor } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/format";

const LIVE_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
];

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY"],
  READY: ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function getVendorOrders(options?: {
  liveOnly?: boolean;
  status?: OrderStatus;
  search?: string;
  limit?: number;
}) {
  const { tenant } = await requireVendor();

  const where = {
    tenantId: tenant.id,
    ...(options?.liveOnly ? { status: { in: LIVE_STATUSES } } : {}),
    ...(options?.status ? { status: options.status } : {}),
    ...(options?.search
      ? {
          OR: [
            { orderNumber: { contains: options.search, mode: "insensitive" as const } },
            { customerName: { contains: options.search, mode: "insensitive" as const } },
            { customerPhone: { contains: options.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 100,
    include: {
      items: { select: { id: true } },
      paymentIntents: { select: { status: true }, take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    total: decimalToNumber(o.total),
    itemCount: o.items.length,
    paymentStatus: o.paymentIntents[0]?.status ?? null,
    createdAt: o.createdAt.toISOString(),
  }));
}

export async function getVendorOrder(orderId: string) {
  const { tenant } = await requireVendor();

  const order = await db.order.findFirst({
    where: { id: orderId, tenantId: tenant.id },
    include: {
      items: {
        include: {
          modifiers: true,
        },
      },
      discounts: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      paymentIntents: {
        include: { transactions: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) return null;

  return {
    ...order,
    subtotal: decimalToNumber(order.subtotal),
    discountAmount: decimalToNumber(order.discountAmount),
    tax: decimalToNumber(order.tax),
    deliveryFee: decimalToNumber(order.deliveryFee),
    total: decimalToNumber(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: decimalToNumber(item.unitPrice),
      totalPrice: decimalToNumber(item.totalPrice),
      discountAmount: decimalToNumber(item.discountAmount),
      modifiers: item.modifiers.map((m) => ({
        ...m,
        price: decimalToNumber(m.price),
      })),
    })),
    discounts: order.discounts.map((d) => ({
      ...d,
      amount: decimalToNumber(d.amount),
    })),
  };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const { tenant, isOwner } = await requireVendor();

  if (newStatus === "CANCELLED" && !isOwner) {
    return { success: false, error: "Only owners can cancel orders" };
  }

  const order = await db.order.findFirst({
    where: { id: orderId, tenantId: tenant.id },
    select: { status: true, orderNumber: true },
  });

  if (!order) {
    return { success: false, error: "Order not found" };
  }

  const allowed = TRANSITIONS[order.status];
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: `Cannot transition from ${order.status} to ${newStatus}`,
    };
  }

  await db.$transaction([
    db.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    }),
    db.orderStatusHistory.create({
      data: {
        orderId,
        status: newStatus,
        note: note ?? null,
      },
    }),
  ]);

  revalidatePath("/vendor/orders");
  revalidatePath(`/vendor/orders/${orderId}`);
  revalidatePath("/vendor");
  revalidatePath(`/order/${order.orderNumber}`);

  return { success: true };
}

export async function getVendorOrderStats() {
  const { tenant } = await requireVendor();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [todayOrders, liveCount, todayRevenue] = await Promise.all([
    db.order.count({
      where: { tenantId: tenant.id, createdAt: { gte: startOfDay } },
    }),
    db.order.count({
      where: {
        tenantId: tenant.id,
        status: { in: ["PENDING", "CONFIRMED", "PREPARING"] },
      },
    }),
    db.order.aggregate({
      where: {
        tenantId: tenant.id,
        createdAt: { gte: startOfDay },
        status: { not: "CANCELLED" },
      },
      _sum: { total: true },
    }),
  ]);

  const statusCounts = await db.order.groupBy({
    by: ["status"],
    where: { tenantId: tenant.id, createdAt: { gte: startOfDay } },
    _count: true,
  });

  return {
    todayOrders,
    liveCount,
    todayRevenue: todayRevenue._sum.total
      ? decimalToNumber(todayRevenue._sum.total)
      : 0,
    statusCounts: Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count]),
    ) as Partial<Record<OrderStatus, number>>,
  };
}
