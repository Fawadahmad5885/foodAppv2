"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Store } from "lucide-react";
import { switchVendorTenant } from "@/lib/actions/vendor/tenant";
import type { VendorTenantOption } from "@/lib/actions/vendor/tenant";
import { useToast } from "@/components/dashboard/toast-provider";

type VendorTenantSwitcherProps = {
  tenants: VendorTenantOption[];
  currentTenantId: string;
};

export function VendorTenantSwitcher({
  tenants,
  currentTenantId,
}: VendorTenantSwitcherProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  if (tenants.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <Store className="h-4 w-4 text-stone-400" aria-hidden />
      <label className="sr-only" htmlFor="vendor-store-switcher">
        Active store
      </label>
      <select
        id="vendor-store-switcher"
        value={currentTenantId}
        disabled={isPending}
        onChange={(e) => {
          const tenantId = e.target.value;
          if (tenantId === currentTenantId) return;
          startTransition(async () => {
            const result = await switchVendorTenant(tenantId);
            if (!result.success) {
              toast(result.error, "error");
              return;
            }
            toast("Store switched");
            router.refresh();
          });
        }}
        className="max-w-[180px] truncate rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-sm font-medium text-stone-700 outline-none ring-amber-500 focus:ring-2 disabled:opacity-60 sm:max-w-xs"
      >
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
    </div>
  );
}
