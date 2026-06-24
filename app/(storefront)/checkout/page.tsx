import { CheckoutForm } from "@/components/storefront/checkout-form";
import { getStorefrontMenu } from "@/lib/menu";

export const metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const menu = await getStorefrontMenu();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <CheckoutForm taxRate={menu.taxRate} />
    </div>
  );
}
