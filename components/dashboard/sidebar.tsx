"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import type { NavItem } from "@/lib/dashboard/nav";

type DashboardSidebarProps = {
  items: NavItem[];
  brand: string;
  brandHref: string;
};

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive =
    pathname === item.href ||
    (item.href !== "/admin" &&
      item.href !== "/vendor" &&
      pathname.startsWith(item.href));

  const [open, setOpen] = useState(isActive);

  if (item.children?.length) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isActive
              ? "bg-amber-50 text-amber-900"
              : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          }`}
        >
          <span className="flex items-center gap-3">
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div className="ml-4 mt-1 space-y-1 border-l border-stone-200 pl-3">
            {item.children.map((child) => {
              const childActive = pathname.startsWith(child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onNavigate}
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    childActive
                      ? "bg-amber-50 font-medium text-amber-900"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-amber-50 text-amber-900"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      }`}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {item.label}
    </Link>
  );
}

export function DashboardSidebar({ items, brand, brandHref }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-4">
      {items.map((item) => (
        <NavLink
          key={item.href + item.label}
          item={item}
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
      ))}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-stone-200 bg-white p-2 shadow-sm lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-stone-200 px-4">
          <Link href={brandHref} className="font-semibold text-stone-900">
            {brand}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {nav}
      </aside>
    </>
  );
}
