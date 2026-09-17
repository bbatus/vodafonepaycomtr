import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import Image from "next/image";
import { AppDownloadBanner } from "@/components/AppDownloadBanner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PreviewBanner } from "@/components/PreviewBanner";
import { getCampaignBySlug, getCampaigns } from "@/lib/cms";
import { buildMetadata } from "@/lib/metadata";
import { RichText, hasRichTextContent } from "@/components/RichText";
import { campaignDateRange } from "@/lib/campaignDate";
import { CampaignContentBox } from "./CampaignContentBox";

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

/**
 * Live parity: `widget_Campaign` on a vodafonepay.com.tr campaign page, e.g.
 * /kampanyalar/yemeksepeti-harcamana-400tlye-varan-avantaj (17.09.2026,
 * computed styles):
 *
 * - no breadcrumb; the whole widget sits on #f4f4f4 (`pb-5`), content `mb-20`
 * - white hero band (`mb-10`): a 1280px row, 90px gap —
 *   left column (lg only) 500px, centred, a 300px-wide title in
 *   VodafoneRegular 28/32; right column the 500×400 campaign visual. Below lg
 *   the title (bold 30/36, centred) and the description (VodafoneLight 18/28)
 *   sit under the visual on gray-100.
 * - info row (`px-5 py-8`, centred, 16px gap — the live markup also says
 *   `my-8`, but its `.con { margin: 0 auto }` rule overrides that, so there
 *   is no vertical margin in practice): icon (36px) + label
 *   18/26 black + value 18/26 #4D4D4D, per box `p-4 gap-x-4`, 8px radius;
 *   below lg they become a sideways-scrolling strip of 220px #f2f2f2 cards.
 *   17.09.2026 user request: every box is optional — "Kampanya Tarihi" needs
 *   a start or end date, "Tanımlama Süresi"/"Katılım" their CMS text; a box
 *   with no value is not rendered, and with none at all the row isn't either.
 * - "Kampanya Detay" (lg only on live, `!mb-4`) and "Kampanya Koşulları"
 *   boxes — see CampaignContentBox. Detay shows the rich body, falling back
 *   to the plain description when the body is empty; a box with nothing to
 *   show is not rendered.
 */
export default async function KampanyaDetay({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { isEnabled: isPreview } = await draftMode();
  const campaign = await getCampaignBySlug(slug, { preview: isPreview });
  if (!campaign) notFound();

  const dateRange = campaignDateRange(campaign.startDate, campaign.endDate);
  const infoBoxes = [
    dateRange && { icon: "/images/kampanya/kampanya-tarihi.svg", iconAlt: "Takvim", label: "Kampanya Tarihi", value: dateRange },
    campaign.assignmentPeriod && {
      icon: "/images/kampanya/tanimlama-suresi.svg",
      iconAlt: "Onaylı takvim",
      label: "Tanımlama Süresi",
      value: campaign.assignmentPeriod,
    },
    campaign.participation && { icon: "/images/kampanya/katilim.svg", iconAlt: "Katılım", label: "Katılım", value: campaign.participation },
  ].filter((b): b is { icon: string; iconAlt: string; label: string; value: string } => Boolean(b));

  const hasBody = hasRichTextContent(campaign.body);
  const hasDetail = hasBody || Boolean(campaign.description?.trim());
  const hasTerms = hasRichTextContent(campaign.terms);

  return (
    <main className="flex min-h-screen flex-col">
      {isPreview && <PreviewBanner path={`/kampanyalar/${slug}`} />}
      <AppDownloadBanner />
      <Header />

      <div className="w-full bg-[#f4f4f4] pb-5 font-sans subpixel-antialiased">
        <div className="mb-20 w-full">
          <div className="mb-10 bg-white">
            <div className="mx-auto flex max-w-[1280px] flex-col gap-x-[90px] lg:flex-row">
              <div className="hidden w-full max-w-[500px] flex-col items-center justify-center lg:flex">
                <div className="w-[300px]">
                  <h1 className="font-sans text-[28px] leading-8 tracking-normal text-black">{campaign.title}</h1>
                </div>
              </div>
              <div className="w-full lg:flex lg:w-[500px] lg:flex-col">
                <Image
                  src={campaign.image.url}
                  alt={campaign.image.alt || campaign.title}
                  width={500}
                  height={400}
                  priority
                  className="h-auto w-full"
                />
                <div className="flex w-full flex-col justify-center bg-gray-100 px-4 pt-4 lg:hidden lg:px-0">
                  <p className="text-center text-3xl leading-9 tracking-normal [font-weight:700]">{campaign.title}</p>
                  <p className="my-4 text-center font-light text-lg leading-7 tracking-normal text-black">{campaign.description}</p>
                </div>
              </div>
            </div>

            {infoBoxes.length > 0 && (
              <div className="mx-auto w-full max-w-[1280px] px-5 py-8">
                <div className="overflow-x-auto [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden">
                  <div className="flex gap-4 lg:justify-center">
                    {infoBoxes.map((box) => (
                      <div
                        key={box.label}
                        className="flex w-[220px] shrink-0 gap-x-4 rounded-[8px] bg-[#f2f2f2] p-4 lg:w-auto lg:bg-transparent"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG icon, same as live */}
                        <img className="w-9" src={box.icon} alt={box.iconAlt} />
                        <div className="flex flex-col">
                          <span className="text-[18px] leading-[26px] tracking-normal text-black">{box.label}</span>
                          <span className="text-[18px] leading-[26px] tracking-normal text-[#4D4D4D]">{box.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {hasDetail && (
            <CampaignContentBox title="Kampanya Detay" className={hasTerms ? "!mb-4 hidden lg:block" : "hidden lg:block"}>
              {hasBody ? <RichText data={campaign.body} /> : <p>{campaign.description}</p>}
            </CampaignContentBox>
          )}

          {hasTerms && (
            <CampaignContentBox title="Kampanya Koşulları">
              <RichText data={campaign.terms} />
            </CampaignContentBox>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
