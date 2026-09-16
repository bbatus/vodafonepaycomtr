import { HeaderClient } from "@/components/HeaderClient";
import { getNavLinks, getProductsMenuPages } from "@/lib/cms";
import type { NavLink } from "@/types/homepage";

/**
 * RFP feedback 5.0 (fallback masking audit) — KEPT DELIBERATELY.
 *
 * NavLinks(header-products/header-main) and Pages(showInProductsMenu) are all
 * seeded and published now (29.08 migration), so this array is dead in normal
 * operation — same status as Footer's `fallbackColumns`. It stays for the same
 * reason: a safety net if that data ever comes back genuinely empty (an outage,
 * a bad migration), not padding for missing content.
 */
const fallbackProductLinks: NavLink[] = [
  { label: "Vodafone Pay Uygulaması", href: "/vodafone-pay-uygulama" },
  { label: "Vodafone Pay Kart", href: "/vodafone-pay-kart" },
  { label: "QR ile Faturana Yansıt", href: "/qr-ile-faturana-yansit" },
  { label: "Faturana Yansıt", href: "/faturana-yansit" },
  { label: "Anında Bakiye", href: "/aninda-bakiye" },
];

const fallbackNavLinks: NavLink[] = [
  { label: "Kampanyalar", href: "/kampanyalar" },
  { label: "Blog", href: "/blog" },
  { label: "Ücretler ve Limitler", href: "/ucretler-ve-limitler" },
  { label: "Sıkça Sorulan Sorular", href: "/sikca-sorulan-sorular" },
];

export async function Header() {
  const [cmsLinks, productPages] = await Promise.all([getNavLinks(), getProductsMenuPages()]);

  const toLink = (l: NonNullable<typeof cmsLinks>[number]): NavLink => ({ label: l.label, href: l.href, mobileHref: l.mobileHref });

  /**
   * The "Ürünler" dropdown has exactly ONE source: a Pages document ticking
   * its own `showInProductsMenu` box.
   *
   * It used to have two — this also merged NavLinks(section=header-products)
   * — and the two were concatenated and sorted but never deduplicated by
   * href. An editor who created a nav link AND ticked the box on the page at
   * the same address got the same page listed twice in the menu (reported
   * live 16.09.2026). Rather than dedupe, the second source was removed at
   * the CMS end (see NavLinks.ts's `section` options for the full reasoning
   * and what capability that gave up), which makes the duplicate structurally
   * impossible instead of merely filtered.
   *
   * Sorted by the page's own 1-based `productsMenuOrder`. A page with no
   * explicit number sorts last — the CMS hook normally assigns one, so this
   * only covers rows written before that field existed.
   */
  const productLinks: NavLink[] = (productPages ?? [])
    .map((p) => ({
      link: { label: p.productsMenuLabel || p.title, href: `/${p.slug}` },
      order: p.productsMenuOrder ?? Number.MAX_SAFE_INTEGER,
    }))
    .sort((a, b) => a.order - b.order)
    .map((p) => p.link);

  const navLinks = cmsLinks?.length
    ? cmsLinks.filter((l) => l.section === "header-main").map(toLink)
    : fallbackNavLinks;

  return (
    <HeaderClient
      productLinks={productLinks.length ? productLinks : fallbackProductLinks}
      navLinks={navLinks.length ? navLinks : fallbackNavLinks}
    />
  );
}
