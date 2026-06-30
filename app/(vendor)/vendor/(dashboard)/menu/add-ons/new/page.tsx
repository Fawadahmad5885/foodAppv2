import { PageHeader } from "@/components/dashboard/page-header";
import { ModifierForm } from "@/components/vendor/modifier-form";
import { requireVendorOwner } from "@/lib/auth/guards";

export default async function NewAddOnPage() {
  await requireVendorOwner();

  return (
    <div>
      <PageHeader title="New add-on group" description="Create a modifier group." />
      <ModifierForm />
    </div>
  );
}
