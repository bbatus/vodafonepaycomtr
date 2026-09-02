import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import Image from "next/image";
import { AppDownloadBanner } from "@/components/AppDownloadBanner";
import { Header } from "@/components/Header";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Footer } from "@/components/Footer";
import { PreviewBanner } from "@/components/PreviewBanner";
import { CampaignDate } from "@/components/CampaignDate";
import { getCampaignBySlug, getCampaigns } from "@/lib/cms";
import { buildMetadata } from "@/lib/metadata";
import { RichText, hasRichTextContent } from "@/components/RichText";

export async function generateStaticParams() {
  const campaigns = await getCampaigns();
  return (campaigns ?? [])
    .filter((c): c is typeof c & { slug: string } => Boolean(c.slug))
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) return {};
  return buildMetadata({
    title: campaign.seoTitle || `${campaign.title} | Vodafone Pay`,
    description: campaign.seoDescription || campaign.description,
    keywords: campaign.seoKeywords || undefined,
    path: `/kampanyalar/${campaign.slug}`,
    image: campaign.image.url,
  });
}

export default async function KampanyaDetay({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { isEnabled: isPreview } = await draftMode();
  const campaign = await getCampaignBySlug(slug, { preview: isPreview });
  if (!campaign) notFound();

  const hasDetails = hasRichTextContent(campaign.body) || hasRichTextContent(campaign.terms);

  return (
    <main className="flex min-h-screen flex-col">
      {isPreview && <PreviewBanner path={`/kampanyalar/${slug}`} />}
      <AppDownloadBanner />
      <Header />
      <Breadcrumb current={campaign.title} />

      {/* 02.09.2026 kullanıcı geri bildirimi, canlı vodafonepay.com.tr'a göre:
          başlık/açıklama/tarih solda bir sütun, görsel sağda — üstteki tek
          sütun + altında geniş görsel düzeni yerine. */}
      <section className="mx-auto w-full max-w-[1030px] px-4 pb-10">
        <div className="flex flex-col-reverse items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-[420px]">
            <h1 className="text-[32px] font-light leading-[40px] text-black">{campaign.title}</h1>
            <p className="mt-4 text-base text-gray-700">{campaign.description}</p>
            <CampaignDate startDate={campaign.startDate} endDate={campaign.endDate} className="mt-4" />
          </div>
          <Image
            src={campaign.image.url}
            alt={campaign.image.alt || campaign.title}
            width={520}
            height={340}
            className="h-auto w-full rounded-md object-cover lg:w-[520px]"
          />
        </div>
      </section>

      {/* Canlı sitede "Kampanya Detay"tan footera kadar olan alan gri
          (rgb(244,244,244)) bir section wrapper — bizde her yer beyazdı.
          İçerik yoksa (ne body ne terms) bu bölüm hiç render edilmiyor. */}
      {hasDetails && (
        <section className="w-full bg-[#f4f4f4] py-10">
          <div className="mx-auto w-full max-w-[840px] px-4">
            {hasRichTextContent(campaign.body) && (
              <div>
                <h2 className="text-xl font-bold text-black">Kampanya Detay</h2>
                <div className="mt-3">
                  <RichText data={campaign.body} />
                </div>
              </div>
            )}

            {hasRichTextContent(campaign.terms) && (
              <div className="mt-10">
                <h2 className="text-xl font-bold text-black">Kampanya Koşulları</h2>
                <div className="mt-3 text-sm text-gray-600">
                  <RichText data={campaign.terms} />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
