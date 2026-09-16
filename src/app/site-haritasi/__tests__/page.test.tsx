import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SiteHaritasi from "@/app/site-haritasi/page";
import { getNavLinks, getPageMeta, getProductsMenuPages } from "@/lib/cms";

vi.mock("@/lib/cms", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cms")>("@/lib/cms");
  return { ...actual, getNavLinks: vi.fn(), getPageMeta: vi.fn(), getProductsMenuPages: vi.fn() };
});
vi.mock("@/components/Header", () => ({ Header: () => <header>Header</header> }));
vi.mock("@/components/Footer", () => ({ Footer: () => <footer>Footer</footer> }));

describe("SiteHaritasi", () => {
  beforeEach(() => {
    vi.mocked(getProductsMenuPages).mockResolvedValue(null);
  });

  it("falls back to its own hardcoded group list when the CMS has no nav links", async () => {
    vi.mocked(getNavLinks).mockResolvedValue(null);
    vi.mocked(getPageMeta).mockResolvedValue(null);

    render(await SiteHaritasi());

    expect(screen.getByText("Vodafone Pay Uygulaması")).toBeInTheDocument();
  });

  it("builds groups from CMS nav links, sectioned and sorted by order", async () => {
    vi.mocked(getNavLinks).mockResolvedValue([
      { label: "İkinci", href: "/ikinci", section: "header-main", order: 2 },
      { label: "Birinci", href: "/birinci", section: "header-main", order: 1 },
    ] as never);
    vi.mocked(getPageMeta).mockResolvedValue(null);

    render(await SiteHaritasi());

    const links = screen.getAllByRole("link").map((a) => a.textContent);
    expect(links.indexOf("Birinci")).toBeLessThan(links.indexOf("İkinci"));
    expect(screen.queryByText("Vodafone Pay Uygulaması")).not.toBeInTheDocument();
  });

  /**
   * 16.09.2026: the "Ürünler" group used to come from
   * NavLinks(section=header-products), a section the CMS no longer has. It is
   * built from the same Pages source the header uses now — if that wiring is
   * ever dropped, this page loses its entire products group silently, which is
   * exactly what this test exists to catch.
   */
  it("builds the Ürünler group from the pages that opted into the products menu", async () => {
    vi.mocked(getNavLinks).mockResolvedValue([
      { label: "Blog", href: "/blog", section: "header-main", order: 1 },
    ] as never);
    vi.mocked(getProductsMenuPages).mockResolvedValue([
      { id: "1", title: "Anında Bakiye", slug: "aninda-bakiye", productsMenuOrder: 2 },
      { id: "2", title: "Vodafone Pay Kart Nedir?", slug: "vodafone-pay-kart", productsMenuLabel: "Vodafone Pay Kart", productsMenuOrder: 1 },
    ] as never);
    vi.mocked(getPageMeta).mockResolvedValue(null);

    render(await SiteHaritasi());

    expect(screen.getByText("Ürünler")).toBeInTheDocument();
    const kart = screen.getByRole("link", { name: "Vodafone Pay Kart" });
    expect(kart).toHaveAttribute("href", "/vodafone-pay-kart");
    // productsMenuOrder wins over the order they arrived in.
    const links = screen.getAllByRole("link").map((a) => a.textContent);
    expect(links.indexOf("Vodafone Pay Kart")).toBeLessThan(links.indexOf("Anında Bakiye"));
  });
});
