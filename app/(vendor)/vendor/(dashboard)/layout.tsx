import { requireVendor } from "@/lib/auth/guards";
import { VendorShellClient } from "@/components/dashboard/vendor-shell-client";
import {
  getVendorTenantOptions,
  maybeAutoSwitchVendorTenant,
} from "@/lib/actions/vendor/tenant";

export default async function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await maybeAutoSwitchVendorTenant();
  const ctx = await requireVendor();
  const { tenants, currentTenantId } = await getVendorTenantOptions();

  return (
    <VendorShellClient
      userName={ctx.user.name}
      userEmail={ctx.user.email}
      tenantName={ctx.tenant.name}
      currentTenantId={currentTenantId ?? ctx.tenant.id}
      tenants={tenants}
      isOwner={ctx.isOwner}
    >
      {children}
    </VendorShellClient>
  );
}
