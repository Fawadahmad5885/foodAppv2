"use client";

import { ChevronRight, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type CategoryNavItem = {
  id: string;
  name: string;
};

type CategoryNavProps = {
  categories: CategoryNavItem[];
  activeCategoryId: string;
  onCategorySelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dealsTab?: { id: string; name: string };
};

export function CategoryNav({
  categories,
  activeCategoryId,
  onCategorySelect,
  searchQuery,
  onSearchChange,
  dealsTab,
}: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const tabs = dealsTab ? [dealsTab, ...categories] : categories;

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [tabs, updateScrollState]);

  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  }

  return (
    <div className="sticky top-[7.25rem] z-30 border-b border-stone-200 bg-white md:top-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4  sm:flex-row sm:items-center sm:gap-8 sm:px-6 ">
        <label className="flex w-full shrink-0 items-center gap-2.5 bg-gray-50 px-3 py-2.5 sm:w-56">
          <Search className="h-4 w-4 shrink-0 text-stone-400" strokeWidth={2} />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search menu items..."
            className="w-full bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
          />
        </label>

        <div className="relative min-w-0 flex-1">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto border-b border-stone-200 scrollbar-none"
          >
            {tabs.map((tab) => {
              const isActive = activeCategoryId === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onCategorySelect(tab.id)}
                  className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition ${
                    isActive
                      ? "border-stone-900 text-menu-accent"
                      : "border-transparent text-stone-900 hover:text-stone-700"
                  }`}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>

          {canScrollRight && (
            <button
              type="button"
              onClick={scrollRight}
              aria-label="Scroll categories"
              className="absolute top-0 right-0 flex h-full items-center bg-gradient-to-l from-white from-60% to-transparent pl-8 pr-1 text-stone-700"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
