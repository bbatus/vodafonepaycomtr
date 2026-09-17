import type { Metadata } from "next";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AppDownloadBanner } from "@/components/AppDownloadBanner";
import { Header } from "@/components/Header";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Footer } from "@/components/Footer";
import { BlogGrid, type BlogCardItem } from "@/components/BlogCard";
import { getBlogPostBySlug, getBlogPosts, richTextToPlainText, type CmsBlogPost } from "@/lib/cms";
import { buildMetadata } from "@/lib/metadata";
import { RichText } from "@/components/RichText";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return (posts ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.seoTitle || `${post.title} | Vodafone Pay`,
    description: post.seoDescription || richTextToPlainText(post.body, 155),
    keywords: post.seoKeywords || undefined,
    path: `/blog/${post.slug}`,
    image: post.coverImage.url,
  });
}

const RELATED_COUNT = 3;

/** Live shows the badge as `23.07.2026` (Istanbul time, so a UTC-midnight CMS date never shifts a day). */
const formatBadgeDate = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" });

const toRelatedCard = (p: CmsBlogPost): BlogCardItem => ({
  id: p.id,
  image: p.coverImage.url,
  imageAlt: p.coverImage.alt || p.title,
  title: p.title,
  href: `/blog/${p.slug}`,
  linkLabel: p.ctaLabel,
});

/**
 * "Daha fazlasını keşfedin": the editor's own picks (BlogPosts.relatedPosts)
 * when set; otherwise other posts from the same category, topped up with the
 * newest posts. Never the current post, never a duplicate.
 */
function pickRelated(current: { id: string; category: { slug: string } | null; relatedPosts?: CmsBlogPost[] }, all: CmsBlogPost[]) {
  const others = all.filter((p) => p.id !== current.id);
  const picked = current.relatedPosts ?? [];
  if (picked.length > 0) return picked.filter((p) => p.id !== current.id).slice(0, RELATED_COUNT);
  const sameCategory = current.category ? others.filter((p) => p.category?.slug === current.category?.slug) : [];
  const rest = others.filter((p) => !sameCategory.includes(p));
  return [...sameCategory, ...rest].slice(0, RELATED_COUNT);
}

/**
 * Body typography — the live post template's `.textarea-content` rules
 * (17.09.2026, read from its CSSOM; the Word-pasted inline styles inside
 * individual posts are not reproduced):
 * - column `max-w-[1280px]`, VodafoneLight 16/24 #333; `px-4` below 1024px
 * - paragraphs VodafoneLight 16/20, `mb-4`
 * - h1–h3 VodafoneLight 28/32 #333, `mb-4` (20/24 below 1024px)
 * - bulleted lists: no native marker, a 20px bold #E60000 "•" 8px in, items
 *   VodafoneRegular 16/24 `pl-6 mb-4`
 * - images and embeds centred
 * - links #1f6feb, not underlined — what readers see on every live post
 * - tables as the live posts render them: 1px #D9D9D9 grid, 9.33/6.67px cell
 *   padding, 20px line height, red header row, pink (#FCE4E4) every other
 *   body row, natural width, square corners
 */
const BODY_CLASSES = cn(
  "mx-auto w-full max-w-[1280px] overflow-hidden font-light text-base leading-6 text-[#333] max-[1023px]:px-4",
  "[&_p]:mb-4 [&_p]:font-light [&_p]:text-base [&_p]:leading-5 [&_p]:text-[#333]",
  "[&_h1]:mt-0 [&_h1]:mb-4 [&_h1]:font-light [&_h1]:text-[28px] [&_h1]:leading-8 [&_h1]:text-[#333] max-[1023px]:[&_h1]:text-xl max-[1023px]:[&_h1]:leading-6",
  "[&_h2]:mt-0 [&_h2]:mb-4 [&_h2]:font-light [&_h2]:text-[28px] [&_h2]:leading-8 [&_h2]:text-[#333] max-[1023px]:[&_h2]:text-xl max-[1023px]:[&_h2]:leading-6",
  "[&_h3]:mt-0 [&_h3]:mb-4 [&_h3]:font-light [&_h3]:text-[28px] [&_h3]:leading-8 [&_h3]:text-[#333] max-[1023px]:[&_h3]:text-xl max-[1023px]:[&_h3]:leading-6",
  "[&_ul]:m-0 [&_ul]:list-none [&_ul]:p-0",
  "[&_ul>li]:relative [&_ul>li]:mb-4 [&_ul>li]:pl-6 [&_ul>li]:font-sans [&_ul>li]:text-base [&_ul>li]:leading-6 [&_ul>li]:text-[#333]",
  "[&_ul>li]:before:absolute [&_ul>li]:before:left-2 [&_ul>li]:before:text-[20px] [&_ul>li]:before:font-bold [&_ul>li]:before:text-[#E60000] [&_ul>li]:before:content-['•']",
  "[&_img]:mx-auto [&_iframe]:mx-auto",
  "[&_a]:!text-[#1f6feb] [&_a]:!no-underline",
  "[&_.lexical-table-container]:!rounded-none [&_.lexical-table]:!w-auto [&_.lexical-table]:!rounded-none",
  "[&_.lexical-table-cell]:!border [&_.lexical-table-cell]:!border-solid [&_.lexical-table-cell]:!border-[#D9D9D9] [&_.lexical-table-cell]:!px-[9.33px] [&_.lexical-table-cell]:!py-[6.67px] [&_.lexical-table-cell]:!leading-5",
  "[&_.lexical-table-cell_p]:!my-0.5 [&_.lexical-table-cell_p]:!mb-0.5 [&_.lexical-table-row:not(:first-child):nth-child(odd)_.lexical-table-cell]:!bg-[#FCE4E4]",
  // The header row's paragraphs must stay white, bold on the Light face like live (`<strong>` in VodafoneLight) (the generic `p` colour above would repaint them #333 on red).
  "[&_.lexical-table-row:first-child_.lexical-table-cell_p]:![font-weight:700] [&_.lexical-table-row:first-child_.lexical-table-cell_p]:!font-light [&_.lexical-table-row:first-child_.lexical-table-cell_p]:!text-white"
);

