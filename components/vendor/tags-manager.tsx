"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { btnPrimary, inputClass, labelClass } from "@/components/dashboard/form-styles";
import { useToast } from "@/components/dashboard/toast-provider";
import { createTag, deleteTag } from "@/lib/actions/vendor/tags";

type TagRow = {
  id: string;
  name: string;
  _count: { products: number };
};

export function TagsManager({ tags: initialTags }: { tags: TagRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [tags, setTags] = useState(initialTags);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createTag({ name: name.trim() });
      if (!result.success) {
        toast(result.error, "error");
        return;
      }
      toast("Tag created");
      setName("");
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this tag?")) return;
    startTransition(async () => {
      const result = await deleteTag(id);
      if (!result.success) {
        toast(result.error, "error");
        return;
      }
      setTags(tags.filter((t) => t.id !== id));
      toast("Tag deleted");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="tagName" className={labelClass}>New tag</label>
          <input
            id="tagName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bestseller"
            className={`mt-1 ${inputClass}`}
          />
        </div>
        <div className="flex items-end">
          <button type="submit" disabled={isPending} className={btnPrimary}>
            Add tag
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-stone-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id} className="border-b border-stone-100">
                <td className="px-4 py-3 font-medium">{tag.name}</td>
                <td className="px-4 py-3 text-stone-500">{tag._count.products}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(tag.id)}
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
