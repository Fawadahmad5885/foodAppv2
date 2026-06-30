"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { btnDanger, btnPrimary, btnSecondary, inputClass, labelClass } from "@/components/dashboard/form-styles";
import { useToast } from "@/components/dashboard/toast-provider";
import { createCombo, deleteCombo, updateCombo } from "@/lib/actions/vendor/combos";

type ComboItem = {
  productId: string;
  productVariantId?: string | null;
  quantity: number;
  sortOrder: number;
};

type ComboFormProps = {
  combo?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    imageUrl: string | null;
    isActive: boolean;
    sortOrder: number;
    items: ComboItem[];
  };
  products: {
    id: string;
    name: string;
    variants: { id: string; name: string }[];
  }[];
};

export function ComboForm({ combo, products }: ComboFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ComboItem[]>(combo?.items ?? []);
  const isEdit = !!combo;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    const comboData = {
      name: form.get("name") as string,
      description: (form.get("description") as string) || undefined,
      price: Number(form.get("price")),
      compareAtPrice: form.get("compareAtPrice")
        ? Number(form.get("compareAtPrice"))
        : null,
      imageUrl: (form.get("imageUrl") as string) || undefined,
      isActive: form.get("isActive") === "on",
      sortOrder: Number(form.get("sortOrder") || 0),
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateCombo(combo.id, comboData, items)
        : await createCombo(comboData, items);

      if (!result.success) {
        setError(result.error);
        toast(result.error, "error");
        return;
      }

      toast(isEdit ? "Combo updated" : "Combo created");
      router.push("/vendor/menu/combos");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!combo || !confirm("Delete this combo?")) return;
    startTransition(async () => {
      const result = await deleteCombo(combo.id);
      if (!result.success) {
        toast(result.error, "error");
        return;
      }
      toast("Combo deleted");
      router.push("/vendor/menu/combos");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        <div>
          <label htmlFor="name" className={labelClass}>Name</label>
          <input id="name" name="name" required defaultValue={combo?.name} className={`mt-1 ${inputClass}`} />
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>Description</label>
          <textarea id="description" name="description" rows={2} defaultValue={combo?.description ?? ""} className={`mt-1 ${inputClass}`} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className={labelClass}>Price</label>
            <input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={combo?.price} className={`mt-1 ${inputClass}`} />
          </div>
          <div>
            <label htmlFor="compareAtPrice" className={labelClass}>Compare at</label>
            <input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" min="0" defaultValue={combo?.compareAtPrice ?? ""} className={`mt-1 ${inputClass}`} />
          </div>
        </div>
        <div>
          <label htmlFor="imageUrl" className={labelClass}>Image URL</label>
          <input id="imageUrl" name="imageUrl" defaultValue={combo?.imageUrl ?? ""} className={`mt-1 ${inputClass}`} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={combo?.isActive ?? true} /> Active
        </label>
      </div>

      <div>
        <h3 className="font-medium text-stone-900">Combo items</h3>
        <div className="mt-3 space-y-3">
          {items.map((item, i) => {
            const product = products.find((p) => p.id === item.productId);
            return (
              <div key={i} className="flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 p-4">
                <div className="flex-1 min-w-[140px]">
                  <label className={labelClass}>Product</label>
                  <select
                    value={item.productId}
                    onChange={(e) => {
                      const n = [...items];
                      n[i] = { ...n[i], productId: e.target.value, productVariantId: null };
                      setItems(n);
                    }}
                    className={`mt-1 ${inputClass}`}
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                {product && product.variants.length > 0 && (
                  <div className="min-w-[120px]">
                    <label className={labelClass}>Variant</label>
                    <select
                      value={item.productVariantId ?? ""}
                      onChange={(e) => {
                        const n = [...items];
                        n[i] = { ...n[i], productVariantId: e.target.value || null };
                        setItems(n);
                      }}
                      className={`mt-1 ${inputClass}`}
                    >
                      <option value="">Default</option>
                      {product.variants.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="w-20">
                  <label className={labelClass}>Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const n = [...items];
                      n[i] = { ...n[i], quantity: Number(e.target.value) };
                      setItems(n);
                    }}
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
                <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-sm text-red-600 pb-2">
                  Remove
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setItems([...items, { productId: "", quantity: 1, sortOrder: items.length }])}
          className={`mt-3 ${btnSecondary}`}
        >
          Add item
        </button>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className={btnPrimary}>
          {isPending ? "Saving…" : isEdit ? "Update" : "Create"}
        </button>
        <Link href="/vendor/menu/combos" className={btnSecondary}>Cancel</Link>
        {isEdit && (
          <button type="button" onClick={handleDelete} disabled={isPending} className={`ml-auto ${btnDanger}`}>
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