/**
 * Live parity: `widget_Blog` on a vodafonepay.com.tr post, e.g.
 * /blog/ulasim-karti-bakiye-yukleme-yollari-vodafone-pay (17.09.2026,
 * computed styles):
 * - the post's own breadcrumb: "Vodafone Pay Bloglar" → /blog, VodafoneLight,
 *   `py-3` (Breadcrumb variant="blog")
 * - hero (`mb-10`, white): 1280px row, 90px gap —
 *   left column (lg only) 500px, centred 300px-wide title VodafoneLight
 *   28/32, and pinned to its bottom-right corner the date badge: 120×40,
 *   white VodafoneRegular 16px on a 45° #820000→#E60000 gradient;
 *   right column `min-w-[700px] mx-auto` with the 450px-wide cover image.
 *   Below lg the title (VodafoneLight 18/28, centred) and the badge (14px)
 *   sit under the image on grey.
 *   17.09.2026 user request: the badge is optional — no publishedDate, no badge.
 * - 80px later the body (BODY_CLASSES)
 * - "Daha fazlasını keşfedin": `max-w-[1280px] px-4 py-10 lg:py-16`, three
 *   centred cards without teasers (BlogGrid variant="related"); the section
 *   isn't rendered when there's nothing to show
 */
export default async function BlogYazisi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getBlogPostBySlug(slug), getBlogPosts()]);
  if (!post) notFound();

  const badgeDate = post.publishedDate ? formatBadgeDate(post.publishedDate) : null;
  const related = pickRelated(post, allPosts ?? []).map(toRelatedCard);
  const gradient = "bg-[linear-gradient(45deg,#820000,#e60000)]";

  return (
    <main className="flex min-h-screen flex-col">
      <AppDownloadBanner />
      <Header />
      <ArticleJsonLd
        title={post.title}
        description={richTextToPlainText(post.body, 160)}
        image={post.coverImage.url}
        path={`/blog/${post.slug}`}
        publishedDate={post.publishedDate ?? post.createdAt}
      />
      <BreadcrumbJsonLd current={post.title} path={`/blog/${post.slug}`} trail={[{ label: "Blog", href: "/blog" }]} />

      <div className="w-full bg-white pb-5 font-sans subpixel-antialiased">
        <div className="bg-white">
          <Breadcrumb variant="blog" root={{ label: "Vodafone Pay Bloglar", href: "/blog" }} current={post.title} />
        </div>

        <div className="w-full lg:mb-20">
          <div className="mb-10 bg-white">
            <div className="mx-auto flex max-w-[1280px] flex-col gap-x-[90px] lg:flex-row">
              <div className="relative hidden w-full max-w-[500px] flex-col items-center justify-center lg:flex">
                <div className="w-[300px]">
                  <h1 className="font-light text-[28px] leading-8 tracking-normal text-black">{post.title}</h1>
                </div>
                {badgeDate && (
                  <div
                    className={cn(
                      "absolute right-0 bottom-0 flex h-10 w-[120px] flex-col items-center justify-center font-sans text-base text-white",
                      gradient
                    )}
                  >
                    {badgeDate}
                  </div>
                )}
              </div>
              <div className="lg:mx-auto lg:flex lg:min-w-[700px] lg:flex-col">
                <Image
                  src={post.coverImage.url}
                  alt={post.coverImage.alt || post.title}
                  width={450}
                  height={253}
                  priority
                  className="h-auto w-[450px] max-w-full max-lg:mx-auto"
                />
                <div className="relative lg:hidden">
                  <div className="flex w-full flex-col justify-center bg-gray-100 px-4 pt-4">
                    <p className="my-4 text-center font-light text-lg leading-7 tracking-normal text-black">{post.title}</p>
                  </div>
                  {badgeDate && (
                    <div className="flex justify-center bg-[#f3f4f6] py-4 pt-7">
                      <div
                        className={cn(
                          "absolute bottom-0 mb-3 flex h-10 w-[120px] flex-col items-center justify-center font-light text-sm text-white",
                          gradient
                        )}
                      >
                        {badgeDate}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={BODY_CLASSES}>
          <RichText data={post.body} />
          {post.deeplink && (
            <Link href={post.deeplink} className="mb-4 inline-block">
              İlgili bağlantı →
            </Link>
          )}
        </div>

        {related.length > 0 && (
          <div className="mx-auto w-full max-w-[1280px] px-4 py-10 lg:py-16">
            <BlogGrid variant="related" title="Daha fazlasını keşfedin" items={related} />
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
