import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BlogYazisi, { generateMetadata, generateStaticParams } from "@/app/blog/[slug]/page";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/cms";

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

vi.mock("@/lib/cms", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cms")>("@/lib/cms");
  return { ...actual, getBlogPostBySlug: vi.fn(), getBlogPosts: vi.fn(), getNavLinks: vi.fn() };
});
vi.mock("@/components/Header", () => ({ Header: () => <header>Header</header> }));
vi.mock("@/components/Footer", () => ({ Footer: () => <footer>Footer</footer> }));

const post = {
  id: "1",
  title: "Yeni Yazı",
  slug: "yeni-yazi",
  coverImage: { url: "/a.jpg", alt: "a" },
  body: null,
  category: { label: "Kart", slug: "kart" },
  publishedDate: "2026-07-14",
  seoTitle: undefined,
  seoDescription: undefined,
  seoKeywords: undefined,
  deeplink: "/kampanyalar",
};

describe("generateStaticParams", () => {
  it("maps each blog post to its slug", async () => {
    vi.mocked(getBlogPosts).mockResolvedValue([post] as never);
    expect(await generateStaticParams()).toEqual([{ slug: "yeni-yazi" }]);
  });
});

describe("generateMetadata", () => {
  it("returns an empty object when the slug matches no post", async () => {
    vi.mocked(getBlogPostBySlug).mockResolvedValue(null);
    expect(await generateMetadata({ params: Promise.resolve({ slug: "yok" }) })).toEqual({});
  });
});

describe("BlogYazisi", () => {
  it("calls notFound() when no post matches the slug", async () => {
    vi.mocked(getBlogPostBySlug).mockResolvedValue(null);
    await expect(BlogYazisi({ params: Promise.resolve({ slug: "yok" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders the post's title, published date badge and deeplink", async () => {
    vi.mocked(getBlogPostBySlug).mockResolvedValue(post as never);
    vi.mocked(getBlogPosts).mockResolvedValue([] as never);

    render(await BlogYazisi({ params: Promise.resolve({ slug: "yeni-yazi" }) }));

    expect(screen.getByRole("heading", { name: "Yeni Yazı" })).toBeInTheDocument();
    // Live parity: the red badge shows dd.mm.yyyy (both the lg and mobile copies render in jsdom).
    expect(screen.getAllByText("14.07.2026").length).toBeGreaterThan(0);
    expect(screen.getByText("İlgili bağlantı →")).toHaveAttribute("href", "/kampanyalar");
  });

  it("omits the deeplink when unset", async () => {
    vi.mocked(getBlogPostBySlug).mockResolvedValue({ ...post, deeplink: undefined } as never);
    vi.mocked(getBlogPosts).mockResolvedValue([] as never);

    render(await BlogYazisi({ params: Promise.resolve({ slug: "yeni-yazi" }) }));

    expect(screen.queryByText("İlgili bağlantı →")).not.toBeInTheDocument();
  });

  // 17.09.2026 user request: the date is optional — no publishedDate, no badge.
  it("renders no date badge when the post has no published date", async () => {
    vi.mocked(getBlogPostBySlug).mockResolvedValue({ ...post, publishedDate: undefined } as never);
    vi.mocked(getBlogPosts).mockResolvedValue([] as never);

    render(await BlogYazisi({ params: Promise.resolve({ slug: "yeni-yazi" }) }));

    expect(screen.queryByText("14.07.2026")).not.toBeInTheDocument();
  });

  it("uses the live blog breadcrumb rooted at 'Vodafone Pay Bloglar'", async () => {
    vi.mocked(getBlogPostBySlug).mockResolvedValue(post as never);
    vi.mocked(getBlogPosts).mockResolvedValue([] as never);

    render(await BlogYazisi({ params: Promise.resolve({ slug: "yeni-yazi" }) }));

    expect(screen.getByText("Vodafone Pay Bloglar").closest("a")).toHaveAttribute("href", "/blog");
  });

  it("fills 'Daha fazlasını keşfedin' from the same category first, never the post itself, max 3", async () => {
    const other = (id: string, slug: string, category: string, title: string) => ({ ...post, id, slug, title, category: { label: category, slug: category } });
    vi.mocked(getBlogPostBySlug).mockResolvedValue(post as never);
    vi.mocked(getBlogPosts).mockResolvedValue([
      other("9", "odeme-1", "odeme", "Ödeme Yazısı 1"),
      post,
      other("2", "kart-1", "kart", "Kart Yazısı 1"),
      other("3", "odeme-2", "odeme", "Ödeme Yazısı 2"),
      other("4", "kart-2", "kart", "Kart Yazısı 2"),
    ] as never);

    render(await BlogYazisi({ params: Promise.resolve({ slug: "yeni-yazi" }) }));

    expect(screen.getByRole("heading", { name: "Daha fazlasını keşfedin" })).toBeInTheDocument();
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["Kart Yazısı 1", "Kart Yazısı 2", "Ödeme Yazısı 1"]);
  });

  it("shows the editor-picked related posts instead when set", async () => {
    const picked = { ...post, id: "7", slug: "secilen", title: "Seçilen Yazı" };
    vi.mocked(getBlogPostBySlug).mockResolvedValue({ ...post, relatedPosts: [picked] } as never);
    vi.mocked(getBlogPosts).mockResolvedValue([{ ...post, id: "8", slug: "baska", title: "Başka Yazı" }] as never);

    render(await BlogYazisi({ params: Promise.resolve({ slug: "yeni-yazi" }) }));

    expect(screen.getByText("Seçilen Yazı")).toBeInTheDocument();
    expect(screen.queryByText("Başka Yazı")).not.toBeInTheDocument();
  });

  it("renders no 'Daha fazlasını keşfedin' section when there is no other post", async () => {
    vi.mocked(getBlogPostBySlug).mockResolvedValue(post as never);
    vi.mocked(getBlogPosts).mockResolvedValue([post] as never);

    render(await BlogYazisi({ params: Promise.resolve({ slug: "yeni-yazi" }) }));

    expect(screen.queryByText("Daha fazlasını keşfedin")).not.toBeInTheDocument();
  });
});
