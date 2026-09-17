import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AppDownloadBanner } from "@/components/AppDownloadBanner";
import { Header } from "@/components/Header";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { getCampaigns, getCategories, getFaqItems, getPageMeta, getTranslation } from "@/lib/cms";
import type { FaqItem } from "@/types/homepage";
import {
  CampaignsFilterableList,
  CampaignsFilterableListFallback,
  CampaignsHeader,
  type FilterableCampaign,
} from "./CampaignsFilterableList";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = await getPageMeta("/kampanyalar");
  return buildMetadata({
    title: pageMeta?.seoTitle || "Nakit İade Kampanyaları | Pay'lilere Özel Fırsatlar | Vodafone Pay",
    description: pageMeta?.seoDescription || "Vodafone Pay'in nakit iade ve indirim kampanyalarını incele, avantajlardan yararlan.",
    keywords: pageMeta?.seoKeywords || undefined,
    path: "/kampanyalar",
    image: pageMeta?.ogImage?.url,
  });
}

export default async function Kampanyalar() {
  // E3: this page used to fall back to 3+19 hardcoded fake campaigns
  // whenever the CMS was unreachable — that's the actual bug the user
  // reported ("kampanyalar sayfası güncellenmiyor"): the CMS had died, but
  // the page kept silently showing stale placeholder content instead of
  // any visible sign something was wrong. `null` = CMS fetch/parse failed,
  // `[]` = CMS reachable but genuinely has zero campaigns — rendered
  // differently (ContentUnavailable) instead of masked with fake data.
  const [cmsCampaigns, cmsFaqItems, categories, allLabel] = await Promise.all([
    getCampaigns(),
    getFaqItems("kampanyalar"),
    getCategories("campaign"),
    getTranslation("filterTabs.all", "Tümü"),
  ]);

  // RFP feedback 5.2: ONE list carrying the `featured` flag, not two
  // pre-split arrays — see CampaignsFilterableList for why the split had to
  // move out of here.
  // 02.09.2026: no description or dates — the live site's campaign cards are
  // just image + title + "Detayları gör" (see CardListGrid's removal note).
  const campaigns: FilterableCampaign[] = (cmsCampaigns ?? []).map((c) => ({
    id: c.id,
    image: c.image.url,
    imageAlt: c.image.alt || c.title,
    title: c.title,
    href: c.ctaUrl || (c.slug ? `/kampanyalar/${c.slug}` : "/kampanyalar"),
    category: c.category?.slug,
    linkLabel: c.ctaLabel,
    featured: c.featured,
  }));
  const faqs: FaqItem[] = (cmsFaqItems ?? []).map((f) => ({ question: f.question, answer: f.answer, deeplink: f.deeplink }));

  const pageMeta = await getPageMeta("/kampanyalar");

  let content: ReactNode;
  if (cmsCampaigns === null || campaigns.length === 0) {
    content = (
      <>
        <CampaignsHeader />
        <section className="mx-auto w-full max-w-[1280px] px-4 pb-20">
          <ContentUnavailable variant={cmsCampaigns === null ? "error" : "empty"} />
        </section>
      </>
    );
  } else {
    const listProps = { campaigns, categories: categories ?? [], allLabel };
    // useSearchParams (?kategori=) needs a Suspense boundary to keep the page
    // statically renderable; the fallback is the same list under "Tümü".
    content = (
      <Suspense fallback={<CampaignsFilterableListFallback {...listProps} />}>
        <CampaignsFilterableList {...listProps} />
      </Suspense>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <AppDownloadBanner />
      <Header />
      <Breadcrumb current={pageMeta?.breadcrumbLabel || "Kampanyalar"} />

      {content}

      <Faq items={faqs} />
      <Footer />
    </main>
  );
}
