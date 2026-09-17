"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { RichText } from "@/components/RichText";
import type { CmsFeeRow, CmsLimitTable } from "@/lib/cms";
import { cn } from "@/lib/utils";

/**
 * Live parity: `widget_PricesAndLimits` on vodafonepay.com.tr/ucretler-ve-limitler.
 *
 * 17.09.2026 — rebuilt against the live page's OWN stylesheet rules (read
 * rule-by-rule from its CSSOM, not eyeballed), after a side-by-side capture
 * showed ours as a different design: no grey band, 44px rows instead of
 * 104px, no row dividers, no rounded corners on the fee table, no in-table
 * section headings, no note under the table. Every number below maps to a
 * live rule:
 *
 * - band: `.widget_PricesAndLimits { background #f2f2f2; padding 20px }`
 *   (≤768px: `16px 0`)
 * - tables: `table-layout fixed; width 1028px`, rows `height 104px;
 *   border-bottom 1px #e5e5e5` (none on the last), cells `padding 32px 40px`,
 *   first row cells #f2f2f2, then even rows #fafafa / odd rows #fff, outer
 *   corners 16px
 * - `tr:nth-child(7) { height: 260px }` — a live quirk, but it IS the live
 *   page, so it's reproduced (counting the header row, like the live rule).
 * - limits: last column always #e60000/white; titles 28px/34px bold with a
 *   24px `<p>&nbsp;</p>` gap below them and below each table.
 *
 * Radii are arbitrary px values on purpose: this site's theme scales
 * `rounded-lg/md/2xl` off `--radius` (10/8/18px), the live CSS is 8/6/16px.
 *
 * Fonts — read from the live page's `document.fonts`, not assumed:
 * - the live CSS sets `font-family: VodafoneBold, sans-serif` on every
 *   first-column cell, but the live site never declares a `VodafoneBold`
 *   @font-face (only VodafoneLight/Regular/RegularBold/RegularExtraBold), so
 *   those labels actually render in the browser's generic bold sans-serif
 *   (Helvetica on macOS, Arial on Windows). Reproduced as-is: the brief was
 *   a pixel-identical page. Switching them to real Vodafone Bold is a
 *   one-class change (`LABEL_FONT`) if brand consistency wins over parity.
 * - limit titles use `VodafoneRegularBold`, which IS declared (same
 *   vodafone-bold.woff as ours, identical hash) → our `font-bold` token.
 * - the live page doesn't set `-webkit-font-smoothing`; this site's root
 *   layout sets `antialiased`, which makes every glyph visibly thinner on
 *   macOS side by side. The band resets it to `subpixel-antialiased`.
 *
 * The live cells' inline `font-family: Calibri` spans are paste debris from
 * a Word document, not a design choice, and are NOT reproduced — the site's
 * rule is Vodafone webfonts only (AGENTS.md).
 */

/** Live first-column font: the generic bold sans-serif fallback of an undeclared `VodafoneBold` (see above). */
const LABEL_FONT = "[font-family:sans-serif] [font-weight:700]";

/** Row index counted like the live CSS: the header row is `tr:nth-child(1)`. */
const QUIRK_TALL_ROW = 7;

function rowBackground(childIndex: number) {
  if (childIndex === 1) return "bg-[#f2f2f2]";
  return childIndex % 2 === 0 ? "bg-[#fafafa]" : "bg-white";
}

/** Horizontal scroll wrapper with the live page's right-edge fade below 1028px, hidden once scrolled to the end. */
function ScrollWrapper({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-scrolled-end={atEnd}
      className={cn(
        "w-full overflow-x-auto max-[1028px]:relative",
        !atEnd &&
          "max-[1028px]:after:pointer-events-none max-[1028px]:after:absolute max-[1028px]:after:inset-y-0 max-[1028px]:after:right-0 max-[1028px]:after:z-[1] max-[1028px]:after:w-10 max-[1028px]:after:bg-gradient-to-l max-[1028px]:after:from-[rgba(242,242,242,0.9)] max-[1028px]:after:to-transparent max-[1028px]:after:content-['']",
        className
      )}
    >
      {children}
    </div>
  );
}

