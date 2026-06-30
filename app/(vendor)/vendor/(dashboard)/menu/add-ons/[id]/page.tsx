import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { ModifierForm } from "@/components/vendor/modifier-form";
import { getModifierGroup } from "@/lib/actions/vendor/modifiers";
import { requireVendorOwner } from "@/lib/auth/guards";

export default async function EditAddOnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireVendorOwner();
  const { id } = await params;
  const group = await getModifierGroup(id);

  if (!group) notFound();

  return (
    <div>
      <PageHeader title="Edit add-on group" description={group.name} />
      <ModifierForm
        group={{
          ...group,
          options: group.options.map((o) => ({
            name: o.name,
            description: o.description ?? undefined,
            price: o.price,
            calories: o.calories,
            isDefault: o.isDefault,
            isActive: o.isActive,
            sortOrder: o.sortOrder,
          })),
        }}
      />
    </div>
  );
}
