"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, MapPin, ShoppingBag, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useLocation } from "@/context/location-context";
import { getAreaById, getBranchById } from "@/lib/locations";

type HeaderProps = {
  tenantName: string;
};

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Deals", href: "/#cat-deals" },
  { label: "Menu", href: "/#menu" },
] as const;

const SCROLL_THRESHOLD = 24;

export function Header({ tenantName }: HeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { itemCount, openCart } = useCart();
  const { selection, openSelector } = useLocation();
  const { user, isLoading, openAuthModal, signOut } = useAuth();

  const branch = selection ? getBranchById(selection.branchId) : null;
  const area =
    selection && branch
      ? getAreaById(selection.branchId, selection.areaId)
      : null;

  const locationLabel =
    branch && area ? `${branch.name} · ${area.name}` : "Select location";

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }

    function onScroll() {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    if (!profileOpen) return;

    function onClickOutside(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [profileOpen]);

  const isTransparent = isHome && !scrolled;

  const authButtonClass = isTransparent
    ? "text-white hover:bg-white/10"
    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900";

  return (
    <header
      className={`z-40 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        isHome ? "fixed inset-x-0 top-0" : "sticky top-0"
      } ${
        isTransparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-stone-200/80 bg-white/95 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center justify-self-start">
          <Image
            src={
              isTransparent
                ? "/images/logos/fiestaa-white-logo.png"
                : "/images/logos/fiestaa-logo.png"
            }
            alt={tenantName}
            width={140}
            height={40}
            className="h-9 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center justify-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-semibold transition ${
                isTransparent
                  ? "text-white hover:text-white/80"
                  : "text-stone-700 hover:text-secondary"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <button
            type="button"
            onClick={openSelector}
            className={`flex max-w-36 items-center gap-1.5 rounded-full px-2 py-2 text-left transition sm:max-w-48 sm:px-3 ${
              isTransparent ? "hover:bg-white/10" : "hover:bg-stone-100"
            }`}
            title={locationLabel}
          >
            <MapPin
              className={`h-4 w-4 shrink-0 ${
                isTransparent ? "text-white" : "text-secondary"
              }`}
            />
            <span
              className={`truncate text-xs font-medium sm:text-sm ${
                isTransparent ? "text-white" : "text-stone-700"
              }`}
            >
              {locationLabel}
            </span>
          </button>

          {!isLoading && (
            <>
              {user ? (
                <div ref={profileRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((open) => !open)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition ${authButtonClass}`}
                    title={user.name ?? "Profile"}
                    aria-expanded={profileOpen}
                    aria-haspopup="menu"
                  >
                    <User className="h-5 w-5" />
                  </button>

                  {profileOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg"
                    >
                      <div className="border-b border-stone-100 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-stone-900">
                          {user.name ?? "My account"}
                        </p>
                        <p className="truncate text-xs text-stone-500">
                          {user.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={async () => {
                          setProfileOpen(false);
                          await signOut();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-stone-700 transition hover:bg-stone-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal("signin")}
                  className={`rounded-full px-3 py-2 text-sm font-semibold transition ${authButtonClass}`}
                >
                  Sign in
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={openCart}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${authButtonClass}`}
            title="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav
        className={`flex items-center justify-center gap-6 px-4 py-2 md:hidden ${
          isTransparent ? "border-t border-white/15" : "border-t border-stone-100"
        }`}
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm font-semibold transition ${
              isTransparent
                ? "text-white hover:text-white/80"
                : "text-stone-700 hover:text-secondary"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
