"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { VendorTenantSwitcher } from "@/components/vendor/tenant-switcher";
import { filterVendorNav } from "@/lib/dashboard/nav";
import { vendorLogout } from "@/lib/actions/vendor/auth";
import type { VendorTenantOption } from "@/lib/actions/vendor/tenant";

type VendorShellClientProps = {
  children: React.ReactNode;
  userName: string | null;
  userEmail: string;
  tenantName: string;
  currentTenantId: string;
  tenants: VendorTenantOption[];
  isOwner: boolean;
};

export function VendorShellClient({
  children,
  userName,
  userEmail,
  tenantName,
  currentTenantId,
  tenants,
  isOwner,
}: VendorShellClientProps) {
  return (
    <DashboardShell
      navItems={filterVendorNav(isOwner)}
      brand={tenantName}
      brandHref="/vendor"
      subtitle={tenantName}
      headerActions={
        <VendorTenantSwitcher
          tenants={tenants}
          currentTenantId={currentTenantId}
        />
      }
      userName={userName}
      userEmail={userEmail}
      onLogout={() => vendorLogout()}
    >
      {children}
    </DashboardShell>
  );
}
