import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderDetailView } from "@/components/vendor/order-detail";
import { getVendorOrder } from "@/lib/actions/vendor/orders";
import { requireVendor } from "@/lib/auth/guards";

export default async function VendorOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { isOwner } = await requireVendor();
  const order = await getVendorOrder(id);

  if (!order) notFound();

  return <OrderDetailView order={order} isOwner={isOwner} />;
}
