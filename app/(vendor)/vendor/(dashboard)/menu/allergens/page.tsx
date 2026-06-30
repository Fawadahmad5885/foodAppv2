import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AllergensManager } from "@/components/vendor/allergens-manager";
import { getAllergens } from "@/lib/actions/vendor/allergens";
import { requireVendorOwner } from "@/lib/auth/guards";

export default async function AllergensPage() {
  await requireVendorOwner();
  const allergens = await getAllergens();

  return (
    <div>
      <PageHeader title="Allergens" description="Allergen library for your products." />
      {allergens.length === 0 ? (
        <EmptyState title="No allergens yet" description="Add allergens to tag products." action={null} />
      ) : null}
      <AllergensManager allergens={allergens} />
    </div>
  );
}
