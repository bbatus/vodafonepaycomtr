import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppDownloadBanner } from "@/components/AppDownloadBanner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getPageBySlug, getPageMeta } from "@/lib/cms";
import { HOMEPAGE_SLUG } from "@/lib/homepage";
import { BlockRenderer } from "@/app/[...slug]/page";
import { buildMetadata } from "@/lib/metadata";

/**
 * 02.09.2026 — the homepage must never be baked at build time.
 *
 * `/` is a static route, so Next prerendered it during `next build` and served
 * that HTML for the next hour (`initialRevalidateSeconds: 3600`). The build
 * runs in a container that may not reach the CMS at all, and when the fetch
 * failed the OLD code quietly fell back to a hardcoded homepage and shipped
 * it — reproduced here: `/` served the hand-built composition while
 * `/anasayfa` served the editor's real page, from the same deploy, with no
 * error anywhere. Every other route fails loudly (404) when its content is
 * missing; only this one had a plausible-looking wrong answer to give.
 *
 * `revalidate = 0` renders the route per request instead. It does NOT disable
 * the CMS fetch cache: `cmsFetch` sets its own positive `next.revalidate`, and
 * this version's docs are explicit that route-level `0` "leaves fetch requests
 * that opt into 'force-cache' or use a positive revalidate as is"
 * (node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md).
 * So the homepage still serves from the same tag-invalidated cache the rest of
 * the site uses — it just can't be frozen into the image.
 */
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = await getPageMeta("/");
  return buildMetadata({
    title: pageMeta?.seoTitle || "Vodafone Pay | Yeni Nesil Mobil Cüzdan",
    description:
      pageMeta?.seoDescription ||
      "Vodafone Pay ile cüzdanınıza bakış açınız kökten değişiyor, hazır mısınız? Vodafone Pay hakkında detaylı bilgi almak için tıklayın.",
    keywords: pageMeta?.seoKeywords || undefined,
    path: "/",
    image: pageMeta?.ogImage?.url,
  });
}

/**
 * `/` renders the `anasayfa` Pages document and nothing else.
 *
 * There used to be a hardcoded composition (Hero + Campaigns + Faq) behind
 * this as a "the CMS might be down" safety net. It was removed on the user's
 * call: a fallback that renders a DIFFERENT homepage doesn't protect anyone,
 * it hides the outage and makes the CMS look like it isn't in charge of its
 * own site. If the document is missing or unpublished, that is a real error
 * and now looks like one.
 *
 * `/` never reaches the [...slug] catch-all (Next resolves this static route
 * first), so the document has to be read here explicitly.
 */
export default async function Home() {
  const cmsHomepage = await getPageBySlug(HOMEPAGE_SLUG);
  if (!cmsHomepage || cmsHomepage.layout.length === 0) notFound();

  return (
    <main className="flex min-h-screen flex-col">
      <AppDownloadBanner />
      <Header />
      {cmsHomepage.layout.map((block) => (
        <BlockRenderer key={block.id ?? JSON.stringify(block)} block={block} />
      ))}
      <Footer />
    </main>
  );
}
