import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { StepProduct } from "@/types/homepage";

/**
 * RFP feedback 5.0 (fallback masking audit): this section used to fall back to
 * a hardcoded copy of its content whenever the CMS returned nothing, so an
 * outage or an empty collection looked identical to a healthy page and no one
 * could tell the CMS had stopped feeding it. The prop is required now and an
 * empty list renders nothing — see docs for which collections still keep a
 * fallback (the ones with zero rows, where the fallback IS the live content).
 */
const DEFAULT_HEADING = "Vodafone Pay'de bizi neler bekliyor ?";
const DEFAULT_DESCRIPTION =
  "Vodafone Pay'in Faturana Yansıt, Vodafone Pay Kart ve Cüzdan ürünleriyle kolay ve güvenli bir şekilde alışveriş yapıp yüzlerce TL nakit iade ve indirim kazanabileceğiniz bir dünya sizi bekliyor.";

/**
 * `heading`/`description` became props so the CMS `stepPhones` block can drive
 * this section — they used to be hardcoded, which is why the homepage could
 * not be rebuilt from the block library. The homepage passes nothing and keeps
 * the copy it has always shown.
 */
export function StepPhones({
  steps,
  heading = DEFAULT_HEADING,
  description = DEFAULT_DESCRIPTION,
}: {
  steps: StepProduct[];
  heading?: string;
  description?: string;
}) {
  if (steps.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1030px] px-4 py-16 lg:px-0">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold text-black lg:text-[36px] lg:leading-[40px]">{heading}</h2>
        <p className="mt-4 text-base text-gray-600">{description}</p>
      </div>

      {/* 01.09.2026 kullanıcı geri bildirimi: satırlar artık solda/sağda
          DÖNMÜYOR — görsel her adımda tutarlı olarak solda, metin sağda. */}
      <div className="mt-12 flex flex-col gap-y-16">
        {steps.map((step) => (
          <ScrollReveal key={step.title} className="flex flex-col items-center gap-8 lg:flex-row lg:gap-16">
            <div className="w-full max-w-[280px] shrink-0">
              <Image
                src={step.image}
                alt={step.imageAlt}
                width={560}
                height={1150}
                className="h-auto w-full"
              />
            </div>
            {/* `relative` + arkaplan görseli `absolute inset-0 -z-10`: metin
                bloğu kendi normal akışında (z-index 0'ın üstünde, DOM sırasına
                göre) kalıyor, arkaplan görseli onun ARKASINA/ALTINA düşüyor,
                asla metnin üzerine binmiyor. */}
            <div className="relative max-w-md text-center lg:text-left">
              {step.backgroundImage && (
                <Image
                  src={step.backgroundImage.url}
                  alt={step.backgroundImage.alt}
                  fill
                  className="-z-10 object-contain object-center opacity-90"
                  aria-hidden="true"
                />
              )}
              <h3 className="text-2xl font-bold text-black">{step.title}</h3>
              <p className="mt-3 text-base text-gray-600">{step.description}</p>
              {step.ctaHref && step.ctaLabel && (
                <Link
                  href={step.ctaHref}
                  className="mt-4 inline-block text-sm font-bold text-vf-red hover:underline"
                >
                  {step.ctaLabel} &gt;
                </Link>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
