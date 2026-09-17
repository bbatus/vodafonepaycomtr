"use client";

import { useRef, useState, type TouchEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CampaignCard } from "@/types/homepage";
import { cn } from "@/lib/utils";

/**
 * Live parity: the homepage campaign band on vodafonepay.com.tr (17.09.2026,
 * computed styles of `widget_Homepage_VpayKampanya` plus the "Kampanyalar ·
 * İncele" row that sits just above it):
 *
 * Heading row — `max-w-[1030px] px-4 py-10`, title VodafoneRegular 40/60 at
 * weight 700 (no bold face under that name live, so the browser synthesizes
 * it — reproduced with font-sans + 700), "İncele" 16/24 #E60000 with a 24px
 * black chevron, 40px below.
 *
 * Desktop band (md+) — full-width #eeeeee, inner `max-w-[1030px] py-10`,
 * ONE campaign per slide (1030px + 16px gap, no loop, no autoplay):
 * - `flex gap-x-[80px] px-4`, image `max-w-[200px]` at its natural ratio
 * - text column `max-w-[750px] gap-y-7`: title 25/32 weight 700, description
 *   20px weight 300 (renders as Regular — no 300 cut of that face) with the
 *   live content's 20px line height, "Detayları gör" button `w-[172px]
 *   border-2 #191B1E px-8 py-2 rounded-lg text-lg`, hover bg-gray-100
 * - nav row right-aligned: two 48px white circles, 16px apart, #191B1E
 *   chevrons; the disabled end is 50% opacity + not-allowed cursor
 * - pagination: 8px dots 8px apart, white / active #E60000, starting 50px
 *   left of centre (a 300px dot row inside a 100px centred wrapper, live)
 *
 * Mobile band (<md) — `mx-4 my-[18px]` slide: 148×135 image + VodafoneBold
 * 18/28 #191B1E title side by side (25px gap), VodafoneLight 16/20 two-line
 * description, centred 202×40 "Detaylara git" button (1px border, 8px
 * radius); swipe to change, dots under it.
 *
 * RFP feedback 5.0: no hardcoded default campaigns — an empty list renders
 * nothing.
 */

const SLIDE_WIDTH = 1030;
const SLIDE_GAP = 16;

function Arrow({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg width={10} height={16} viewBox="0 0 10 16" fill="none" aria-hidden="true">
      <path
        d={direction === "next" ? "M2 1.5L8.5 8L2 14.5" : "M8 1.5L1.5 8L8 14.5"}
        stroke="#191B1E"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Campaigns({
  campaigns,
  heading = "Kampanyalar",
  moreHref = "/kampanyalar",
}: {
  campaigns: CampaignCard[];
  heading?: string;
  moreHref?: string;
}) {
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);

  if (campaigns.length === 0) return null;

  const last = campaigns.length - 1;
  const go = (i: number) => setActive(Math.max(0, Math.min(last, i)));

  const onTouchStart = (e: TouchEvent) => {
    touchStart.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
    touchStart.current = null;
  };

  const dots = (className: string) => (
    <div className={cn("flex items-center gap-2", className)}>
      {campaigns.map((c, i) => (
        <button
          type="button"
          key={c.href + i}
          aria-label={`Kampanya ${i + 1}`}
          aria-current={i === active ? "true" : undefined}
          onClick={() => go(i)}
          className={cn("h-2 w-2 cursor-pointer rounded-full transition-all duration-300", i === active ? "bg-[#E60000]" : "bg-white")}
        />
      ))}
    </div>
  );

  return (
    <section className="w-full font-sans subpixel-antialiased">
      <div className="mx-auto w-full max-w-[1030px] px-4 py-0 lg:py-10">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="font-sans text-2xl leading-8 text-black [font-weight:700] lg:text-[40px] lg:leading-[60px]">{heading}</h2>
          <Link href={moreHref} className="flex items-center text-base leading-6 text-[#E60000]">
            İncele
            <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="w-full bg-[#eeeeee]">
        {/* Desktop */}
        <div className="relative mx-auto hidden w-full max-w-[1030px] overflow-hidden md:block md:px-0 md:py-10">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${active * (SLIDE_WIDTH + SLIDE_GAP)}px)` }}
          >
            {campaigns.map((c, i) => (
              <div
                key={c.href + i}
                aria-hidden={i !== active}
                className="shrink-0"
                style={{ width: SLIDE_WIDTH, marginRight: SLIDE_GAP }}
              >
                <div className="flex gap-x-[80px] px-4">
                  <Image
                    src={c.image}
                    alt={c.imageAlt}
                    width={200}
                    height={160}
                    className="h-auto w-full max-w-[200px] self-start"
                  />
                  <div className="flex w-full max-w-[750px] flex-col gap-y-7">
                    <span className="text-[25px] leading-8 [font-weight:700]">{c.title}</span>
                    <span className="text-xl leading-5 [font-weight:300]">{c.description}</span>
                    <Link
                      href={c.href}
                      tabIndex={i === active ? undefined : -1}
                      className="w-[172px] rounded-[8px] border-2 border-[#191B1E] px-8 py-2 text-center text-lg leading-7 transition-colors [font-weight:300] hover:bg-gray-100"
                    >
                      Detayları gör
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex w-full justify-end">
            <div className="flex max-w-[120px] items-center gap-x-4">
              <button
                type="button"
                aria-label="Önceki kampanya"
                disabled={active === 0}
                onClick={() => go(active - 1)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Arrow direction="prev" />
              </button>
              <button
                type="button"
                aria-label="Sonraki kampanya"
                disabled={active === last}
                onClick={() => go(active + 1)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Arrow direction="next" />
              </button>
            </div>
          </div>
          <div className="mx-auto max-w-[100px]">{dots("w-[300px]")}</div>
        </div>

        {/* Mobile */}
        <div className="relative mx-auto w-full overflow-hidden pb-12 md:hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${active * 100}%)` }}>
            {campaigns.map((c, i) => (
              <div key={c.href + i} aria-hidden={i !== active} className="w-full shrink-0">
                <div className="mx-4 my-[18px]">
                  <div className="flex items-center gap-x-[25px]">
                    <Image src={c.image} alt={c.imageAlt} width={148} height={135} className="h-[135px] w-[148px] shrink-0 object-contain" />
                    <span className="font-bold text-lg leading-7 tracking-normal text-[#191B1E]">{c.title}</span>
                  </div>
                  <div className="my-5 h-10 font-light text-[16px] leading-5 tracking-normal">{c.description}</div>
                  <div className="flex justify-center">
                    <Link
                      href={c.href}
                      tabIndex={i === active ? undefined : -1}
                      className="mx-auto flex h-10 w-[202px] items-center justify-center rounded-[8px] border border-[#191B1E] font-light text-[16px] leading-5 tracking-normal"
                    >
                      Detaylara git
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {dots("absolute bottom-[-5px] left-0 w-full justify-center py-[10px]")}
        </div>
      </div>
    </section>
  );
}
