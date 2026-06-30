"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { btnDanger, btnPrimary, btnSecondary, inputClass, labelClass } from "@/components/dashboard/form-styles";
import { useToast } from "@/components/dashboard/toast-provider";
import { ImageUrlField } from "@/components/vendor/image-url-field";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/actions/vendor/products";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Variant = {
  name: string;
  price: number;
  sku?: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
};

type ProductImage = {
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
};

type Availability = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

type ProductFormProps = {
  product?: {
    id: string;
    name: string;
    description: string | null;
    categoryId: string;
    sku: string | null;
    barcode: string | null;
    basePrice: number;
    compareAtPrice: number | null;
    costPrice: number | null;
    imageUrl: string | null;
    prepTimeMinutes: number | null;
    calories: number | null;
    servingSize: string | null;
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    spicyLevel: number;
    sortOrder: number;
    isActive: boolean;
    isFeatured: boolean;
    tagIds: string[];
    allergenIds: string[];
    modifierGroupIds: string[];
    variants: Variant[];
    images: ProductImage[];
    nutrition: {
      calories: number | null;
      proteinG: number | null;
      carbsG: number | null;
      fatG: number | null;
      fiberG: number | null;
      sodiumMg: number | null;
      sugarG: number | null;
    } | null;
    availability: Availability[];
  };
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  allergens: { id: string; name: string; icon?: string | null }[];
  modifierGroups: { id: string; name: string }[];
};

