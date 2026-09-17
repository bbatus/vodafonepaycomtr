/** Live campaign pages show dates as `01.09.2026 - 30.09.2026` (Istanbul time, so a UTC-midnight CMS date never shifts a day). */
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" });

/** The "Kampanya Tarihi" value, or null when the campaign has no dates at all (the box is then not rendered). */
export function campaignDateRange(startDate?: string | null, endDate?: string | null): string | null {
  if (startDate && endDate) return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  if (startDate) return `${formatDate(startDate)} tarihinden itibaren`;
  if (endDate) return `${formatDate(endDate)} tarihine kadar`;
  return null;
}
