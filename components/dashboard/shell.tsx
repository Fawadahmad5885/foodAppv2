"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopBar } from "@/components/dashboard/top-bar";
import { ToastProvider } from "@/components/dashboard/toast-provider";
import type { NavItem } from "@/lib/dashboard/nav";

type DashboardShellProps = {
  children: React.ReactNode;
  navItems: NavItem[];
  brand: string;
  brandHref: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  userName: string | null;
  userEmail: string;
  onLogout: () => void;
};

export function DashboardShell({
  children,
  navItems,
  brand,
  brandHref,
  subtitle,
  headerActions,
  userName,
  userEmail,
  onLogout,
}: DashboardShellProps) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-stone-50">
        <DashboardSidebar items={navItems} brand={brand} brandHref={brandHref} />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopBar
            subtitle={subtitle}
            headerActions={headerActions}
            userName={userName}
            userEmail={userEmail}
            onLogout={onLogout}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
