"use client";

import { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { ALL_FILTER, matchesFilter, type FilterTabCategory } from "@/components/FilterTabs";
import { BlogGrid, type BlogCardItem } from "@/components/BlogCard";
import { CategoryPills, resolveActiveFilter } from "@/components/CategoryPills";

const PAGE_PATH = "/blog";

/**
 * Live parity: `widget_Blogs` on vodafonepay.com.tr/blog (17.09.2026,
 * computed styles + filtered-view check):
 * - no breadcrumb on this page
 * - header column: `lg:pt-[64px]`, VodafoneLight 40/48 "Blog", then the
 *   category pills (CategoryPills — identical markup to /kampanyalar)
 * - results `max-w-[1280px] px-4 lg:px-0 pb-20`; "Tüm Bloglar", or
 *   "<Kategori> blogları" when a category is picked
 * - the widget itself is white with 20px bottom padding
 */
type ListProps = { posts: BlogCardItem[]; categories: FilterTabCategory[]; allLabel?: string };

export function BlogFilterableList(props: ListProps) {
  const searchParams = useSearchParams();
  return <BlogView {...props} fromUrl={searchParams?.get("kategori") ?? null} />;
}

/** Server-render / Suspense fallback: the same list under "Tümü". */
export function BlogFilterableListFallback(props: ListProps) {
  return <BlogView {...props} fromUrl={null} />;
}

/** Title column — shared with the CMS-error/empty states, which have no pills. */
export function BlogHeader({ children }: { children?: ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center justify-center font-sans subpixel-antialiased lg:pt-[64px]">
      <h1 className="text-center font-light text-[40px] leading-[48px] tracking-normal text-black">Blog</h1>
      {children}
    </div>
  );
}

function BlogView({ posts, categories, allLabel = "Tümü", fromUrl }: ListProps & { fromUrl: string | null }) {
  const [picked, setPicked] = useState<{ under: string | null; slug: string } | null>(null);
  const active = resolveActiveFilter(fromUrl, picked);

  const visible = posts.filter((p) => matchesFilter(active, p.category));
  const activeLabel = categories.find((c) => c.slug === active)?.label;
  const title = active === ALL_FILTER ? "Tüm Bloglar" : `${activeLabel ?? "Blog"} blogları`;

  return (
    <div className="w-full bg-white pb-5">
      <BlogHeader>
        <CategoryPills
          basePath={PAGE_PATH}
          categories={categories}
          active={active}
          allLabel={allLabel}
          onSelect={(slug) => setPicked({ under: fromUrl, slug })}
        />
      </BlogHeader>

      <section className="mx-auto w-full max-w-[1280px] px-4 pb-20 subpixel-antialiased lg:px-0">
        {visible.length === 0 ? (
          <p className="mx-auto max-w-3xl px-4 pb-16 text-center text-gray-500">Bu kategoride henüz yazı yok.</p>
        ) : (
          <BlogGrid title={title} items={visible} />
        )}
      </section>
    </div>
  );
}