function FeeTable({ rows }: { rows: CmsFeeRow[] }) {
  const lastChild = rows.length + 1;
  const cell =
    "h-[104px] max-h-[104px] w-[500px] max-w-[500px] px-10 py-8 text-left align-middle max-[768px]:h-auto max-[768px]:max-h-none max-[768px]:min-h-20 max-[768px]:px-4 max-[768px]:py-5";
  const labelCell =
    `${LABEL_FONT} text-[15px] leading-[1.4] text-black max-[768px]:w-[200px] max-[768px]:min-w-[200px] max-[768px]:text-sm max-[480px]:w-[160px] max-[480px]:min-w-[160px] max-[480px]:text-[13px]`;
  const valueCell =
    "font-sans text-[15px] leading-[1.5] text-[#333] max-[768px]:w-[300px] max-[768px]:min-w-[300px] max-[768px]:text-sm max-[480px]:w-[250px] max-[480px]:min-w-[250px] max-[480px]:text-[13px]";

  const renderRow = (key: string, childIndex: number, label: ReactNode, value: ReactNode) => {
    const isFirst = childIndex === 1;
    const isLast = childIndex === lastChild;
    const bg = rowBackground(childIndex);
    return (
      <tr
        key={key}
        className={cn(
          childIndex === QUIRK_TALL_ROW ? "h-[260px] min-h-[260px]" : "h-[104px] min-h-[104px]",
          !isLast && "border-b border-[#e5e5e5]"
        )}
      >
        <td className={cn(cell, labelCell, bg, isFirst && "rounded-tl-[16px]", isLast && "rounded-bl-[16px]")}>{label}</td>
        <td className={cn(cell, valueCell, bg, isFirst && "rounded-tr-[16px]", isLast && "rounded-br-[16px]")}>{value}</td>
      </tr>
    );
  };

  return (
    <table className="w-[1028px] min-w-[1028px] max-w-[1028px] table-fixed border-collapse max-[768px]:w-[500px] max-[768px]:min-w-[500px] max-[480px]:w-[410px] max-[480px]:min-w-[410px]">
      <tbody>
        {/* The live table opens with an empty #f2f2f2 row — it carries the rounded top corners. */}
        {renderRow("header", 1, " ", " ")}
        {rows.map((row, i) =>
          row.rowType === "heading"
            ? renderRow(row.id, i + 2, <span className="text-2xl leading-[1.4] [font-weight:900]">{row.label}</span>, " ")
            : renderRow(
                row.id,
                i + 2,
                row.label,
                <span className={cn("whitespace-pre-line", row.highlightValue && "text-[#008a00]")}>{row.value}</span>
              )
        )}
      </tbody>
    </table>
  );
}

/**
 * Live: `<p><br>text<br><br>text</p>` followed by seven empty paragraphs — a
 * 24px line above the note, one blank line between paragraphs, 168px below.
 * Links are plain black + underline there, not the red RichText default.
 */
function FeeNotes({ notes }: { notes: CmsFeeRow[] }) {
  if (notes.length === 0) return null;
  return (
    <div className="pt-6 pb-[168px] font-sans text-base leading-6 text-black [&_a]:text-black [&_a]:underline [&_a]:underline-offset-auto [&_p]:mb-0 [&_p]:text-black [&_p+p]:mt-6 [&>*+*]:mt-6">
      {notes.map((row) => (
        <RichText key={row.id} data={row.note} />
      ))}
    </div>
  );
}

