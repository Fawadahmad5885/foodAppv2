import type { Metadata } from "next";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { LocationProvider } from "@/context/location-context";
import { getDefaultTenant } from "@/lib/tenant";
import { AuthModal } from "@/components/storefront/auth-modal";
import { CartSidebar } from "@/components/storefront/cart-sidebar";
import { Footer } from "@/components/storefront/footer";
import { Header } from "@/components/storefront/header";
import { LocationSelector } from "@/components/storefront/location-selector";

export const metadata: Metadata = {
  title: {
    default: "Fiestaa — Order Online",
  },
};

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getDefaultTenant();

  return (
    <AuthProvider>
      <CartProvider>
        <LocationProvider>
          <Header tenantName={tenant.name} />
          <main className="flex-1">{children}</main>
          <Footer tenantName={tenant.name} />
          <CartSidebar />
          <LocationSelector />
          <AuthModal />
        </LocationProvider>
      </CartProvider>
    </AuthProvider>
  );
}
