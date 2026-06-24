"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MenuCategory, MenuCombo, MenuProduct } from "@/lib/types/storefront";
import { formatCurrency } from "@/lib/format";
import { CategoryNav } from "./category-nav";
import { ProductCard } from "./product-card";
import { ProductModal } from "./product-modal";

const DEALS_TAB_ID = "deals";

type MenuSectionProps = {
  categories: MenuCategory[];
  combos: MenuCombo[];
};

function matchesSearch(product: MenuProduct, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return (
    product.name.toLowerCase().includes(normalized) ||
    product.description?.toLowerCase().includes(normalized) ||
    product.tags.some((tag) => tag.toLowerCase().includes(normalized))
  );
}

export function MenuSection({ categories, combos }: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState(
    combos.length > 0 ? DEALS_TAB_ID : (categories[0]?.id ?? ""),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(
    null,
  );
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const filteredCategories = useMemo(
    () =>
      categories
        .map((category) => ({
          ...category,
          products: category.products.filter((product) =>
            matchesSearch(product, searchQuery),
          ),
        }))
        .filter((category) => category.products.length > 0),
    [categories, searchQuery],
  );

  const showDeals = combos.length > 0 && !searchQuery.trim();

  useEffect(() => {
    if (searchQuery.trim()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id.replace("cat-", ""));
          }
        }
      },
      { rootMargin: "-180px 0px -60% 0px", threshold: 0 },
    );

    if (showDeals) {
      const dealsEl = sectionRefs.current[DEALS_TAB_ID];
      if (dealsEl) observer.observe(dealsEl);
    }

    for (const cat of filteredCategories) {
      const el = sectionRefs.current[cat.id];
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [filteredCategories, searchQuery, showDeals]);

  function scrollToSection(id: string) {
    setActiveCategory(id);
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const navCategories = searchQuery.trim()
    ? filteredCategories.map(({ id, name }) => ({ id, name }))
    : categories.map(({ id, name }) => ({ id, name }));

  return (
    <>
      <CategoryNav
        categories={navCategories}
        activeCategoryId={activeCategory}
        onCategorySelect={scrollToSection}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dealsTab={
          showDeals ? { id: DEALS_TAB_ID, name: "Deals" } : undefined
        }
      />

      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 pb-8 sm:px-6">
        <section id="menu" className="scroll-mt-44 space-y-10 md:scroll-mt-36">
          {searchQuery.trim() && filteredCategories.length === 0 && (
            <p className="py-12 text-center text-sm text-stone-500">
              No items match &ldquo;{searchQuery.trim()}&rdquo;
            </p>
          )}

          {filteredCategories.map((category) => (
            <div
              key={category.id}
              id={`cat-${category.id}`}
              ref={(el) => {
                sectionRefs.current[category.id] = el;
              }}
              className="scroll-mt-44 md:scroll-mt-36"
            >
              <h2 className="mb-5 text-2xl font-bold text-stone-900">
                {category.name}
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {category.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={setSelectedProduct}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        {showDeals && (
          <section
            id={`cat-${DEALS_TAB_ID}`}
            ref={(el) => {
              sectionRefs.current[DEALS_TAB_ID] = el;
            }}
            className="scroll-mt-44 md:scroll-mt-36"
          >
            <h2 className="text-2xl font-bold text-stone-900">Meal deals</h2>
            <p className="mt-1 text-sm text-stone-500">
              Bundle and save on your favorites
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {combos.map((combo) => (
                <div
                  key={combo.id}
                  className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-stone-900">
                        {combo.name}
                      </h3>
                      {combo.description && (
                        <p className="mt-1 text-sm text-stone-500">
                          {combo.description}
                        </p>
                      )}
                      <ul className="mt-3 space-y-1 text-sm text-stone-600">
                        {combo.items.map((item, i) => (
                          <li key={i}>
                            {item.quantity}× {item.productName}
                            {item.variantName ? ` (${item.variantName})` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-700">
                        {formatCurrency(combo.price)}
                      </p>
                      {combo.compareAtPrice && (
                        <p className="text-sm text-stone-400 line-through">
                          {formatCurrency(combo.compareAtPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
