import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BlogCardItem {
  id?: string;
  image: string;
  imageAlt?: string;
  title: string;
  href: string;
  /** One-line teaser under the title — list cards only; "Daha fazlasını keşfedin" cards have none. */
  excerpt?: string;
  linkLabel?: string | null;
  category?: string;
}

/**
 * Live parity: the blog `.campaign-card` on vodafonepay.com.tr/blog and the
 * "Daha fazlasını keşfedin" cards under a post (17.09.2026, computed styles).
 * Same frame as the campaign card (361px, 6px radius, shadow-md, p-5,
 * 321×180 contained image), with the blog's own differences:
 * - cards are centred in their grid cell (`mx-auto`), 360px below lg
 * - title VodafoneBold 20/28 #333 in a fixed 56px (`h-14`) box, clamped the
 *   way the live markup clamps it (`line-clamp-1` on a `flow-root` box —
 *   Chrome shows up to two lines with an ellipsis ending the first)
 * - list cards add a one-line teaser: system sans-serif 16px #666, centred,
 *   `mb-6`, cut with an ellipsis; its paragraph carries the live posts' own
 *   Word paragraph spacing (8px above — the bottom margin is clipped by the
 *   one-line box — and a 21.28px line height), which every live teaser has
 * - "Detayları gör" 18/26 #E60000 + 20px #BD0000 chevron, system sans-serif
 */
const SYSTEM_SANS = "[font-family:ui-sans-serif,system-ui,sans-serif]";

export function BlogCard({ item }: { item: BlogCardItem }) {
  return (
    <div className="mx-auto w-full max-w-[360px] cursor-pointer overflow-hidden rounded-[6px] bg-white p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] lg:max-w-[361px]">
      <Link href={item.href} className="relative block">
        <Image
          src={item.image}
          alt={item.imageAlt || item.title}
          width={321}
          height={180}
          className="h-[180px] w-full object-contain"
        />
      </Link>
      <div className="mt-[15px]">
        <Link href={item.href}>
          <h3 className="mb-2 line-clamp-1 h-14 font-bold text-[20px] leading-[28px] tracking-normal text-[#333] [display:flow-root]">
            {item.title}
          </h3>
        </Link>
        {item.excerpt !== undefined && (
          <div
            className={cn(
              "mb-6 line-clamp-1 overflow-hidden text-ellipsis whitespace-nowrap text-center text-[16px] leading-[24px] tracking-normal text-[#666] [display:flow-root]",
              SYSTEM_SANS
            )}
          >
            <p className="mt-2 mb-0 overflow-hidden text-ellipsis text-justify leading-[21.28px]">{item.excerpt}</p>
          </div>
        )}
        <div className="flex w-full justify-center">
          <Link
            href={item.href}
            className={cn("inline-flex items-center gap-2 text-[18px] leading-[26px] tracking-normal text-[#E60000]", SYSTEM_SANS)}
          >
            {item.linkLabel || "Detayları gör"}
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M6.4585 2.91699L13.5418 10.0003L6.4585 17.0837" stroke="#BD0000" strokeMiterlimit={10} strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * `variant="list"` — /blog: grid `lg:ml-8`. `variant="related"` — "Daha
 * fazlasını keşfedin": no left offset. Both: title VodafoneBold 24/lg:28,
 * leading 34px, centred below lg; grid `mt-2 lg:mt-10 gap-6`, 1/2/3 columns.
 */
export function BlogGrid({ title, items, variant = "list" }: { title: string; items: BlogCardItem[]; variant?: "list" | "related" }) {
  if (items.length === 0) return null;
  return (
    <>
      <h2 className="flex justify-center text-center font-bold text-[24px] leading-[34px] tracking-normal text-black lg:justify-start lg:text-left lg:text-[28px]">
        {title}
      </h2>
      <div className={cn("mt-2 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-10 lg:grid-cols-3", variant === "list" && "lg:ml-8")}>
        {items.map((item) => (
          <BlogCard key={item.id ?? item.href} item={item} />
        ))}
      </div>
    </>
  );
}
