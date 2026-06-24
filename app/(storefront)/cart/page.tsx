import { CartPageContent } from "@/components/storefront/cart-page-content";

export const metadata = {
  title: "Cart",
};

export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <CartPageContent />
    </div>
  );
}
