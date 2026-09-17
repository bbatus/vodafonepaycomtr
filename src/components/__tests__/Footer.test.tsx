import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/Footer";
import { getFooterBlogPosts, getFooterCampaigns, getFooterSettings, getNavLinks } from "@/lib/cms";

vi.mock("@/lib/cms", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cms")>("@/lib/cms");
  return { ...actual, getNavLinks: vi.fn(), getFooterCampaigns: vi.fn(), getFooterBlogPosts: vi.fn(), getFooterSettings: vi.fn() };
});

/** Footer is an async Server Component — RTL's render() needs the resolved element, not the async function itself. */
async function renderFooter() {
  return render(await Footer());
}

function mockEmpty() {
  vi.mocked(getNavLinks).mockResolvedValue(null);
  vi.mocked(getFooterCampaigns).mockResolvedValue(null);
  vi.mocked(getFooterBlogPosts).mockResolvedValue(null);
  vi.mocked(getFooterSettings).mockResolvedValue(null);
}

describe("Footer", () => {
  it("falls back to the hardcoded corporate/legal links when the CMS returns nothing", async () => {
    mockEmpty();
    await renderFooter();
    expect(screen.getByText("İletişim")).toBeInTheDocument();
    expect(screen.getByText("Site Haritası")).toBeInTheDocument();
  });

  it("uses CMS-provided nav links for the corporate column when present", async () => {
    mockEmpty();
    vi.mocked(getNavLinks).mockResolvedValue([
      { label: "CMS Kurumsal Link", href: "/cms-kurumsal", section: "footer-kurumsal", order: 1 },
    ] as never);
    await renderFooter();
    expect(screen.getByText("CMS Kurumsal Link")).toBeInTheDocument();
    expect(screen.queryByText("Temsilciliklerimiz")).not.toBeInTheDocument();
  });

  it("renders one link per flagged blog post and campaign — the same records the CMS Footer Yönetimi screen lists", async () => {
    mockEmpty();
    vi.mocked(getFooterBlogPosts).mockResolvedValue([{ id: "1", title: "Cashback Nedir?", slug: "cashback-nedir" }]);
    vi.mocked(getFooterCampaigns).mockResolvedValue([
      { id: "1", title: "Yaz Kampanyası", description: "", image: { url: "/img.jpg", alt: "" }, slug: "yaz-kampanyasi", featured: false, category: null },
    ] as never);
    await renderFooter();
    expect(screen.getByText("Cashback Nedir?").closest("a")).toHaveAttribute("href", "/blog/cashback-nedir");
    expect(screen.getByText("Yaz Kampanyası").closest("a")).toHaveAttribute("href", "/kampanyalar/yaz-kampanyasi");
  });

  it("has no column headings and no FAQ column, like the live footer", async () => {
    mockEmpty();
    await renderFooter();
    expect(screen.queryByText("Sık Sorulanlar")).not.toBeInTheDocument();
    expect(screen.queryByText("Kurumsal")).not.toBeInTheDocument();
  });

  it("uses the live default QR card and background when the Footer Yönetimi images are empty", async () => {
    mockEmpty();
    vi.mocked(getFooterSettings).mockResolvedValue({ backgroundImage: undefined, qrImage: undefined, linkedinUrl: undefined });
    const { container } = await renderFooter();
    expect(screen.getByAltText("Vodafone Pay QR Kodu")).toHaveAttribute("src", "/images/footer/sticky-qr.png");
    expect(container.querySelector("footer")?.getAttribute("style")).toContain("/images/footer/footer-bg.svg");
  });

  it("uses the CMS-managed QR card and background when set", async () => {
    mockEmpty();
    vi.mocked(getFooterSettings).mockResolvedValue({
      backgroundImage: { url: "/media/bg.svg", alt: "" },
      qrImage: { url: "/media/qr.png", alt: "" },
      linkedinUrl: "https://www.linkedin.com/company/x",
    });
    const { container } = await renderFooter();
    expect(screen.getByAltText("Vodafone Pay QR Kodu")).toHaveAttribute("src", "/media/qr.png");
    expect(container.querySelector("footer")?.getAttribute("style")).toContain("/media/bg.svg");
    expect(screen.getByLabelText("LinkedIn")).toHaveAttribute("href", "https://www.linkedin.com/company/x");
  });

  it("hides the LinkedIn icon when the editor cleared the address", async () => {
    mockEmpty();
    vi.mocked(getFooterSettings).mockResolvedValue({ backgroundImage: undefined, qrImage: undefined, linkedinUrl: undefined });
    await renderFooter();
    expect(screen.queryByLabelText("LinkedIn")).not.toBeInTheDocument();
  });

  it("marks external links (absolute http(s) URLs) to open in a new tab, unlike internal ones", async () => {
    mockEmpty();
    await renderFooter();
    expect(screen.getByText("Bilgi Toplum Hizmetleri").closest("a")).toHaveAttribute("target", "_blank");
    expect(screen.getByText("İletişim").closest("a")).not.toHaveAttribute("target");
  });
});
