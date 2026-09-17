"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { FaqChevronIcon } from "@/components/icons";
import { RichText } from "@/components/RichText";
import type { FaqItem } from "@/types/homepage";
import { cn } from "@/lib/utils";

/**
 * Live parity for BOTH FAQ widgets on vodafonepay.com.tr — they look alike
 * but are not the same component there, and 17.09.2026 side-by-side captures
 * (computed styles + a click-by-click behaviour probe) showed where:
 *
 * `variant="block"` — `widget_General_FAQs` (homepage, product pages,
 * /kampanyalar; our Pages `faqList` block):
 * - `max-width 1030px; margin 40px auto; font-family VodafoneRegular`
 * - heading 28px / leading-tight, `font-bold` on VodafoneRegular — the live
 *   site has no bold cut declared under that name, so the browser synthesizes
 *   the weight; reproduced with font-sans + weight 700. `mt-20 mb-10` on lg.
 * - questions VodafoneRegular 16/24; SEVERAL answers can be open at once.
 * - answers 18px/27px #333 (the live answers are inline `font-size: 18px`
 *   spans, which is what visitors actually see).
 *
 * `variant="page"` — `widget_AllFaqs` (/sikca-sorulan-sorular only):
 * - list is `max-width 1280px` (wider than the block), `margin-bottom 30px`
 * - no font-family is set on that widget, so questions render in the
 *   browser's `ui-sans-serif` system stack, not a Vodafone face — reproduced.
 * - ONE answer open at a time; opening adds `margin-top 8px` above the answer;
 *   the chevron rotates 180° in 0.1s.
 * - answers 18px/24px #333.
 *
 * Shared, identical in both: card `bg-white px-5 py-[22px] rounded (4px)
 * shadow 0 2px 8px #00000029`, 20px gap, answer panel `px-5 py-4
 * bg-gray-50 (#f9fafb) rounded`, the 27×14 red chevron.
 *
 * Radii are px on purpose: this site's theme scales `rounded` off `--radius`.
 * `subpixel-antialiased`: the live page doesn't set font smoothing, this
 * site's root layout does (`antialiased`), which thins every glyph on macOS.
 *
 * RFP feedback 5.0 (fallback masking audit) still holds: `items` is required
 * and an empty list renders nothing — no hardcoded default questions.
 */

export const SYSTEM_SANS = "[font-family:ui-sans-serif,system-ui,sans-serif]";

/** `answer` is CMS rich text since 17.09.2026; a plain string is still accepted (tests, older cached payloads). */
function Answer({ answer }: { answer: FaqItem["answer"] }): ReactNode {
  if (typeof answer === "string") return <p>{answer}</p>;
  return <RichText data={answer} />;
}

export function Faq({
  items,
  showHeading = true,
  heading = "Sıkça Sorulan Sorular",
  variant = "block",
}: {
  items: FaqItem[];
  showHeading?: boolean;
  heading?: string;
  variant?: "block" | "page";
}) {
  const [open, setOpen] = useState<Set<number>>(() => new Set());

  if (items.length === 0) return null;

  const isPage = variant === "page";
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(isPage ? [] : prev);
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <section
      className={cn("w-full subpixel-antialiased", isPage ? "mb-[30px]" : "mx-auto my-10 max-w-[1030px] font-sans")}
    >
      {showHeading && !isPage && (
        <div className="mb-10 px-4 lg:px-0">
          <h2 className="mt-6 text-center font-sans text-2xl text-black [font-weight:700] lg:mt-20 lg:text-start lg:text-[28px] lg:leading-tight">
            {heading}
          </h2>
        </div>
      )}
      <div className={cn("flex flex-col gap-y-5 px-4 lg:px-0", isPage && "mx-auto max-w-[1280px]")}>
        {items.map((item, i) => {
          const isOpen = open.has(i);
          return (
            <div key={item.question}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggle(i)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-[4px] bg-white px-5 py-[22px] text-left text-base leading-6 text-black shadow-[0px_2px_8px_0px_#00000029] transition-all duration-300",
                  isPage ? SYSTEM_SANS : "font-sans"
                )}
              >
                <h3 className={cn("font-normal", isPage && "w-full max-w-[250px] lg:w-auto lg:max-w-max")}>{item.question}</h3>
                <span className="shrink-0">
                  <FaqChevronIcon
                    className={cn("block", isPage && "transition-transform duration-100", isOpen && "rotate-180")}
                  />
                </span>
              </button>
              {isOpen && (
                <div className={cn(isPage && "mt-2")}>
                  <div
                    className={cn(
                      "rounded-[4px] bg-gray-50 px-5 py-4 font-sans text-[18px] text-[#333]",
                      "[&_p]:m-0 [&_p]:text-[18px] [&_p]:text-[#333]",
                      isPage ? "leading-6 [&_p]:leading-6" : "leading-[27px] [&_p]:leading-[27px]"
                    )}
                  >
                    <Answer answer={item.answer} />
                    {item.deeplink && (
                      <Link href={item.deeplink} className="mt-3 inline-block text-sm font-bold text-vf-red hover:underline">
                        Detaylı bilgi →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
