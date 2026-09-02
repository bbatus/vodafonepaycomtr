import type { MetadataRoute } from "next";
import { getBlogPosts, getCampaigns, getPages, getRepresentatives } from "@/lib/cms";
import { HOMEPAGE_SLUG } from "@/lib/homepage";

const SITE_URL = process.env.SITE_URL || "http://localhost:3000";

/**
 * Hand-written routes under src/app only. Anything that lives in the Pages
 * collection is picked up from the CMS below instead — listing it here too
 * emits the same <loc> twice.
 *
 * `/aninda-bakiye`, `/qr-ile-faturana-yansit` and `/vodafone-pay-uygulama`
 * used to be here and were removed when they were migrated onto Pages: the
 * duplicate was invisible until `getPages()` was fixed, because that getter
 * had been returning null and contributing nothing at all.
 *
 * 02.09.2026: `/faturana-yansit` and `/vodafone-pay-kart` went the same way and
 * were left behind here — there is no `src/app/faturana-yansit` or
 * `src/app/vodafone-pay-kart` any more, both are Pages documents. The dedupe at
 * the bottom hid it, but the list still claimed two routes this app does not
 * have.
 */
const STATIC_ROUTES = [
  "",
  "/bilgi-guvenligi",
  "/blog",
  "/cerez-politikasi",
  "/duyurular",
  "/faydali-bilgiler",
  "/gizlilik-ve-guvenlik-politikasi",
  "/iletisim",
  "/kampanyalar",
  "/kurumsal-yonetim",
  "/sikca-sorulan-sorular",
  "/site-haritasi",
  "/sozlesmeler-ve-formlar",
  "/temsilciliklerimiz",
  "/ucretler-ve-limitler",
  "/web-sitesi-hukum-ve-sartlari",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [campaigns, blogPosts, representatives, pages] = await Promise.all([
    getCampaigns(),
    getBlogPosts(),
    getRepresentatives(),
    getPages(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const campaignEntries: MetadataRoute.Sitemap = (campaigns ?? [])
    .filter((c): c is typeof c & { slug: string } => Boolean(c.slug))
    .map((c) => ({ url: `${SITE_URL}/kampanyalar/${c.slug}` }));

  const blogEntries: MetadataRoute.Sitemap = (blogPosts ?? []).map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
  }));

  const representativeEntries: MetadataRoute.Sitemap = (representatives ?? []).map((r) => ({
    url: `${SITE_URL}/temsilci/${r.id}`,
  }));

  // The homepage document is served at `/` (already in STATIC_ROUTES as ""),
  // and `/anasayfa` 308-redirects there — listing it would advertise a URL
  // that only bounces.
  const editorPageEntries: MetadataRoute.Sitemap = (pages ?? [])
    .filter((p) => p.slug !== HOMEPAGE_SLUG)
    .map((p) => ({ url: `${SITE_URL}/${p.slug}` }));

  const all = [...staticEntries, ...campaignEntries, ...blogEntries, ...representativeEntries, ...editorPageEntries];

  // Belt-and-braces: an editor is free to create a Page whose slug matches a
  // hand-written route, and a sitemap must not list the same URL twice.
  // First occurrence wins, so a static entry keeps its lastModified.
  return [...new Map(all.map((entry) => [entry.url, entry])).values()];
}
