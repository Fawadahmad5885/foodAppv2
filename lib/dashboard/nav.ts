import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ClipboardList,
  FileText,
  Globe,
  LayoutDashboard,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  Users,
  UtensilsCrossed,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  ownerOnly?: boolean;
  children?: { label: string; href: string; ownerOnly?: boolean }[];
};

export const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Tenants", href: "/admin/tenants", icon: Building2 },
  { label: "Domains", href: "/admin/domains", icon: Globe },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Audit Log", href: "/admin/audit-log", icon: ClipboardList },
  { label: "Reports", href: "/admin/reports", icon: FileText },
];

export const vendorNav: NavItem[] = [
  { label: "Overview", href: "/vendor", icon: LayoutDashboard },
  { label: "Orders", href: "/vendor/orders", icon: ShoppingBag },
  {
    label: "Menu",
    href: "/vendor/menu/categories",
    icon: UtensilsCrossed,
    children: [
      { label: "Categories", href: "/vendor/menu/categories" },
      { label: "Products", href: "/vendor/menu/products" },
      { label: "Add-ons", href: "/vendor/menu/add-ons", ownerOnly: true },
      { label: "Combos", href: "/vendor/menu/combos", ownerOnly: true },
      { label: "Tags", href: "/vendor/menu/tags" },
      { label: "Allergens", href: "/vendor/menu/allergens" },
    ],
  },
  { label: "Promotions", href: "/vendor/promotions", icon: Percent, ownerOnly: true },
  { label: "Branches", href: "/vendor/branches", icon: Store, ownerOnly: true },
  {
    label: "Storefront",
    href: "/vendor/storefront/theme",
    icon: Store,
    ownerOnly: true,
    children: [
      { label: "Theme", href: "/vendor/storefront/theme" },
      { label: "Hero", href: "/vendor/storefront/hero" },
    ],
  },
  { label: "Tax", href: "/vendor/tax", icon: Tag, ownerOnly: true },
  { label: "Customers", href: "/vendor/customers", icon: Users },
  { label: "Team", href: "/vendor/team", icon: Users, ownerOnly: true },
  { label: "Settings", href: "/vendor/settings", icon: Settings, ownerOnly: true },
  { label: "Reports", href: "/vendor/reports", icon: FileText },
];

export function filterVendorNav(isOwner: boolean): NavItem[] {
  return vendorNav
    .filter((item) => !item.ownerOnly || isOwner)
    .map((item) => ({
      ...item,
      children: item.children?.filter((c) => !c.ownerOnly || isOwner),
    }));
}
