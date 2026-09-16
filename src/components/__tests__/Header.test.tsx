import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/Header";
import { getNavLinks, getProductsMenuPages } from "@/lib/cms";

vi.mock("@/lib/cms", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cms")>("@/lib/cms");
  return { ...actual, getNavLinks: vi.fn(), getProductsMenuPages: vi.fn() };
});

beforeEach(() => {
  // Every test that doesn't care about Pages-fed menu entries behaves as if
  // no page opted in, which is the pre-`showInProductsMenu` world.
  vi.mocked(getProductsMenuPages).mockResolvedValue(null);
});

async function renderHeader() {
  render(await Header());
}

async function openProductsMenu() {
  const user = userEvent.setup();
  const trigger = screen.getByText("Ürünler", { selector: "button" });
  await user.hover(trigger.parentElement as HTMLElement);
}

describe("Header", () => {
  it("falls back to the hardcoded product/nav links when the CMS returns nothing", async () => {
    vi.mocked(getNavLinks).mockResolvedValue(null);
    await renderHeader();

    // Desktop bar always renders alongside the mobile bar in jsdom.
    expect(screen.getAllByRole("link", { name: "Kampanyalar" }).length).toBeGreaterThan(0);
  });

  it("uses CMS nav links, split by section, over the hardcoded fallback", async () => {
    vi.mocked(getNavLinks).mockResolvedValue([
      { label: "CMS Menü Linki", href: "/cms-menu", section: "header-main", order: 1 },
    ] as never);
    await renderHeader();

    expect(screen.getByText("CMS Menü Linki")).toBeInTheDocument();
    expect(screen.queryByText("Kampanyalar")).not.toBeInTheDocument();
  });

  it("falls back to the hardcoded product links when no page opted into the Ürünler menu", async () => {
    vi.mocked(getNavLinks).mockResolvedValue([
      { label: "CMS Menü Linki", href: "/cms-menu", section: "header-main", order: 1 },
    ] as never);
    await renderHeader();
    await openProductsMenu();

    expect(screen.getByText("Vodafone Pay Kart")).toBeInTheDocument();
  });

  /**
   * 16.09.2026 regression guard. The Ürünler dropdown used to merge
   * NavLinks(section=header-products) with Pages(showInProductsMenu) without
   * deduplicating by href, so a page reachable through both routes was listed
   * twice. `header-products` is gone from the CMS; a stale row left in a
   * database that hasn't had the data migration applied must simply be
   * IGNORED here, never rendered as a second entry.
   */
  it("ignores a leftover header-products nav link instead of listing the page twice", async () => {
    vi.mocked(getNavLinks).mockResolvedValue([
      { label: "Vodafone Pay Kart", href: "/vodafone-pay-kart", section: "header-products", order: 1 },
      { label: "CMS Menü Linki", href: "/cms-menu", section: "header-main", order: 1 },
    ] as never);
    vi.mocked(getProductsMenuPages).mockResolvedValue([
      { id: "1", title: "Vodafone Pay Kart", slug: "vodafone-pay-kart", productsMenuOrder: 1 },
    ] as never);
    await renderHeader();
    await openProductsMenu();

    // Exactly one entry for the page. Before this change the same page came
    // out of both sources and was rendered twice, side by side.
    const links = screen.getAllByRole("link", { name: "Vodafone Pay Kart" });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/vodafone-pay-kart");
  });

  describe("pages that opt into the Ürünler menu themselves (showInProductsMenu)", () => {
    it("lists a page with no NavLinks record at all, linking to its own slug", async () => {
      vi.mocked(getNavLinks).mockResolvedValue(null);
      vi.mocked(getProductsMenuPages).mockResolvedValue([
        { id: "1", title: "Anında Bakiye", slug: "aninda-bakiye", productsMenuOrder: 1 },
      ] as never);
      await renderHeader();
      await openProductsMenu();

      const link = screen.getAllByRole("link", { name: "Anında Bakiye" })[0];
      expect(link).toHaveAttribute("href", "/aninda-bakiye");
      // The hardcoded fallback must not also render once a real source exists.
      expect(screen.queryByText("Faturana Yansıt")).not.toBeInTheDocument();
    });

    it("prefers productsMenuLabel over the page title when one is set", async () => {
      vi.mocked(getNavLinks).mockResolvedValue(null);
      vi.mocked(getProductsMenuPages).mockResolvedValue([
        { id: "1", title: "Vodafone Pay Kart Nedir?", slug: "vodafone-pay-kart", productsMenuLabel: "Vodafone Pay Kart", productsMenuOrder: 1 },
      ] as never);
      await renderHeader();
      await openProductsMenu();

      expect(screen.getAllByRole("link", { name: "Vodafone Pay Kart" }).length).toBeGreaterThan(0);
      expect(screen.queryByText("Vodafone Pay Kart Nedir?")).not.toBeInTheDocument();
    });

    it("orders the menu by each page's own position number", async () => {
      vi.mocked(getNavLinks).mockResolvedValue(null);
      vi.mocked(getProductsMenuPages).mockResolvedValue([
        { id: "1", title: "Üçüncü Sayfa", slug: "ucuncu", productsMenuOrder: 3 },
        { id: "3", title: "İkinci Sayfa", slug: "ikinci", productsMenuOrder: 2 },
        { id: "2", title: "Birinci Sayfa", slug: "birinci", productsMenuOrder: 1 },
      ] as never);
      await renderHeader();
      await openProductsMenu();

      // Desktop and mobile both render the dropdown, so scope to the first one.
      const labels = screen
        .getAllByRole("link")
        .map((a) => a.textContent)
        .filter((t): t is string => ["Birinci Sayfa", "İkinci Sayfa", "Üçüncü Sayfa"].includes(t ?? ""));

      expect(labels.slice(0, 3)).toEqual(["Birinci Sayfa", "İkinci Sayfa", "Üçüncü Sayfa"]);
    });

    it("puts a page with no position number last rather than dropping it", async () => {
      vi.mocked(getNavLinks).mockResolvedValue(null);
      vi.mocked(getProductsMenuPages).mockResolvedValue([
        { id: "1", title: "Sırasız Sayfa", slug: "sirasiz" },
        { id: "2", title: "Birinci Sayfa", slug: "birinci", productsMenuOrder: 1 },
      ] as never);
      await renderHeader();
      await openProductsMenu();

      const labels = screen
        .getAllByRole("link")
        .map((a) => a.textContent)
        .filter((t): t is string => ["Birinci Sayfa", "Sırasız Sayfa"].includes(t ?? ""));

      expect(labels.slice(0, 2)).toEqual(["Birinci Sayfa", "Sırasız Sayfa"]);
    });
  });
});
