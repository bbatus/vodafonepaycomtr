import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppDownloadBanner } from "@/components/AppDownloadBanner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageSpotlight } from "@/components/PageSpotlight";
import { getContactInfo, getPageMeta } from "@/lib/cms";
import { buildMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = await getPageMeta("/iletisim");
  return buildMetadata({
    title: pageMeta?.seoTitle || "Vodafone Pay İletişim | Müşteri Hizmetleri",
    description: pageMeta?.seoDescription || "Vodafone Pay şirket bilgileri, müşteri hizmetleri ve denetim mercii iletişim bilgileri.",
    keywords: pageMeta?.seoKeywords || undefined,
    path: "/iletisim",
    image: pageMeta?.ogImage?.url,
  });
}

/**
 * RFP feedback 5.0 (fallback masking audit) — KEPT DELIBERATELY: legally
 * required company details must never render blank. These are the live
 * vodafonepay.com.tr values (17.09.2026) — the same the CMS global holds.
 */
const fallback = {
  companyName: "Vodafone Elektronik Para ve Ödeme A.Ş.",
  tradeRegistryNo: "605026-0",
  address: "Maslak Mahallesi Büyükdere Caddesi no:251 Sarıyer/ İstanbul",
  phone: "+90 212 367 00 00",
  kepAddress: "vodafoneelektronikpara@hs03.kep.tr",
  customerServiceText: "Müşteri Hizmetlerimize 0212 942 21 21 numarasını arayarak ulaşabilirsiniz.\nÇağrı merkezimiz 7 gün 08:00-02:00 arası hizmet vermektedir.",
  tcmbAddress: "İdare Merkezi\nHacı Bayram Mah. İstiklal Cad. No:10\n06050 Ulus Altındağ Ankara",
  tcmbPhone: "(0312) 507 5000",
  tcmbFax: "(0312) 507 5640",
  tcmbKep: "merkezbankasi@hs02.kep.tr",
  pressRelationsUrl: "http://medyamerkezi.vodafone.com.tr/",
};

/** One `<br>` between lines, as the live cells are written. */
function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={`${line}-${i}`}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
    </>
  );
}

/** Row index counted like the live CSS: `tr:nth-child(7) { height: 260px }` (a live quirk, reproduced). */
const QUIRK_TALL_ROW = 7;

/**
 * Live parity (17.09.2026, `widget_VpayOtherSpotlight` + `FooterPages\ContactInfo`):
 * - no breadcrumb; the title banner (PageSpotlight), then a #F2F2F2 band
 * - `max-w-[1030px] px-4 lg:px-0 py-10`: "İletişim" VodafoneRegularBold
 *   24/lg:32 `mb-6`, then a white `rounded-2xl shadow-sm` box with the table
 * - the table uses the same rules as /ucretler-ve-limitler: 104px rows with a
 *   #E5E5E5 divider (none after the last), `padding 32px 40px`, even rows
 *   #FAFAFA, 16px outer corners, the 7th row at least 260px; label column in
 *   the browser's bold sans-serif (the live `VodafoneBold` face is never
 *   declared), value column VodafoneRegular 15/1.5 #333
 * - below 1060px each row stacks: label 14px `pt-6 pb-3`, value 14px `pb-6`,
 *   20px side padding (32px up to 980px)
 * - the press-relations address is plain text, as live
 */
export default async function Iletisim() {
  const info = (await getContactInfo()) ?? fallback;

  const rows: { label: string; value: ReactNode }[] = [
    { label: "Şirket Unvanı", value: info.companyName },
    { label: "Ticaret Sicil No", value: info.tradeRegistryNo },
    { label: "Merkezinin Bulunduğu Yer", value: info.address },
    { label: "Vodafone Merkez Telefon Numarası", value: info.phone },
    { label: "Kep Adresi", value: info.kepAddress },
    { label: "Vodafone Pay Müşteri Hizmetleri", value: <Lines lines={info.customerServiceText.split("\n")} /> },
    {
      label: "Denetim Merci",
      value: (
        <Lines
          lines={[
            "TÜRKİYE CUMHURİYET MERKEZ BANKASI",
            ...info.tcmbAddress.split("\n"),
            "Telefon:",
            info.tcmbPhone,
            "Faks:",
            info.tcmbFax,
            "Kayıtlı Elektronik Posta(KEP):",
            info.tcmbKep,
          ]}
        />
      ),
    },
    ...(info.pressRelationsUrl ? [{ label: "Basın Bültenleri ve Medya İlişkileri", value: info.pressRelationsUrl }] : []),
  ];

  const pageMeta = await getPageMeta("/iletisim");
  const last = rows.length;

  return (
    <main className="flex min-h-screen flex-col">
      <AppDownloadBanner />
      <Header />
      <PageSpotlight title={pageMeta?.breadcrumbLabel || "İletişim"} />

      <section className="w-full bg-[#F2F2F2] subpixel-antialiased">
        <div className="mx-auto w-full max-w-[1030px] px-4 py-10 lg:px-0">
          <h2 className="mb-6 font-bold text-2xl text-black [font-weight:400] lg:text-[32px] lg:leading-tight">İletişim</h2>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm lg:overflow-hidden">
            <table className="w-full max-w-[1028px] table-fixed border-collapse max-[1060px]:block">
              <tbody className="max-[1060px]:block">
                {rows.map((row, i) => {
                  const n = i + 1;
                  const isFirst = n === 1;
                  const isLast = n === last;
                  return (
                    <tr
                      key={row.label}
                      className={cn(
                        "max-[1060px]:block max-[1060px]:h-auto max-[1060px]:min-h-0",
                        n === QUIRK_TALL_ROW ? "h-[260px] min-h-[260px]" : "h-[104px] min-h-[104px]",
                        !isLast && "border-b border-[#E5E5E5]",
                        n % 2 === 0 && "bg-[#FAFAFA]"
                      )}
                    >
                      <td
                        className={cn(
                          "w-[514px] px-10 py-8 text-left align-middle text-[15px] leading-[1.4] text-black [font-family:sans-serif] [font-weight:700]",
                          "max-[1060px]:block max-[1060px]:w-full max-[1060px]:px-5 max-[1060px]:pt-6 max-[1060px]:pb-3 max-[1060px]:text-sm max-[980px]:px-8",
                          isFirst && "rounded-tl-[16px]",
                          isLast && "rounded-bl-[16px]"
                        )}
                      >
                        {row.label}
                      </td>
                      <td
                        className={cn(
                          "w-[514px] px-10 py-8 text-left align-middle font-sans text-[15px] leading-[1.5] text-[#333]",
                          "max-[1060px]:block max-[1060px]:w-full max-[1060px]:px-5 max-[1060px]:pt-0 max-[1060px]:pb-6 max-[1060px]:text-sm max-[980px]:px-8",
                          isFirst && "rounded-tr-[16px]",
                          isLast && "rounded-br-[16px]"
                        )}
                      >
                        {row.value}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
