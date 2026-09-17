"use client";

import { ALL_FILTER, type FilterTabCategory } from "@/components/FilterTabs";
import { cn } from "@/lib/utils";

/**
 * Live parity: the category pill strip shared by `widget_Campaigns` and
 * `widget_Blogs` on vodafonepay.com.tr (identical markup on both, 17.09.2026):
 * - lg+: `flex gap-2 my-6`, VodafoneRegular 18/28, `px-4 py-[11px]
 *   rounded-full border #7E7E7E whitespace-nowrap`, active #00697C/white
 * - below lg: a sideways-scrolling strip (`w-full px-4 my-9`), 16px text,
 *   40px tall, no border
 * - every pill is a real link to `<basePath>?kategori=<slug>`; the click is
 *   intercepted so the filter changes without a reload, but the URL still
 *   updates (shareable, back/forward works)
 */
export function CategoryPills({
  basePath,
  categories,
  active,
  allLabel = "Tümü",
  onSelect,
}: {
  basePath: string;
  categories: FilterTabCategory[];
  active: string;
  allLabel?: string;
  onSelect: (slug: string) => void;
}) {
  const pills = [{ label: allLabel, slug: ALL_FILTER }, ...categories];
  const hrefFor = (slug: string) => (slug === ALL_FILTER ? basePath : `${basePath}?kategori=${slug}`);

  const select = (slug: string) => {
    onSelect(slug);
    window.history.pushState(null, "", slug === ALL_FILTER ? basePath : `${basePath}?kategori=${encodeURIComponent(slug)}`);
  };

  return (
    <>
      <div className="my-6 hidden items-center gap-2 lg:flex">
        {pills.map((pill) => (
          <a
            key={pill.slug}
            href={hrefFor(pill.slug)}
            aria-current={pill.slug === active ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault();
              select(pill.slug);
            }}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-full border border-[#7E7E7E] px-4 py-[11px] font-sans text-lg leading-[28px] tracking-normal",
              pill.slug === active ? "bg-[#00697C] text-white" : "bg-white text-black"
            )}
          >
            {pill.label}
          </a>
        ))}
      </div>
      <div className="my-9 w-full px-4 lg:hidden">
        <div className="flex gap-x-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {pills.map((pill) => (
            <a
              key={pill.slug}
              href={hrefFor(pill.slug)}
              onClick={(e) => {
                e.preventDefault();
                select(pill.slug);
              }}
              className={cn(
                "flex h-10 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full px-4 py-[11px] font-sans text-[16px] leading-[28px] tracking-normal",
                pill.slug === active ? "bg-[#00697C] text-white" : "bg-white text-black"
              )}
            >
              {pill.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * The URL (`?kategori=`) is the source of truth for the active filter; the
 * locally picked slug only bridges the moment between a click and Next
 * syncing useSearchParams, keyed to the URL it was picked under.
 */
export function resolveActiveFilter(fromUrl: string | null, picked: { under: string | null; slug: string } | null): string {
  return picked && picked.under === fromUrl ? picked.slug : fromUrl || ALL_FILTER;
}
