import { CalendarIcon } from "@/components/icons";

/**
 * RFP feedback 5.3, corrected 02.09.2026 against the live site.
 *
 * vodafonepay.com.tr renders this ONLY on the campaign DETAIL page (calendar
 * glyph + "Kampanya Tarihi" + `dd.mm.yyyy - dd.mm.yyyy`, directly under the
 * title/description column, left-aligned with them) — its listing cards carry
 * no date at all, just image + title + "Detayları gör". An earlier pass added
 * it to the cards too; that's been removed (see CardListGrid/CardListCard),
 * so this component now has exactly the one caller the live site has.
 *
 * Renders nothing at all when neither date is set.
 */
export function CampaignDate({
  startDate,
  endDate,
  className = "",
}: {
  startDate?: string;
  endDate?: string;
  className?: string;
}) {
  if (!startDate && !endDate) return null;

  const format = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });

  let range: string;
  if (startDate && endDate) {
    range = `${format(startDate)} - ${format(endDate)}`;
  } else if (startDate) {
    // Open-ended campaigns read as a start, not as a half-empty range.
    range = `${format(startDate)} tarihinden itibaren`;
  } else {
    range = `${format(endDate as string)} tarihine kadar`;
  }

  return (
    <p className={`flex items-center gap-x-2 text-sm text-gray-600 ${className}`}>
      <CalendarIcon className="h-4 w-4 shrink-0 text-vf-red" />
      <span>
        <span className="font-bold">Kampanya Tarihi</span> {range}
      </span>
    </p>
  );
}
