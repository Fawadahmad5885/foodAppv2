"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { btnDanger, btnPrimary, btnSecondary, inputClass, labelClass } from "@/components/dashboard/form-styles";
import { useToast } from "@/components/dashboard/toast-provider";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/actions/vendor/categories";

type CategoryFormProps = {
  category?: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    parentCategoryId: string | null;
    sortOrder: number;
    isActive: boolean;
  };
  parentOptions: { id: string; name: string }[];
};

export function CategoryForm({ category, parentOptions }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!category;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    const input = {
      name: form.get("name") as string,
      description: (form.get("description") as string) || undefined,
      imageUrl: (form.get("imageUrl") as string) || "",
      parentCategoryId: (form.get("parentCategoryId") as string) || undefined,
      sortOrder: Number(form.get("sortOrder") || 0),
      isActive: form.get("isActive") === "on",
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateCategory(category.id, input)
        : await createCategory(input);

      if (!result.success) {
        setError(result.error);
        toast(result.error, "error");
        return;
      }

      toast(isEdit ? "Category updated" : "Category created");
      router.push("/vendor/menu/categories");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!category || !confirm("Delete this category?")) return;
    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if (!result.success) {
        toast(result.error, "error");
        return;
      }
      toast("Category deleted");
      router.push("/vendor/menu/categories");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className={labelClass}>Name</label>
        <input
          id="name"
          name="name"
          required
          defaultValue={category?.name}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={category?.description ?? ""}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className={labelClass}>Image URL</label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          defaultValue={category?.imageUrl ?? ""}
          className={`mt-1 ${inputClass}`}
        />
      </div>

      <div>
        <label htmlFor="parentCategoryId" className={labelClass}>Parent category</label>
        <select
          id="parentCategoryId"
          name="parentCategoryId"
          defaultValue={category?.parentCategoryId ?? ""}
          className={`mt-1 ${inputClass}`}
        >
          <option value="">None</option>
          {parentOptions
            .filter((p) => p.id !== category?.id)
            .map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="sortOrder" className={labelClass}>Sort order</label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={category?.sortOrder ?? 0}
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={category?.isActive ?? true}
              className="rounded border-stone-300"
            />
            Active
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={isPending} className={btnPrimary}>
          {isPending ? "Saving…" : isEdit ? "Update" : "Create"}
        </button>
        <Link href="/vendor/menu/categories" className={btnSecondary}>
          Cancel
        </Link>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className={`ml-auto ${btnDanger}`}
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
