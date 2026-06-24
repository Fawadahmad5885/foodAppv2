import { Plus } from "lucide-react";
import type { MenuProduct } from "@/lib/types/storefront";
import { formatCurrency } from "@/lib/format";
import { ProductCardImage } from "./product-card-image";

type ProductCardProps = {
  product: MenuProduct;
  onSelect: (product: MenuProduct) => void;
};

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const displayPrice =
    product.variants.length > 0
      ? Math.min(...product.variants.map((v) => v.price))
      : product.basePrice;

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="group flex w-full gap-4 rounded-2xl border border-stone-200 bg-white p-4 text-left transition hover:border-stone-300 hover:shadow-sm sm:gap-5 sm:p-5"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="text-base font-bold text-stone-900">
          {product.name}
        </h3>
        <p className="mt-1 text-sm font-semibold text-menu-accent sm:text-base">
          {product.variants.length > 1 && (
            <span className="mr-1 text-xs font-normal text-stone-500">
              from
            </span>
          )}
          {formatCurrency(displayPrice)}
        </p>
        {product.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-500">
            {product.description}
          </p>
        )}
      </div>

      <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-stone-100">
          <ProductCardImage
            src={product.imageUrl}
            alt={product.name}
            className="transition duration-300 group-hover:scale-105"
          />
        </div>
        {/* <span
          className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-900 shadow-sm"
          aria-hidden
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </span> */}
      </div>
    </button>
  );
}
