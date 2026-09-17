import type { CSSProperties } from "react";
import Link from "next/link";
import { campaignToCard, getFooterBlogPosts, getFooterCampaigns, getFooterSettings, getNavLinks } from "@/lib/cms";

interface FooterLink {
  label: string;
  href: string;
}

type LinkSection = "footer-kurumsal" | "footer-yasal";

// Fallback masking audit (KEPT DELIBERATELY) — the left column and the bottom
// row only. The CMS collection behind these two sections has real, published
// rows (seeded from this exact list — see docs/RFP-OPEN-ITEMS.md §9), so this
// only ever fires if that data somehow comes back empty. The blog and
// campaign columns have NO fallback, on purpose: they are driven by each
// record's own "Footer'da Göster" flag, so nothing flagged means an empty
// column, not hardcoded copy.
const FALLBACK_LINKS: Record<LinkSection, FooterLink[]> = {
  "footer-kurumsal": [
    { label: "Temsilciliklerimiz", href: "/temsilciliklerimiz" },
    { label: "İletişim", href: "/iletisim" },
    { label: "Kurumsal Yönetim", href: "/kurumsal-yonetim" },
    { label: "Duyurular", href: "/duyurular" },
    { label: "Bilgi Toplum Hizmetleri", href: "https://e-sirket.mkk.com.tr/?page=company&company=21693#" },
  ],
  "footer-yasal": [
    { label: "Site Haritası", href: "/site-haritasi" },
    { label: "Gizlilik ve Güvenlik Politikası", href: "/gizlilik-ve-guvenlik-politikasi" },
    { label: "Çerez Politikası", href: "/cerez-politikasi" },
    { label: "Bilgi Güvenliği", href: "/bilgi-guvenligi" },
    { label: "Sözleşmeler ve Formlar", href: "/sozlesmeler-ve-formlar" },
    { label: "Web Sitesi Kullanımı Hüküm ve Şartları", href: "/web-sitesi-hukum-ve-sartlari" },
    { label: "Faydalı Bilgiler", href: "/faydali-bilgiler" },
  ],
};

/** The live site's own assets — used whenever the Footer Yönetimi record leaves an image empty. */
const DEFAULT_BACKGROUND = "/images/footer/footer-bg.svg";
const DEFAULT_QR = "/images/footer/sticky-qr.png";
/** Only used when the CMS itself can't be reached; an editor who clears the field hides the icon. */
const DEFAULT_LINKEDIN = "https://www.linkedin.com/company/vodafone-elektronik-para-ve-%C3%B6deme-hizmetleri-a-%C5%9F/";

