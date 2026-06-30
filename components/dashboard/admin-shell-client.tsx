"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { adminNav } from "@/lib/dashboard/nav";
import { adminLogout } from "@/lib/actions/admin/auth";

type AdminShellClientProps = {
  children: React.ReactNode;
  userName: string | null;
  userEmail: string;
};

export function AdminShellClient({
  children,
  userName,
  userEmail,
}: AdminShellClientProps) {
  return (
    <DashboardShell
      navItems={adminNav}
      brand="Fiesta Admin"
      brandHref="/admin"
      userName={userName}
      userEmail={userEmail}
      onLogout={() => adminLogout()}
    >
      {children}
    </DashboardShell>
  );
}
