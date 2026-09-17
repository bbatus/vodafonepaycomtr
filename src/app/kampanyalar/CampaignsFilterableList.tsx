"use client";

import { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { ALL_FILTER, matchesFilter, type FilterTabCategory } from "@/components/FilterTabs";
import { CampaignGrid, type CampaignCardItem } from "@/components/CampaignCard";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { cn } from "@/lib/utils";

export type FilterableCampaign = CampaignCardItem & { featured: boolean };

const PAGE_PATH = "/kampanyalar";

/**
 * Live parity: `widget_Campaigns` on vodafonepay.com.tr/kampanyalar
 * (17.09.2026, computed styles + filtered-view check):
 * - header column `max-w-[1030px]`, `lg:pt-[64px]`, VodafoneLight 40/48 title
 * - desktop pills: `flex gap-2 my-6`, VodafoneRegular 18/28,
 *   `px-4 py-[11px] rounded-full border #7E7E7E`, active #00697C/white
 * - below lg the pills become a sideways-scrolling strip (`px-4 my-9`),
 *   16px text, 40px tall, no border
 * - results column `max-w-[1280px] px-4 pb-20`
 * - "Tümü": "Bu ayın favorileri" (featured, extra `mb-10` per card) then
 *   "Tüm Kampanyalar"; a category: one grid titled "<Kategori> kampanyaları"
 * - each pill links to `?kategori=<slug>`, and the URL is where the active
 *   filter is read from (shareable, back/forward works)
 */
type ListProps = { campaigns: FilterableCampaign[]; categories: FilterTabCategory[]; allLabel?: string };

export function CampaignsFilterableList(props: ListProps) {
  const searchParams = useSearchParams();
  return <CampaignsView {...props} fromUrl={searchParams?.get("kategori") ?? null} />;
}

/** Server-render / Suspense fallback: the same list with "Tümü" selected. */
export function CampaignsFilterableListFallback(props: ListProps) {
  return <CampaignsView {...props} fromUrl={null} />;
}

/** The page title column — shared with the CMS-error/empty states, which have no pills. */
export function CampaignsHeader({ children }: { children?: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1030px] flex-col items-center justify-center font-sans subpixel-antialiased lg:pt-[64px]">
      <h1 className="text-center font-light text-[40px] leading-[48px] tracking-normal text-black">Kampanyalar</h1>
      {children}
    </div>
  );
}

function CampaignsView({ campaigns, categories, allLabel = "Tümü", fromUrl }: ListProps & { fromUrl: string | null }) {
  // Same URL-keyed pattern as FaqCategoryFilter: the picked slug only bridges
  // the moment between the click and Next syncing useSearchParams.
  const [picked, setPicked] = useState<{ under: string | null; slug: string } | null>(null);
  const active = picked && picked.under === fromUrl ? picked.slug : fromUrl || ALL_FILTER;

  const select = (slug: string) => {
    setPicked({ under: fromUrl, slug });
    window.history.pushState(null, "", slug === ALL_FILTER ? PAGE_PATH : `${PAGE_PATH}?kategori=${encodeURIComponent(slug)}`);
  };

  const pills = [{ label: allLabel, slug: ALL_FILTER }, ...categories];
  const hrefFor = (slug: string) => (slug === ALL_FILTER ? PAGE_PATH : `${PAGE_PATH}?kategori=${slug}`);

  const visible = campaigns.filter((c) => matchesFilter(active, c.category));
  const activeLabel = categories.find((c) => c.slug === active)?.label;

  let results: ReactNode;
  if (visible.length === 0) {
    results = <ContentUnavailable variant="empty" />;
  } else if (active !== ALL_FILTER) {
    results = <CampaignGrid first title={`${activeLabel ?? "Kampanyalar"} kampanyaları`} items={visible} />;
  } else {
    const featured = visible.filter((c) => c.featured);
    const rest = visible.filter((c) => !c.featured);
    results = (
      <>
        <CampaignGrid first title="Bu ayın favorileri" items={featured} spaced />
        <CampaignGrid first={featured.length === 0} title="Tüm Kampanyalar" items={rest} />
      </>
    );
  }

  return (
    <>
      <CampaignsHeader>
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
                "cursor-pointer rounded-full border border-[#7E7E7E] px-4 py-[11px] font-sans text-lg leading-[28px] tracking-normal",
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
      </CampaignsHeader>

      <section className="mx-auto w-full max-w-[1280px] px-4 pb-20 subpixel-antialiased">{results}</section>
    </>
  );
}
