import Image from "next/image";
import Link from "next/link";

/**
 * 01.09.2026 kullanıcı geri bildirimiyle değişti: bu component eskiden
 * masaüstünde başlığı görselin İÇİNE, beyaz bir overlay olarak biniyordu
 * (vodafonepay.com.tr'nin /aninda-bakiye'deki `.slide-image` deseniyle
 * eşleşecek şekilde) — ama `heading` artık opsiyonel (Pages.ts) ve editör
 * sadece görsel de kullanabiliyor; overlay deseni başlık girildiğinde
 * okunabilirliği görsele göre değişken hale getiriyordu. Artık TEK,
 * öngörülebilir bir düzen: görsel üstte tam biçiminde, başlık/alt
 * başlık/buton onun ALTINDA, kendi padding'li bloğunda — hiçbir breakpoint'te
 * görselin üzerine binmiyor. `heading` boşsa o blok hiç render edilmiyor.
 *
 * Live geometry (korunuyor): 1030px max width, `rounded-[12px]`, image 322px
 * tall on desktop.
 *
 * The `w-full` next to `mx-auto` is load-bearing, here and in every other
 * section component: the page's `<main>` is `flex flex-col`, and a flex item
 * with `mx-auto` shrinks to its max-content width instead of stretching. So
 * `mx-auto max-w-[1030px]` alone produced a column as narrow as its own text
 * — a rich-text section measured 367px instead of 1030px, centred, while the
 * hero (whose image declares width=1030) happened to look right. Only the
 * campaign grid escaped it, because that one already carried `w-full`.
 */
export function ProductHero({
  image,
  imageAlt,
  heading,
  subheading,
  ctaLabel,
  ctaUrl,
}: {
  image: string;
  imageAlt: string;
  heading?: string | null;
  subheading?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
}) {
  const cta =
    ctaLabel && ctaUrl ? (
      <Link href={ctaUrl} className="inline-block w-fit rounded bg-vf-red px-6 py-3 text-sm font-bold text-white">
        {ctaLabel}
      </Link>
    ) : null;

  return (
    <section className="mx-auto w-full max-w-[1030px] px-4 lg:pt-4">
      <div className="overflow-hidden rounded-xl">
        <Image
          src={image}
          alt={imageAlt}
          width={1030}
          height={322}
          priority
          className="h-[240px] w-full object-cover lg:h-[322px]"
        />
      </div>

      {heading && (
        <div className="flex flex-col gap-y-4 px-4 py-8 lg:px-0">
          <h1 className="text-3xl font-bold leading-tight text-black lg:text-4xl">{heading}</h1>
          {subheading && <p className="text-lg font-light leading-7 text-gray-600">{subheading}</p>}
          {cta}
        </div>
      )}
    </section>
  );
}
