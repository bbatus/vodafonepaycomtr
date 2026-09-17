import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface CampaignCardItem {
  id?: string;
  image: string;
  imageAlt?: string;
  title: string;
  href: string;
  linkLabel?: string | null;
  category?: string;
}

/**
 * Live parity: `.campaign-card` / `.campaign-grid-container` from
 * vodafonepay.com.tr/kampanyalar (17.09.2026, computed styles):
 * - card `max-w-[361px] w-full bg-white rounded-md (6px) shadow-md p-5`,
 *   image `h-[180px] w-full object-contain` (321×180, never cropped)
 * - body `mt-[15px]`; title VodafoneRegularBold (= our VodafoneBold face)
 *   20/28 #333 `mb-2`
 * - "Detayları gör" centered, 18/26 #E60000 with a 20×20 #BD0000 chevron,
 *   8px gap. The live link carries a `font-vodafone-regular` class the live
 *   stylesheet never defines, so it renders in the system sans-serif —
 *   reproduced.
 * - grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2 lg:mt-10
 *   lg:ml-8`; section title VodafoneBold 24/lg:28, leading 34px, centered
 *   below lg. "Bu ayın favorileri" cards carry an extra `mb-10`.
 * Radii are px: this site's theme scales `rounded-md` off `--radius`.
 */
const SYSTEM_SANS = "[font-family:ui-sans-serif,system-ui,sans-serif]";

export function CampaignCard({ item, spaced = false }: { item: CampaignCardItem; spaced?: boolean }) {
  return (
    <div
      className={cn(
        "w-full max-w-[361px] cursor-pointer overflow-hidden rounded-[6px] bg-white p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] max-[700px]:mx-auto max-[700px]:max-w-[420px]",
        spaced && "mb-10"
      )}
    >
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
          <h3 className="mb-2 font-bold text-[20px] leading-[28px] tracking-normal text-[#333]">{item.title}</h3>
        </Link>
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

export function CampaignGrid({
  title,
  items,
  first = false,
  spaced = false,
}: {
  title: string;
  items: CampaignCardItem[];
  /** The first section title on the live page carries `mt-5`. */
  first?: boolean;
  /** "Bu ayın favorileri" cards carry an extra `mb-10`. */
  spaced?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <>
      <h2
        className={cn(
          "flex justify-center text-center font-bold text-[24px] leading-[34px] tracking-normal text-black lg:justify-start lg:text-left lg:text-[28px]",
          first && "mt-5"
        )}
      >
        {title}
      </h2>
      <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-10 lg:ml-8 lg:grid-cols-3">
        {items.map((item) => (
          <CampaignCard key={item.id ?? item.title} item={item} spaced={spaced} />
        ))}
      </div>
    </>
  );
}
