"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { btnDanger, btnPrimary, btnSecondary, inputClass, labelClass } from "@/components/dashboard/form-styles";
import { useToast } from "@/components/dashboard/toast-provider";
import {
  createModifierGroup,
  deleteModifierGroup,
  updateModifierGroup,
} from "@/lib/actions/vendor/modifiers";

type Option = {
  name: string;
  description?: string;
  price: number;
  calories?: number | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
};

type ModifierFormProps = {
  group?: {
    id: string;
    name: string;
    description: string | null;
    minSelections: number;
    maxSelections: number;
    isRequired: boolean;
    isActive: boolean;
    sortOrder: number;
    options: Option[];
  };
};

export function ModifierForm({ group }: ModifierFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<Option[]>(group?.options ?? []);
  const isEdit = !!group;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    const groupData = {
      name: form.get("name") as string,
      description: (form.get("description") as string) || undefined,
      minSelections: Number(form.get("minSelections") || 0),
      maxSelections: Number(form.get("maxSelections") || 1),
      isRequired: form.get("isRequired") === "on",
      isActive: form.get("isActive") === "on",
      sortOrder: Number(form.get("sortOrder") || 0),
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateModifierGroup(group.id, groupData, options)
        : await createModifierGroup(groupData, options);

      if (!result.success) {
        setError(result.error);
        toast(result.error, "error");
        return;
      }

      toast(isEdit ? "Add-on group updated" : "Add-on group created");
      router.push("/vendor/menu/add-ons");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!group || !confirm("Delete this add-on group?")) return;
    startTransition(async () => {
      const result = await deleteModifierGroup(group.id);
      if (!result.success) {
        toast(result.error, "error");
        return;
      }
      toast("Add-on group deleted");
      router.push("/vendor/menu/add-ons");
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
          <label htmlFor="name" className={labelClass}>Group name</label>
          <input id="name" name="name" required defaultValue={group?.name} className={`mt-1 ${inputClass}`} />
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>Description</label>
          <textarea id="description" name="description" rows={2} defaultValue={group?.description ?? ""} className={`mt-1 ${inputClass}`} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="minSelections" className={labelClass}>Min selections</label>
            <input id="minSelections" name="minSelections" type="number" min="0" defaultValue={group?.minSelections ?? 0} className={`mt-1 ${inputClass}`} />
          </div>
          <div>
            <label htmlFor="maxSelections" className={labelClass}>Max selections</label>
            <input id="maxSelections" name="maxSelections" type="number" min="1" defaultValue={group?.maxSelections ?? 1} className={`mt-1 ${inputClass}`} />
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isRequired" defaultChecked={group?.isRequired} /> Required
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked={group?.isActive ?? true} /> Active
          </label>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-stone-900">Options</h3>
        <div className="mt-3 space-y-3">
          {options.map((opt, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 p-4">
              <div className="flex-1 min-w-[120px]">
                <label className={labelClass}>Name</label>
                <input value={opt.name} onChange={(e) => { const n = [...options]; n[i] = { ...n[i], name: e.target.value }; setOptions(n); }} className={`mt-1 ${inputClass}`} />
              </div>
              <div className="w-24">
                <label className={labelClass}>Price</label>
                <input type="number" step="0.01" value={opt.price} onChange={(e) => { const n = [...options]; n[i] = { ...n[i], price: Number(e.target.value) }; setOptions(n); }} className={`mt-1 ${inputClass}`} />
              </div>
              <label className="flex items-center gap-1 text-sm pb-2">
                <input type="checkbox" checked={opt.isDefault} onChange={(e) => { const n = [...options]; n[i] = { ...n[i], isDefault: e.target.checked }; setOptions(n); }} />
                Default
              </label>
              <button type="button" onClick={() => setOptions(options.filter((_, j) => j !== i))} className="text-sm text-red-600 pb-2">Remove</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setOptions([...options, { name: "", price: 0, isDefault: false, isActive: true, sortOrder: options.length }])} className={`mt-3 ${btnSecondary}`}>
          Add option
        </button>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className={btnPrimary}>
          {isPending ? "Saving…" : isEdit ? "Update" : "Create"}
        </button>
        <Link href="/vendor/menu/add-ons" className={btnSecondary}>Cancel</Link>
        {isEdit && (
          <button type="button" onClick={handleDelete} disabled={isPending} className={`ml-auto ${btnDanger}`}>
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
