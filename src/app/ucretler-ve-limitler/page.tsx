import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppDownloadBanner } from "@/components/AppDownloadBanner";
import { Header } from "@/components/Header";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { PricesAndLimits } from "@/components/PricesAndLimits";
import { Footer } from "@/components/Footer";
import { getFeeRows, getLimitTables, getPageMeta } from "@/lib/cms";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = await getPageMeta("/ucretler-ve-limitler");
  return buildMetadata({
    title: pageMeta?.seoTitle || "Ücretler ve Limitler | Vodafone Pay",
    description: pageMeta?.seoDescription || "Vodafone Pay ürün ve hizmetlerine ait güncel ücret ve limit bilgileri.",
    keywords: pageMeta?.seoKeywords || undefined,
    path: "/ucretler-ve-limitler",
    image: pageMeta?.ogImage?.url,
  });
}

export default async function UcretlerVeLimitler() {
  // `null` = CMS fetch/parse failed, `[]` = CMS reachable but genuinely has
  // zero rows yet — same ContentUnavailable pattern as kampanyalar/blog.
  // No hardcoded fallback numbers any more (see PricesAndLimits.tsx).
  const [cmsFeeRows, cmsLimitTables] = await Promise.all([getFeeRows(), getLimitTables()]);

  const feeRows = cmsFeeRows ?? [];
  const limitTables = cmsLimitTables ?? [];

  const pageMeta = await getPageMeta("/ucretler-ve-limitler");

  let content: ReactNode;
  if (cmsFeeRows === null && cmsLimitTables === null) {
    content = <ContentUnavailable variant="error" />;
  } else if (feeRows.length === 0 && limitTables.length === 0) {
    content = <ContentUnavailable variant="empty" />;
  } else {
    content = <PricesAndLimits feeRows={feeRows} limitTables={limitTables} />;
  }

  return (
    <main className="flex min-h-screen flex-col">
      <AppDownloadBanner />
      <Header />
      <Breadcrumb current={pageMeta?.breadcrumbLabel || "Ücretler ve Limitler"} />
      {/* 17.09.2026: the live page shows no visible title here — the grey
          fees band starts right under the breadcrumb. Kept for screen readers
          and SEO, hidden visually. */}
      <h1 className="sr-only">Ücretler ve Limitler</h1>
      {content}
      <Footer />
    </main>
  );
}
