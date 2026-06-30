"use client";

import { LogOut, User } from "lucide-react";
import { useState } from "react";

type DashboardTopBarProps = {
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  userName: string | null;
  userEmail: string;
  onLogout: () => void;
};

export function DashboardTopBar({
  title,
  subtitle,
  headerActions,
  userName,
  userEmail,
  onLogout,
}: DashboardTopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="pl-12 lg:pl-0">
        {title && (
          <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
        )}
        {subtitle && (
          <p className="text-sm text-stone-500">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {headerActions}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm hover:bg-stone-50"
          >
            <User className="h-4 w-4 text-stone-500" />
            <span className="hidden sm:inline">{userName ?? userEmail}</span>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
                aria-hidden
              />
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
                <div className="border-b border-stone-100 px-4 py-3">
                  <p className="text-sm font-medium text-stone-900">
                    {userName ?? "User"}
                  </p>
                  <p className="truncate text-xs text-stone-500">{userEmail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