export function ProductForm({
  product,
  categories,
  tags,
  allergens,
  modifierGroups,
}: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("basics");

  const [variants, setVariants] = useState<Variant[]>(
    product?.variants ?? [],
  );
  const [primaryImageUrl, setPrimaryImageUrl] = useState(
    product?.imageUrl ?? "",
  );
  const [images, setImages] = useState<ProductImage[]>(
    product?.images ?? [],
  );
  const [availability, setAvailability] = useState<Availability[]>(
    product?.availability ?? [],
  );

  const isEdit = !!product;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    const basics = {
      name: form.get("name") as string,
      description: (form.get("description") as string) || undefined,
      categoryId: form.get("categoryId") as string,
      sku: (form.get("sku") as string) || undefined,
      barcode: (form.get("barcode") as string) || undefined,
      basePrice: Number(form.get("basePrice")),
      compareAtPrice: form.get("compareAtPrice")
        ? Number(form.get("compareAtPrice"))
        : null,
      costPrice: form.get("costPrice") ? Number(form.get("costPrice")) : null,
      imageUrl: primaryImageUrl.trim() || undefined,
      prepTimeMinutes: form.get("prepTimeMinutes")
        ? Number(form.get("prepTimeMinutes"))
        : null,
      calories: form.get("calories") ? Number(form.get("calories")) : null,
      servingSize: (form.get("servingSize") as string) || undefined,
      isVegetarian: form.get("isVegetarian") === "on",
      isVegan: form.get("isVegan") === "on",
      isGlutenFree: form.get("isGlutenFree") === "on",
      spicyLevel: Number(form.get("spicyLevel") || 0),
      sortOrder: Number(form.get("sortOrder") || 0),
      isActive: form.get("isActive") === "on",
      isFeatured: form.get("isFeatured") === "on",
      tagIds: form.getAll("tagIds") as string[],
      allergenIds: form.getAll("allergenIds") as string[],
    };

    const nutrition = {
      calories: form.get("nutritionCalories")
        ? Number(form.get("nutritionCalories"))
        : null,
      proteinG: form.get("proteinG") ? Number(form.get("proteinG")) : null,
      carbsG: form.get("carbsG") ? Number(form.get("carbsG")) : null,
      fatG: form.get("fatG") ? Number(form.get("fatG")) : null,
      fiberG: form.get("fiberG") ? Number(form.get("fiberG")) : null,
      sodiumMg: form.get("sodiumMg") ? Number(form.get("sodiumMg")) : null,
      sugarG: form.get("sugarG") ? Number(form.get("sugarG")) : null,
    };

    const modifierGroupIds = form.getAll("modifierGroupIds") as string[];

    startTransition(async () => {
      const result = isEdit
        ? await updateProduct(
            product.id,
            basics,
            variants,
            images,
            nutrition,
            availability,
            modifierGroupIds,
          )
        : await createProduct(
            basics,
            variants,
            images,
            nutrition,
            availability,
            modifierGroupIds,
          );

      if (!result.success) {
        setError(result.error);
        toast(result.error, "error");
        return;
      }

      toast(isEdit ? "Product updated" : "Product created");
      router.push("/vendor/menu/products");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!product || !confirm("Delete this product?")) return;
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (!result.success) {
        toast(result.error, "error");
        return;
      }
      toast("Product deleted");
      router.push("/vendor/menu/products");
      router.refresh();
    });
  }

  const tabs = [
    { id: "basics", label: "Basics" },
    { id: "variants", label: "Variants" },
    { id: "images", label: "Images" },
    { id: "dietary", label: "Dietary & tags" },
    { id: "addons", label: "Add-ons" },
    { id: "nutrition", label: "Nutrition" },
    { id: "availability", label: "Availability" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === t.id
                ? "bg-amber-100 text-amber-900"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "basics" && (
        <div className="grid max-w-2xl gap-4">
          <div>
            <label htmlFor="name" className={labelClass}>Name</label>
            <input id="name" name="name" required defaultValue={product?.name} className={`mt-1 ${inputClass}`} />
          </div>
          <div>
            <label htmlFor="categoryId" className={labelClass}>Category</label>
            <select id="categoryId" name="categoryId" required defaultValue={product?.categoryId} className={`mt-1 ${inputClass}`}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="description" className={labelClass}>Description</label>
            <textarea id="description" name="description" rows={3} defaultValue={product?.description ?? ""} className={`mt-1 ${inputClass}`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="basePrice" className={labelClass}>Base price</label>
              <input id="basePrice" name="basePrice" type="number" step="0.01" min="0" required defaultValue={product?.basePrice} className={`mt-1 ${inputClass}`} />
            </div>
            <div>
              <label htmlFor="compareAtPrice" className={labelClass}>Compare at price</label>
              <input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" min="0" defaultValue={product?.compareAtPrice ?? ""} className={`mt-1 ${inputClass}`} />
            </div>
          </div>
          <div>
            <label htmlFor="sku" className={labelClass}>SKU</label>
            <input id="sku" name="sku" defaultValue={product?.sku ?? ""} className={`mt-1 max-w-xs ${inputClass}`} />
          </div>
          <ImageUrlField
            id="imageUrl"
            label="Primary image"
            value={primaryImageUrl}
            onChange={setPrimaryImageUrl}
          />
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured} />
              Featured
            </label>
          </div>
        </div>
      )}

      {tab === "variants" && (
        <div className="space-y-4">
          {variants.map((v, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 p-4">
              <div className="flex-1 min-w-[120px]">
                <label className={labelClass}>Name</label>
                <input value={v.name} onChange={(e) => { const n = [...variants]; n[i] = { ...n[i], name: e.target.value }; setVariants(n); }} className={`mt-1 ${inputClass}`} />
              </div>
              <div className="w-28">
                <label className={labelClass}>Price</label>
                <input type="number" step="0.01" value={v.price} onChange={(e) => { const n = [...variants]; n[i] = { ...n[i], price: Number(e.target.value) }; setVariants(n); }} className={`mt-1 ${inputClass}`} />
              </div>
              <label className="flex items-center gap-1 text-sm pb-2">
                <input type="checkbox" checked={v.isDefault} onChange={(e) => { const n = [...variants]; n[i] = { ...n[i], isDefault: e.target.checked }; setVariants(n); }} />
                Default
              </label>
              <button type="button" onClick={() => setVariants(variants.filter((_, j) => j !== i))} className="text-sm text-red-600 pb-2">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => setVariants([...variants, { name: "", price: 0, isDefault: false, isActive: true, sortOrder: variants.length }])} className={btnSecondary}>
            Add variant
          </button>
        </div>
      )}

      {tab === "images" && (
        <div className="space-y-4">
          {images.map((img, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 p-4">
              <div className="min-w-0 flex-1">
                <ImageUrlField
                  id={`product-image-${i}`}
                  label={`Image ${i + 1}`}
                  value={img.url}
                  onChange={(url) => {
                    const n = [...images];
                    n[i] = { ...n[i], url };
                    setImages(n);
                  }}
                />
              </div>
              <label className="flex items-center gap-1 text-sm pb-2">
                <input type="checkbox" checked={img.isPrimary} onChange={(e) => { const n = [...images]; n[i] = { ...n[i], isPrimary: e.target.checked }; setImages(n); }} />
                Primary
              </label>
              <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="text-sm text-red-600 pb-2">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => setImages([...images, { url: "", sortOrder: images.length, isPrimary: images.length === 0 }])} className={btnSecondary}>
            Add image
          </button>
        </div>
      )}

      {tab === "dietary" && (
        <div className="grid max-w-2xl gap-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isVegetarian" defaultChecked={product?.isVegetarian} /> Vegetarian
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isVegan" defaultChecked={product?.isVegan} /> Vegan
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isGlutenFree" defaultChecked={product?.isGlutenFree} /> Gluten free
            </label>
          </div>
          <div>
            <label htmlFor="spicyLevel" className={labelClass}>Spicy level (0–5)</label>
            <input id="spicyLevel" name="spicyLevel" type="number" min="0" max="5" defaultValue={product?.spicyLevel ?? 0} className={`mt-1 w-24 ${inputClass}`} />
          </div>
          <div>
            <p className={labelClass}>Tags</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="tagIds" value={tag.id} defaultChecked={product?.tagIds.includes(tag.id)} />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className={labelClass}>Allergens</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {allergens.map((a) => (
                <label key={a.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="allergenIds" value={a.id} defaultChecked={product?.allergenIds.includes(a.id)} />
                  {a.icon ? `${a.icon} ` : ""}{a.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "addons" && (
        <div className="flex flex-wrap gap-3">
          {modifierGroups.map((g) => (
            <label key={g.id} className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm">
              <input type="checkbox" name="modifierGroupIds" value={g.id} defaultChecked={product?.modifierGroupIds.includes(g.id)} />
              {g.name}
            </label>
          ))}
          {modifierGroups.length === 0 && (
            <p className="text-sm text-stone-500">No add-on groups yet. Create them under Menu → Add-ons.</p>
          )}
        </div>
      )}

      {tab === "nutrition" && (
        <div className="grid max-w-2xl grid-cols-2 gap-4">
          {(
            [
              ["nutritionCalories", "Calories", product?.nutrition?.calories],
              ["proteinG", "Protein (g)", product?.nutrition?.proteinG],
              ["carbsG", "Carbs (g)", product?.nutrition?.carbsG],
              ["fatG", "Fat (g)", product?.nutrition?.fatG],
              ["fiberG", "Fiber (g)", product?.nutrition?.fiberG],
              ["sodiumMg", "Sodium (mg)", product?.nutrition?.sodiumMg],
              ["sugarG", "Sugar (g)", product?.nutrition?.sugarG],
            ] as const
          ).map(([name, label, val]) => (
            <div key={name}>
              <label htmlFor={name} className={labelClass}>{label}</label>
              <input id={name} name={name} type="number" step="0.01" defaultValue={val ?? ""} className={`mt-1 ${inputClass}`} />
            </div>
          ))}
        </div>
      )}

      {tab === "availability" && (
        <div className="space-y-4">
          {availability.map((a, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 p-4">
              <div>
                <label className={labelClass}>Day</label>
                <select value={a.dayOfWeek} onChange={(e) => { const n = [...availability]; n[i] = { ...n[i], dayOfWeek: Number(e.target.value) }; setAvailability(n); }} className={`mt-1 ${inputClass}`}>
                  {DAYS.map((d, di) => <option key={di} value={di}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Start</label>
                <input type="time" value={a.startTime} onChange={(e) => { const n = [...availability]; n[i] = { ...n[i], startTime: e.target.value }; setAvailability(n); }} className={`mt-1 ${inputClass}`} />
              </div>
              <div>
                <label className={labelClass}>End</label>
                <input type="time" value={a.endTime} onChange={(e) => { const n = [...availability]; n[i] = { ...n[i], endTime: e.target.value }; setAvailability(n); }} className={`mt-1 ${inputClass}`} />
              </div>
              <button type="button" onClick={() => setAvailability(availability.filter((_, j) => j !== i))} className="text-sm text-red-600 pb-2">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => setAvailability([...availability, { dayOfWeek: 0, startTime: "09:00", endTime: "22:00", isAvailable: true }])} className={btnSecondary}>
            Add schedule
          </button>
        </div>
      )}

      <div className="flex gap-3 border-t border-stone-200 pt-6">
        <button type="submit" disabled={isPending} className={btnPrimary}>
          {isPending ? "Saving…" : isEdit ? "Update product" : "Create product"}
        </button>
        <Link href="/vendor/menu/products" className={btnSecondary}>Cancel</Link>
        {isEdit && (
          <button type="button" onClick={handleDelete} disabled={isPending} className={`ml-auto ${btnDanger}`}>
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
