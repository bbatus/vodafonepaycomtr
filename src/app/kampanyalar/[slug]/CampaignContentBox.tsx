"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Live parity: one `.campaign-content` box ("Kampanya Detay" / "Kampanya
 * Koşulları") from a vodafonepay.com.tr campaign page (17.09.2026):
 * - `max-w-[1280px] mx-auto bg-white px-10 py-[50px] shadow-md`
 * - title VodafoneRegularBold 28/34 #333, `mb-8`
 * - `.textarea-content`: VodafoneRegular 16/24 #333; paragraphs `mb-4`;
 *   bulleted lists drop the native marker for a 20px bold black "•" 8px in,
 *   items `pl-6 mb-4`; links #007bff underlined
 * - collapsed to 350px with an 80px white fade when the content is taller;
 *   only then a "Devamını Oku" button (16/20 #E60000 + 20px chevron, `mt-4
 *   py-4`) appears, and expanding rotates the chevron.
 */
const COLLAPSED_HEIGHT = 350;

export function CampaignContentBox({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollHeight > COLLAPSED_HEIGHT + 1);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const collapsed = overflows && !expanded;

  return (
    <div className={cn("mx-auto w-full max-w-[1280px] bg-white px-10 py-[50px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]", className)}>
      <h2 className="mb-8 font-bold text-[28px] leading-[34px] text-[#333]">{title}</h2>
      <div
        ref={contentRef}
        className={cn(
          "relative overflow-hidden font-sans text-base leading-6 text-[#333] transition-[max-height] duration-300",
          collapsed &&
            "max-h-[350px] after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:h-20 after:w-full after:bg-gradient-to-b after:from-white/0 after:to-white after:content-['']",
          "[&_p]:mb-4 [&_p]:text-base [&_p]:leading-6 [&_p]:text-[#333]",
          "[&_ul]:m-0 [&_ul]:list-none [&_ul]:p-0",
          "[&_ul>li]:relative [&_ul>li]:mb-4 [&_ul>li]:pl-6 [&_ul>li]:text-base [&_ul>li]:leading-6 [&_ul>li]:text-[#333]",
          "[&_ul>li]:before:absolute [&_ul>li]:before:left-2 [&_ul>li]:before:text-[20px] [&_ul>li]:before:font-bold [&_ul>li]:before:text-black [&_ul>li]:before:content-['•']",
          "[&_a]:cursor-pointer [&_a]:!text-[#007bff] [&_a]:!underline hover:[&_a]:!text-[#0056b3]"
        )}
      >
        {children}
      </div>
      {overflows && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 flex cursor-pointer items-center gap-x-2 border-none bg-transparent py-4 hover:opacity-80"
        >
          <span className="font-sans text-[16px] leading-5 tracking-normal text-[#E60000]">
            {expanded ? "Daha Az Göster" : "Devamını Oku"}
          </span>
          <svg
            width={20}
            height={20}
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={cn("transition-transform duration-300", expanded && "rotate-180")}
          >
            <path d="M17.0837 6.45801L10.0003 13.5413L2.91699 6.45801" stroke="#E60000" strokeMiterlimit={10} strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
