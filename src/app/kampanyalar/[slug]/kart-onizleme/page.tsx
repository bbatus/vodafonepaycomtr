import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { CampaignCard } from "@/components/CampaignCard";
import { PreviewBanner } from "@/components/PreviewBanner";
import { getCampaignBySlug } from "@/lib/cms";

/**
 * RFP feedback: the CMS's publish-confirm modal originally embedded the full
 * detail page (huge hero image), then the full /kampanyalar list (three
 * unrelated featured cards + header/nav) — what an editor actually wants to
 * check before publishing is just this ONE card, exactly as it'll render on
 * the real listing page. Reuses CampaignCard directly (same component the
 * list page renders) so there's no separate markup to drift out of sync.
 */
export default async function KampanyaKartOnizleme({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { isEnabled: isPreview } = await draftMode();
  const campaign = await getCampaignBySlug(slug, { preview: isPreview });
  if (!campaign) notFound();

  return (
    <main className="flex min-h-screen flex-col bg-gray-100">
      {isPreview && <PreviewBanner path={`/kampanyalar/${slug}/kart-onizleme`} />}
      <div className="flex flex-1 items-center justify-center p-10">
        <CampaignCard
          item={{
            image: campaign.image.url,
            imageAlt: campaign.image.alt || campaign.title,
            title: campaign.title,
            href: campaign.ctaUrl || `/kampanyalar/${campaign.slug}`,
            category: campaign.category?.slug,
            linkLabel: campaign.ctaLabel,
          }}
        />
      </div>
    </main>
  );
}
