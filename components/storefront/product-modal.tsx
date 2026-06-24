"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format";
import type {
  CartModifier,
  MenuModifierGroup,
  MenuProduct,
} from "@/lib/types/storefront";

type ProductModalProps = {
  product: MenuProduct | null;
  onClose: () => void;
};

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});

  const reset = useCallback(() => {
    if (!product) return;
    const defaultVariant =
      product.variants.find((v) => v.isDefault) ?? product.variants[0];
    setSelectedVariantId(defaultVariant?.id ?? null);
    setQuantity(1);

    const defaults: Record<string, string[]> = {};
    for (const group of product.modifierGroups) {
      const defaultOpts = group.options
        .filter((o) => o.isDefault)
        .map((o) => o.id);
      if (defaultOpts.length) defaults[group.id] = defaultOpts;
      else defaults[group.id] = [];
    }
    setSelectedOptions(defaults);
  }, [product]);

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    const variant = product.variants.find((v) => v.id === selectedVariantId);
    return variant?.price ?? product.basePrice;
  }, [product, selectedVariantId]);

  const modifiers = useMemo((): CartModifier[] => {
    if (!product) return [];
    const result: CartModifier[] = [];
    for (const group of product.modifierGroups) {
      const selected = selectedOptions[group.id] ?? [];
      for (const optId of selected) {
        const opt = group.options.find((o) => o.id === optId);
        if (opt) {
          result.push({
            optionId: opt.id,
            groupId: group.id,
            groupName: group.name,
            optionName: opt.name,
            price: opt.price,
          });
        }
      }
    }
    return result;
  }, [product, selectedOptions]);

  const modifiersTotal = modifiers.reduce((s, m) => s + m.price, 0);
  const lineTotal = (unitPrice + modifiersTotal) * quantity;

  const validationError = useMemo(() => {
    if (!product) return null;
    for (const group of product.modifierGroups) {
      const count = (selectedOptions[group.id] ?? []).length;
      if (group.isRequired && count < Math.max(1, group.minSelections)) {
        return `Please select options for ${group.name}`;
      }
      if (count < group.minSelections) {
        return `Select at least ${group.minSelections} for ${group.name}`;
      }
      if (count > group.maxSelections) {
        return `Select at most ${group.maxSelections} for ${group.name}`;
      }
    }
    return null;
  }, [product, selectedOptions]);

  function toggleOption(group: MenuModifierGroup, optionId: string) {
    setSelectedOptions((prev) => {
      const current = prev[group.id] ?? [];
      const isSelected = current.includes(optionId);

      if (group.maxSelections === 1) {
        return { ...prev, [group.id]: isSelected ? [] : [optionId] };
      }

      if (isSelected) {
        return {
          ...prev,
          [group.id]: current.filter((id) => id !== optionId),
        };
      }

      if (current.length >= group.maxSelections) return prev;
      return { ...prev, [group.id]: [...current, optionId] };
    });
  }

  function handleAddToCart() {
    if (!product || validationError) return;
    const variant = product.variants.find((v) => v.id === selectedVariantId);

    addItem({
      productId: product.id,
      productName: product.name,
      imageUrl: product.imageUrl,
      variantId: variant?.id ?? null,
      variantName: variant?.name ?? null,
      unitPrice,
      quantity,
      modifiers,
    });
    onClose();
  }

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="relative h-52 shrink-0 bg-stone-100 sm:h-56">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="512px"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">
              🍔
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow backdrop-blur transition hover:bg-white"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-stone-700" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <h2 className="text-xl font-bold text-stone-900">{product.name}</h2>
          {product.description && (
            <p className="mt-1 text-sm leading-relaxed text-stone-500">
              {product.description}
            </p>
          )}

          {product.variants.length > 0 && (
            <section className="mt-5">
              <h3 className="text-sm font-semibold text-stone-900">Size</h3>
              <div className="mt-2 grid gap-2">
                {product.variants.map((variant) => (
                  <label
                    key={variant.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${
                      selectedVariantId === variant.id
                        ? "border-amber-500 bg-amber-50"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="variant"
                        checked={selectedVariantId === variant.id}
                        onChange={() => setSelectedVariantId(variant.id)}
                        className="accent-amber-500"
                      />
                      <span className="text-sm font-medium text-stone-800">
                        {variant.name}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-stone-900">
                      {formatCurrency(variant.price)}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {product.modifierGroups.map((group) => (
            <section key={group.id} className="mt-5">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-stone-900">
                  {group.name}
                  {group.isRequired && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </h3>
                <span className="text-xs text-stone-400">
                  {group.maxSelections === 1
                    ? "Choose 1"
                    : `Up to ${group.maxSelections}`}
                </span>
              </div>
              {group.description && (
                <p className="mt-0.5 text-xs text-stone-400">
                  {group.description}
                </p>
              )}
              <div className="mt-2 space-y-2">
                {group.options.map((option) => {
                  const checked = (selectedOptions[group.id] ?? []).includes(
                    option.id,
                  );
                  const inputType =
                    group.maxSelections === 1 ? "radio" : "checkbox";

                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${
                        checked
                          ? "border-amber-500 bg-amber-50"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type={inputType}
                          checked={checked}
                          onChange={() => toggleOption(group, option.id)}
                          className="accent-amber-500"
                        />
                        <span>
                          <span className="text-sm font-medium text-stone-800">
                            {option.name}
                          </span>
                          {option.calories && (
                            <span className="ml-2 text-xs text-stone-400">
                              +{option.calories} cal
                            </span>
                          )}
                        </span>
                      </span>
                      {option.price > 0 && (
                        <span className="text-sm font-medium text-stone-600">
                          +{formatCurrency(option.price)}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="border-t border-stone-100 bg-white px-5 py-4">
          {validationError && (
            <p className="mb-2 text-center text-xs text-red-500">
              {validationError}
            </p>
          )}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="rounded-full p-2 hover:bg-stone-200"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="rounded-full p-2 hover:bg-stone-200"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              disabled={!!validationError}
              onClick={handleAddToCart}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-amber-500 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add to cart · {formatCurrency(lineTotal)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
