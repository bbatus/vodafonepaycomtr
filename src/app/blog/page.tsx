import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AppDownloadBanner } from "@/components/AppDownloadBanner";
import { Header } from "@/components/Header";
import type { BlogCardItem } from "@/components/BlogCard";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { Footer } from "@/components/Footer";
import { getBlogPosts, getCategories, getTranslation, richTextToPlainText } from "@/lib/cms";
import type { FilterTabCategory } from "@/components/FilterTabs";
import { BlogFilterableList, BlogFilterableListFallback, BlogHeader } from "./BlogFilterableList";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Bloglar | Vodafone Pay",
  description: "Vodafone Pay'den mobil ödeme, kart ve dijital cüzdan hakkında güncel blog yazıları.",
  path: "/blog",
});

export default async function Blog() {
  // E3: previously fell back to 12 hardcoded fake posts whenever the CMS
  // was unreachable — same bug class as kampanyalar's fallback (see
  // ContentUnavailable.tsx). `null` = CMS fetch/parse failed, `[]` = CMS
  // reachable but genuinely has zero posts; shown differently so a dead
  // CMS is actually visible instead of silently masked.
  const [cmsPosts, cmsCategories, allLabel] = await Promise.all([
    getBlogPosts(),
    getCategories("blog"),
    getTranslation("filterTabs.all", "Tümü"),
  ]);
  const posts: BlogCardItem[] = (cmsPosts ?? []).map((p) => ({
    id: p.id,
    image: p.coverImage.url,
    imageAlt: p.coverImage.alt || p.title,
    title: p.title,
    excerpt: richTextToPlainText(p.body, 140),
    href: `/blog/${p.slug}`,
    category: p.category?.slug,
    linkLabel: p.ctaLabel,
  }));

  // Consistent with /sikca-sorulan-sorular (RFP follow-up): every Blog-scope
  // category is a tab, even with zero posts in it yet — an editor who just
  // created a category needs to see it appear, not wonder whether it worked.
  // BlogFilterableList shows an explicit empty state for a tab with no posts.
  const categories: FilterTabCategory[] = (cmsCategories ?? []).map((c) => ({ label: c.label, slug: c.slug }));

  let content: ReactNode;
  if (cmsPosts === null || posts.length === 0) {
    content = (
      <>
        <BlogHeader />
        <section className="mx-auto w-full max-w-[1280px] px-4 pb-20">
          <ContentUnavailable variant={cmsPosts === null ? "error" : "empty"} />
        </section>
      </>
    );
  } else {
    const listProps = { posts, categories, allLabel };
    // useSearchParams (?kategori=) needs a Suspense boundary to keep the page
    // statically renderable; the fallback is the same list under "Tümü".
    content = (
      <Suspense fallback={<BlogFilterableListFallback {...listProps} />}>
        <BlogFilterableList {...listProps} />
      </Suspense>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <AppDownloadBanner />
      <Header />
      {content}
      <Footer />
    </main>
  );
}
