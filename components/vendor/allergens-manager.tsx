"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { btnPrimary, inputClass, labelClass } from "@/components/dashboard/form-styles";
import { useToast } from "@/components/dashboard/toast-provider";
import { createAllergen, deleteAllergen } from "@/lib/actions/vendor/allergens";

type AllergenRow = {
  id: string;
  name: string;
  icon: string | null;
  _count: { products: number };
};

export function AllergensManager({ allergens: initial }: { allergens: AllergenRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [allergens, setAllergens] = useState(initial);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createAllergen({
        name: name.trim(),
        icon: icon.trim() || undefined,
      });
      if (!result.success) {
        toast(result.error, "error");
        return;
      }
      toast("Allergen created");
      setName("");
      setIcon("");
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this allergen?")) return;
    startTransition(async () => {
      const result = await deleteAllergen(id);
      if (!result.success) {
        toast(result.error, "error");
        return;
      }
      setAllergens(allergens.filter((a) => a.id !== id));
      toast("Allergen deleted");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="allergenName" className={labelClass}>Name</label>
          <input
            id="allergenName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Peanuts"
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div className="w-24">
          <label htmlFor="icon" className={labelClass}>Icon</label>
          <input
            id="icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="🥜"
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div className="flex items-end">
          <button type="submit" disabled={isPending} className={btnPrimary}>
            Add
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-stone-500">
              <th className="px-4 py-3 font-medium">Allergen</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {allergens.map((a) => (
              <tr key={a.id} className="border-b border-stone-100">
                <td className="px-4 py-3 font-medium">
                  {a.icon ? `${a.icon} ` : ""}{a.name}
                </td>
                <td className="px-4 py-3 text-stone-500">{a._count.products}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    disabled={isPending}
                    className="text-sm text-red-600 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
