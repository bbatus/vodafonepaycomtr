"use client";

import { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { ALL_FILTER, matchesFilter, type FilterTabCategory } from "@/components/FilterTabs";
import { CampaignGrid, type CampaignCardItem } from "@/components/CampaignCard";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { CategoryPills, resolveActiveFilter } from "@/components/CategoryPills";

export type FilterableCampaign = CampaignCardItem & { featured: boolean };

const PAGE_PATH = "/kampanyalar";

/**
 * Live parity: `widget_Campaigns` on vodafonepay.com.tr/kampanyalar
 * (17.09.2026, computed styles + filtered-view check):
 * - header column `max-w-[1030px]`, `lg:pt-[64px]`, VodafoneLight 40/48 title
 * - category pills: see CategoryPills (shared with /blog, same live markup)
 * - results column `max-w-[1280px] px-4 pb-20`
 * - "Tümü": "Bu ayın favorileri" (featured, extra `mb-10` per card) then
 *   "Tüm Kampanyalar"; a category: one grid titled "<Kategori> kampanyaları"
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
  const [picked, setPicked] = useState<{ under: string | null; slug: string } | null>(null);
  const active = resolveActiveFilter(fromUrl, picked);

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
        <CategoryPills
          basePath={PAGE_PATH}
          categories={categories}
          active={active}
          allLabel={allLabel}
          onSelect={(slug) => setPicked({ under: fromUrl, slug })}
        />
      </CampaignsHeader>

      <section className="mx-auto w-full max-w-[1280px] px-4 pb-20 subpixel-antialiased">{results}</section>
    </>
  );
}
