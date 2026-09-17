"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Faq, SYSTEM_SANS } from "@/components/Faq";
import { ALL_FILTER, matchesFilter, type FilterTabCategory } from "@/components/FilterTabs";
import type { FaqItem } from "@/types/homepage";
import { cn } from "@/lib/utils";

type FaqEntry = FaqItem & { category?: string };

const PAGE_PATH = "/sikca-sorulan-sorular";

/**
 * Live parity: the header of `widget_AllFaqs` (17.09.2026, measured from the
 * live page's computed styles):
 * - no breadcrumb on this page; `lg:pt-[64px]` above a VodafoneLight 40/48
 *   title (`my-5` below lg)
 * - category pills live in a 600px-wide, overflow-hidden strip (`my-10`) the
 *   visitor drags sideways (a Swiper on the live site): 16px apart,
 *   `px-4 py-[11px] text-lg leading-[28px] rounded-full border #7E7E7E`,
 *   system sans-serif (no Vodafone face is set there), active pill
 *   #00697C/white, others white/black
 * - each pill is a real link to `?kategori=<slug>` — a filtered view can be
 *   shared or bookmarked, and the URL is where the active filter is read from.
 *
 * The categories themselves still come from the CMS (FaqItems.category →
 * Categories, scope faq — RFP feedback 1.3): a category created there is
 * what makes a pill exist.
 */
type FilterProps = { items?: FaqEntry[]; categories: FilterTabCategory[]; allLabel?: string };

export function FaqCategoryFilter(props: FilterProps) {
  const searchParams = useSearchParams();
  return <FaqCategoryFilterView {...props} fromUrl={searchParams?.get("kategori") ?? null} />;
}

/** Server-render / Suspense fallback: the same page with "Tümü" selected, no search-params read. */
export function FaqCategoryFilterFallback(props: FilterProps) {
  return <FaqCategoryFilterView {...props} fromUrl={null} />;
}

function FaqCategoryFilterView({
  items,
  categories,
  allLabel = "Tümü",
  fromUrl,
}: FilterProps & { fromUrl: string | null }) {
  // The URL is the source of truth (Next keeps useSearchParams in sync with
  // history.pushState, and back/forward just work). The locally picked slug
  // only bridges the moment between the click and that sync — it is keyed to
  // the URL it was picked under, so it drops out as soon as the URL moves.
  const [picked, setPicked] = useState<{ under: string | null; slug: string } | null>(null);
  const active = picked && picked.under === fromUrl ? picked.slug : fromUrl || ALL_FILTER;

  const visible = (items ?? []).filter((i) => matchesFilter(active, i.category));

  // Every category is a pill even with zero questions in it (see page.tsx).
  // Only a specific category shows the empty note, not "Tümü".
  const showEmptyState = active !== ALL_FILTER && visible.length === 0;

  const select = (slug: string) => {
    setPicked({ under: fromUrl, slug });
    const href = slug === ALL_FILTER ? PAGE_PATH : `${PAGE_PATH}?kategori=${encodeURIComponent(slug)}`;
    window.history.pushState(null, "", href);
  };

  const pills = [{ label: allLabel, slug: ALL_FILTER }, ...categories];

  return (
    <>
      <div className="flex flex-col justify-center subpixel-antialiased lg:pt-[64px]">
        <h1 className="my-5 text-center font-light text-[40px] leading-[48px] tracking-normal text-black lg:my-0">
          Sıkça Sorulan Sorular
        </h1>
        <div className="px-4 lg:px-0">
          <PillStrip>
            {pills.map((pill) => {
              const isActive = pill.slug === active;
              return (
                <a
                  key={pill.slug}
                  href={pill.slug === ALL_FILTER ? PAGE_PATH : `${PAGE_PATH}?kategori=${pill.slug}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    select(pill.slug);
                  }}
                  className="mr-4 shrink-0"
                  draggable={false}
                >
                  <span
                    className={cn(
                      "block cursor-pointer whitespace-nowrap rounded-full border border-[#7E7E7E] px-4 py-[11px] text-lg leading-[28px] tracking-normal",
                      SYSTEM_SANS,
                      isActive ? "bg-[#00697C] text-white" : "bg-white text-black"
                    )}
                  >
                    {pill.label}
                  </span>
                </a>
              );
            })}
          </PillStrip>
        </div>
      </div>

      {showEmptyState ? (
        <p className={cn("mx-auto max-w-3xl px-4 pb-16 text-center text-gray-500", SYSTEM_SANS)}>Bu kategoride henüz soru yok.</p>
      ) : (
        <Faq variant="page" showHeading={false} items={visible} />
      )}
    </>
  );
}

/**
 * The live strip is a Swiper: 600px wide, clipped, dragged with the mouse or
 * a finger. A native horizontal scroller with a hidden scrollbar gives the
 * same look; mouse drag-to-scroll is added so desktop visitors without a
 * trackpad can reach the clipped pills too, exactly as on the live page.
 */
function PillStrip({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !ref.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    ref.current.scrollLeft = drag.current.left - dx;
  };
  const end = () => {
    // Swallow the click that ends a drag so it doesn't also select a pill.
    if (drag.current?.moved) {
      ref.current?.addEventListener("click", (ev) => ev.stopPropagation(), { capture: true, once: true });
    }
    drag.current = null;
  };

  return (
    <div className="relative mx-auto my-10 w-full max-w-[600px] overflow-hidden max-md:max-w-full">
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerLeave={end}
        className="flex cursor-grab items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}