function FooterAnchor({ link, className }: { link: FooterLink; className: string }) {
  if (/^https?:\/\//.test(link.href)) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

/**
 * Live parity: `widget_Footer` on vodafonepay.com.tr (17.09.2026, computed
 * styles):
 * - lg+: 480px tall, the background image (Footer Yönetimi, default the live
 *   footer.svg) covering it from the left edge; below lg the live site's
 *   black→red gradient (88.93°, rgba(0,0,0,.9) 43.49% → rgba(230,0,0,.9))
 *   and natural height
 * - a 1280px row, `mt-4 lg:mt-20`, white text: the 220px QR card (lg only,
 *   `mr-10`), then three equal columns —
 *   left: corporate pages (Menü Linkleri "footer-kurumsal"), VodafoneLight
 *   18/28 `py-2`, divided by #999 lines below lg; then the 36px LinkedIn icon
 *   middle: blog posts with "Footer'da Göster", VodafoneRegular 18/28 `py-1`
 *   right: campaigns with "Footer'da Göster", same style
 *   (middle and right are desktop-only, as on the live site)
 * - bottom row: legal pages (Menü Linkleri "footer-yasal"), VodafoneLight
 *   16/20, centred, `gap-x-8 mt-6 lg:mt-9 pb-5`, 1×20px white separators
 * No column titles and no FAQ column — the live footer has neither.
 */
export async function Footer() {
  const [cmsLinks, blogPosts, campaigns, settings] = await Promise.all([
    getNavLinks(),
    getFooterBlogPosts(),
    getFooterCampaigns(),
    getFooterSettings(),
  ]);

  const linksFor = (section: LinkSection): FooterLink[] => {
    const fromCms = (cmsLinks ?? []).filter((l) => l.section === section).map((l) => ({ label: l.label, href: l.href }));
    return fromCms.length ? fromCms : FALLBACK_LINKS[section];
  };
  const corporate = linksFor("footer-kurumsal");
  const legal = linksFor("footer-yasal");
  const blogLinks: FooterLink[] = (blogPosts ?? []).map((p) => ({ label: p.title, href: `/blog/${p.slug}` }));
  const campaignLinks: FooterLink[] = (campaigns ?? []).map((c) => ({ label: c.title, href: campaignToCard(c).href }));

  const background = settings?.backgroundImage?.url || DEFAULT_BACKGROUND;
  const qr = settings?.qrImage?.url || DEFAULT_QR;
  const linkedinUrl = settings === null ? DEFAULT_LINKEDIN : settings.linkedinUrl;
  // The background is CMS-managed, so it can't be a static class; it is passed
  // as a CSS variable and applied only from lg up, exactly like the live CSS.
  const backgroundVar = { "--footer-bg": `url("${background}")` } as CSSProperties;

  return (
    <footer
      id="site-footer"
      style={backgroundVar}
      className="mt-auto w-full bg-[linear-gradient(88.93deg,rgba(0,0,0,0.9)_43.49%,rgba(230,0,0,0.9))] bg-cover bg-center bg-no-repeat subpixel-antialiased lg:h-[480px] lg:bg-(image:--footer-bg) lg:bg-[position:0_center]"
    >
      <div className="flex w-full justify-center">
        <div className="mt-4 flex w-full max-w-7xl flex-col text-white lg:mt-20 lg:flex-row">
          {/* eslint-disable-next-line @next/next/no-img-element -- CMS-managed image of arbitrary size, shown at the live 220px width */}
          <img src={qr} alt="Vodafone Pay QR Kodu" loading="lazy" className="mx-auto mr-10 hidden w-[220px] self-start lg:block" />

          <div className="flex w-full flex-col px-3 lg:w-1/3 lg:px-0">
            <div className="h-1 w-full border-t border-[#999999] lg:hidden" />
            {corporate.map((link) => (
              <FooterAnchor
                key={link.href + link.label}
                link={link}
                className="border-b border-[#999999] py-2 font-light text-lg leading-7 lg:border-0"
              />
            ))}
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG icon, same as live */}
                <img src="/images/footer/linkedin-light.svg" alt="LinkedIn" width={36} height={36} loading="lazy" className="my-4 lg:my-0" />
              </a>
            )}
          </div>

          <div className="hidden w-1/3 flex-col px-3 font-sans lg:flex lg:px-0">
            {blogLinks.map((link) => (
              <FooterAnchor key={link.href} link={link} className="py-1 text-lg leading-7" />
            ))}
          </div>

          <div className="hidden w-1/3 flex-col px-3 font-sans lg:flex lg:px-0">
            {campaignLinks.map((link) => (
              <FooterAnchor key={link.href} link={link} className="py-1 text-lg leading-7" />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl">
        <div className="mt-6 flex w-full flex-col items-center justify-center gap-x-8 gap-y-5 pb-5 lg:mt-9 lg:flex-row">
          {legal.map((link, i) => (
            <span key={link.href + link.label} className="contents">
              {i > 0 && <span className="hidden h-5 w-px bg-white lg:block" aria-hidden="true" />}
              <FooterAnchor link={link} className="text-center font-light text-base leading-5 text-white" />
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