function LimitTableView({ table }: { table: CmsLimitTable }) {
  const lastChild = table.rows.length + 1;
  const cell =
    "h-[104px] max-h-[104px] w-[250px] px-10 py-8 text-left align-middle max-[1028px]:w-[200px] max-[1028px]:min-w-[200px] max-[1028px]:px-5 max-[1028px]:py-6 max-[768px]:h-auto max-[768px]:max-h-none max-[768px]:min-h-[60px] max-[768px]:w-[175px] max-[768px]:min-w-[175px] max-[768px]:px-3 max-[768px]:py-4 max-[480px]:min-h-[50px] max-[480px]:w-[145px] max-[480px]:min-w-[145px] max-[480px]:px-2.5 max-[480px]:py-3";
  const labelCell =
    `${LABEL_FONT} text-[15px] leading-[1.4] text-black max-[768px]:text-[13px] max-[768px]:leading-[1.3] max-[480px]:text-xs`;
  const plainCell = "font-sans text-base leading-6 text-black";
  const verifiedCell =
    "bg-[#e60000] font-sans text-[15px] leading-[1.5] text-white max-[768px]:text-[13px] max-[768px]:leading-[1.3] max-[480px]:text-xs";

  const renderRow = (key: string, childIndex: number, cells: [ReactNode, ReactNode, ReactNode, ReactNode]) => {
    const isFirst = childIndex === 1;
    const isLast = childIndex === lastChild;
    const bg = rowBackground(childIndex);
    return (
      <tr
        key={key}
        className={cn(
          childIndex === QUIRK_TALL_ROW
            ? "h-[260px] min-h-[260px] max-[768px]:h-auto max-[768px]:min-h-[150px]"
            : "h-[104px] min-h-[104px] max-[768px]:h-auto max-[768px]:min-h-[70px]",
          !isLast && "border-b border-[#e5e5e5]"
        )}
      >
        <td
          className={cn(
            cell,
            labelCell,
            bg,
            isFirst && "rounded-tl-[16px] max-[768px]:rounded-tl-[12px]",
            isLast && "rounded-bl-[16px] max-[768px]:rounded-bl-[12px]"
          )}
        >
          {cells[0]}
        </td>
        <td className={cn(cell, plainCell, bg, "max-[768px]:text-[13px] max-[480px]:text-xs")}>{cells[1]}</td>
        <td className={cn(cell, plainCell, bg)}>{cells[2]}</td>
        <td
          className={cn(
            cell,
            verifiedCell,
            isFirst && "rounded-tr-[16px] max-[768px]:rounded-tr-[12px]",
            isLast && "rounded-br-[16px] max-[768px]:rounded-br-[12px]"
          )}
        >
          {cells[3]}
        </td>
      </tr>
    );
  };

  return (
    <>
      <h2 className="font-bold text-[28px] leading-[34px] [font-weight:700] tracking-normal text-black max-[768px]:px-4 max-[768px]:text-[22px] max-[768px]:leading-7 max-[480px]:px-3 max-[480px]:text-xl max-[480px]:leading-[26px]">
        {table.title}
      </h2>
      <div className="h-6" aria-hidden="true" />
      <table className="w-[1028px] min-w-[1028px] max-w-[1028px] table-fixed border-collapse max-[1028px]:w-[800px] max-[1028px]:min-w-[800px] max-[1028px]:max-w-[800px] max-[768px]:w-[700px] max-[768px]:min-w-[700px] max-[768px]:max-w-[700px] max-[480px]:w-[580px] max-[480px]:min-w-[580px] max-[480px]:max-w-[580px]">
        <tbody>
          {renderRow("header", 1, [" ", "Periyot", "Doğrulama yapmamış", "Kimlik doğrulama yapılmış"])}
          {table.rows.map((row, i) =>
            renderRow(`${row.category}|${row.period}|${i}`, i + 2, [
              row.category,
              <span key="period" className="text-[#008a00]">
                {row.period}
              </span>,
              row.unverifiedLimit,
              row.verifiedLimit,
            ])
          )}
        </tbody>
      </table>
      {table.footnote && <p className="font-sans text-base leading-6 text-black">{table.footnote}</p>}
      <div className="h-6" aria-hidden="true" />
    </>
  );
}

export function PricesAndLimits({ feeRows, limitTables }: { feeRows: CmsFeeRow[]; limitTables: CmsLimitTable[] }) {
  const [tab, setTab] = useState<"ucretler" | "limitler">("ucretler");
  const tableRows = feeRows.filter((r) => r.rowType !== "note");
  const notes = feeRows.filter((r) => r.rowType === "note");

  return (
    <section className="w-full bg-[#f2f2f2] p-5 text-black subpixel-antialiased max-[768px]:px-0 max-[768px]:py-4">
      {/* Live markup: `bg-white flex items-center rounded-lg gap-x-2 w-full max-w-[300px] mx-auto my-5`;
          only the active tab carries `m-1` and the #0D0D0D fill. */}
      <div className="mx-auto my-5 flex w-full max-w-[300px] items-center gap-x-2 rounded-[8px] bg-white">
        {(["ucretler", "limitler"] as const).map((key) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => setTab(key)}
              className={cn(
                "w-full max-w-[286px] cursor-pointer rounded-[6px] py-3 text-center font-light text-xs lg:text-base",
                active ? "m-1 bg-[#0D0D0D] px-2 text-white lg:px-10" : "px-10 text-black"
              )}
            >
              {key === "ucretler" ? "Ücretler" : "Limitler"}
            </button>
          );
        })}
      </div>

      {tab === "ucretler" ? (
        <div className="mx-auto flex max-w-[1030px] flex-col p-[10px] lg:p-0">
          <ScrollWrapper className="max-[768px]:-mx-5 max-[768px]:w-[calc(100%+40px)] max-[768px]:px-5">
            <div className="h-6" aria-hidden="true" />
            <FeeTable rows={tableRows} />
            <FeeNotes notes={notes} />
          </ScrollWrapper>
        </div>
      ) : (
        <div className="mx-auto flex max-w-[1030px] flex-col p-0">
          <ScrollWrapper className="max-[768px]:-mx-4 max-[768px]:w-[calc(100%+32px)] max-[768px]:px-4">
            {limitTables.map((table) => (
              <LimitTableView key={table.id} table={table} />
            ))}
          </ScrollWrapper>
        </div>
      )}
    </section>
  );
}
