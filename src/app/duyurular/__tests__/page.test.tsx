import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Duyurular from "@/app/duyurular/page";
import { getAnnouncements, getPageMeta } from "@/lib/cms";

vi.mock("@/lib/cms", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cms")>("@/lib/cms");
  return { ...actual, getAnnouncements: vi.fn(), getPageMeta: vi.fn(), getNavLinks: vi.fn() };
});
vi.mock("@/components/Header", () => ({ Header: () => <header>Header</header> }));
vi.mock("@/components/Footer", () => ({ Footer: () => <footer>Footer</footer> }));

describe("Duyurular", () => {
  it("renders no items when the CMS has no announcements", async () => {
    vi.mocked(getAnnouncements).mockResolvedValue(null);
    vi.mocked(getPageMeta).mockResolvedValue(null);

    render(await Duyurular());

    // The title banner still renders; the accordion (and its heading) doesn't without announcements.
    expect(screen.getByRole("heading", { level: 1, name: "Duyurular" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { expanded: false })).not.toBeInTheDocument();
  });

  it("renders each announcement as an FAQ-block question whose body keeps its paragraphs", async () => {
    vi.mocked(getAnnouncements).mockResolvedValue([
      { id: "1", title: "Duyuru Başlığı", body: "Paragraf 1\n\nParagraf 2", deeplink: undefined, order: 0 },
    ] as never);
    vi.mocked(getPageMeta).mockResolvedValue(null);

    render(await Duyurular());

    // Live parity: the block heading, then the question card (user decision: "Duyurular", not "Sıkça Sorulan Sorular").
    expect(screen.getByRole("heading", { level: 2, name: "Duyurular" })).toBeInTheDocument();
    await userEvent.setup().click(screen.getByText("Duyuru Başlığı"));
    expect(screen.getByText("Paragraf 1")).toBeInTheDocument();
    expect(screen.getByText("Paragraf 2")).toBeInTheDocument();
  });
  it("uses the CMS breadcrumbLabel override when set", async () => {
    vi.mocked(getPageMeta).mockResolvedValue({
      id: "1",
      pageKey: "/x",
      breadcrumbLabel: "CMS Kırıntı Etiketi",
      seoTitle: undefined,
      seoDescription: undefined,
      seoKeywords: undefined,
      ogImage: undefined,
    } as never);

    vi.mocked(getAnnouncements).mockResolvedValue(null);
    render(await Duyurular());

    // Shown twice: in the breadcrumb and as the title banner.
    expect(screen.getAllByText("CMS Kırıntı Etiketi").length).toBeGreaterThan(0);
  });
});
