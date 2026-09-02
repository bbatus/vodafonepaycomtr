import Image from "next/image";
import Link from "next/link";

const DEFAULT_BACKGROUND = "/images/leadform-banner.svg";
const DEFAULT_ICON = "/images/leadform-icon.svg";
const DEFAULT_TEXT = "Vodafone Pay ile Faturana Yansıt üye işyerimiz olun, Vodafone Pay avantajlarından yararlanın.";
const DEFAULT_CTA_LABEL = "Formu doldurun";

export type LeadFormCtaProps = {
  backgroundImage?: { url: string; alt?: string } | null;
  icon?: { url: string; alt?: string } | null;
  text?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};

/**
 * Every prop is optional: the CMS block's fields were added on 02.09.2026
 * (see Pages.ts's LeadFormCtaBlock), and a page that already had the block
 * with no data must keep rendering exactly as it did — so each field falls
 * back to what used to be hardcoded here.
 */
export function LeadFormCta({ backgroundImage, icon, text, ctaLabel, ctaUrl }: LeadFormCtaProps = {}) {
  const label = ctaLabel?.trim() || DEFAULT_CTA_LABEL;
  const buttonClass =
    "w-full max-w-[160px] rounded-md bg-vf-red px-4 py-2 text-center text-sm font-bold text-white transition-opacity hover:opacity-80";

  return (
    <section className="mx-auto w-full max-w-[1030px] px-4 py-8">
      <div
        className="flex items-center justify-center gap-x-6 rounded-md bg-cover bg-center px-6 py-7"
        style={{ backgroundImage: `url(${backgroundImage?.url ?? DEFAULT_BACKGROUND})` }}
      >
        <Image
          src={icon?.url ?? DEFAULT_ICON}
          alt={icon?.alt ?? ""}
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 object-contain"
          unoptimized
        />
        <div className="flex w-full max-w-[300px] flex-col items-center gap-y-4 text-center text-white">
          <p className="text-sm font-bold">{text?.trim() || DEFAULT_TEXT}</p>
          {ctaUrl ? (
            <Link href={ctaUrl} className={buttonClass}>
              {label}
            </Link>
          ) : (
            <button type="button" className={buttonClass}>
              {label}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
