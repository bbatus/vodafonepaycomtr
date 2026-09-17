import type { Metadata } from "next";
import { AppDownloadBanner } from "@/components/AppDownloadBanner";
import { Header } from "@/components/Header";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { PageSpotlight } from "@/components/PageSpotlight";
import { getAnnouncements, getPageMeta } from "@/lib/cms";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = await getPageMeta("/duyurular");
  return buildMetadata({
    title: pageMeta?.seoTitle || "Vodafone Pay Duyurular | Resmî Bildirimler ve Açıklamalar",
    description: pageMeta?.seoDescription || "Vodafone Pay'e ait resmî duyurular, bildirimler ve açıklamalar.",
    keywords: pageMeta?.seoKeywords || undefined,
    path: "/duyurular",
    image: pageMeta?.ogImage?.url,
  });
}

/**
 * Live parity: vodafonepay.com.tr/duyurular (17.09.2026) is the breadcrumb,
 * the dark→red title banner (`VpayOtherSpotlight` → PageSpotlight) and a
 * `General\FAQs` accordion holding the announcements — the same block the
 * product pages use (Faq variant="block": several answers open at once,
 * 28px heading, 1030px column).
 *
 * The live block's heading reads "Sıkça Sorulan Sorular" — almost certainly a
 * content mistake on the live page; by the user's decision (17.09.2026) ours
 * says "Duyurular". Everything else matches.
 *
 * Announcements.body is plain text: its blank-line paragraphs become separate
 * `<p>`s, so an editor's paragraph breaks survive as on the old accordion.
 */
export default async function Duyurular() {
  const [cmsAnnouncements, pageMeta] = await Promise.all([getAnnouncements(), getPageMeta("/duyurular")]);
  const label = pageMeta?.breadcrumbLabel || "Duyurular";

  const items = (cmsAnnouncements ?? []).map((a) => ({
    question: a.title,
    answer: a.body,
    deeplink: a.deeplink,
  }));

  return (
    <main className="flex min-h-screen flex-col">
      <AppDownloadBanner />
      <Header />
      <Breadcrumb current={label} />
      <PageSpotlight title={label} />
      <Faq items={items} heading="Duyurular" />
      <Footer />
    </main>
  );
}
