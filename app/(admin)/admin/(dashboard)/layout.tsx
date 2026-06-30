import { requireAdmin } from "@/lib/auth/guards";
import { AdminShellClient } from "@/components/dashboard/admin-shell-client";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <AdminShellClient userName={user.name} userEmail={user.email}>
      {children}
    </AdminShellClient>
  );
}
