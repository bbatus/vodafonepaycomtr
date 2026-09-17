import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { getHomepage, getPageMeta } from "@/lib/cms";

vi.mock("@/lib/cms", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cms")>("@/lib/cms");
  return {
    ...actual,
    getCampaigns: vi.fn(),
    getFaqItems: vi.fn(),
    getPageMeta: vi.fn(),
    getNavLinks: vi.fn(),
    getHomepage: vi.fn(),
  };
});
vi.mock("@/components/Header", () => ({ Header: () => <header>Header</header> }));
vi.mock("@/components/Footer", () => ({ Footer: () => <footer>Footer</footer> }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
// BlockRenderer is an async server component; React Testing Library renders
// nothing for one, so the real thing is stubbed with a sync marker and the
// block-level rendering is covered by BlockRenderer's own test file.
vi.mock("@/app/[...slug]/page", () => ({
  BlockRenderer: ({ block }: { block: { blockType: string } }) => <div>block:{block.blockType}</div>,
}));

const heroBlock = {
  blockType: "hero" as const,
  id: "b1",
  heading: "CMS Anasayfa",
  subheading: undefined,
  image: { url: "/a.jpg", alt: "a" },
  ctaLabel: undefined,
  ctaUrl: undefined,
};

/**
 * `/` renders the Pages document flagged as the homepage and nothing else. The hardcoded
 * Hero/Campaigns/Faq composition these tests used to exercise was removed on
 * 02.09.2026 — see src/app/page.tsx for why a homepage that silently swaps
 * itself for a different one is worse than a homepage that fails.
 */
describe("Home", () => {
  it("renders the blocks of the page flagged as the homepage", async () => {
    vi.mocked(getPageMeta).mockResolvedValue(null);
    vi.mocked(getHomepage).mockResolvedValue({ title: "Anasayfa", slug: "anasayfa", layout: [heroBlock] } as never);

    render(await Home());

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
    expect(screen.getByText("block:hero")).toBeInTheDocument();
  });

  it("reads the homepage by its flag, not by a slug", async () => {
    vi.mocked(getPageMeta).mockResolvedValue(null);
    vi.mocked(getHomepage).mockResolvedValue({ title: "Vodafone Pay Ana Sayfa", slug: "vodafone-pay-ana-sayfa", layout: [heroBlock], isHomepage: true } as never);

    render(await Home());

    // A title that doesn't slugify to "anasayfa" must still be the homepage.
    expect(getHomepage).toHaveBeenCalled();
    expect(screen.getByText("block:hero")).toBeInTheDocument();
  });

  it("404s instead of substituting a hardcoded homepage when the document is missing", async () => {
    vi.mocked(getPageMeta).mockResolvedValue(null);
    vi.mocked(getHomepage).mockResolvedValue(null);

    await expect(Home()).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("404s when the document exists but has no blocks", async () => {
    vi.mocked(getPageMeta).mockResolvedValue(null);
    vi.mocked(getHomepage).mockResolvedValue({ title: "Anasayfa", slug: "anasayfa", layout: [] } as never);

    await expect(Home()).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
