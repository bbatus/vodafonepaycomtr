import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlogFilterableList, BlogFilterableListFallback } from "@/app/blog/BlogFilterableList";

const posts = [
  { id: "1", image: "/a.jpg", title: "Kart Yazısı", href: "/blog/kart", excerpt: "Kart özeti", category: "kart" },
  { id: "2", image: "/b.jpg", title: "Ödeme Yazısı", href: "/blog/odeme", excerpt: "Ödeme özeti", category: "odeme" },
];
const categories = [
  { label: "Kart", slug: "kart" },
  { label: "Ödeme", slug: "odeme" },
];

/** Desktop and mobile pill strips both render in jsdom; the desktop one comes first. */
const pill = (label: string) => screen.getAllByText(label, { selector: "a" })[0];

describe("BlogFilterableList", () => {
  it("shows every post under Tümü, titled 'Tüm Bloglar', with its teaser", () => {
    render(<BlogFilterableList posts={posts} categories={categories} />);
    expect(screen.getByRole("heading", { name: "Blog" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tüm Bloglar" })).toBeInTheDocument();
    expect(screen.getByText("Kart Yazısı")).toBeInTheDocument();
    expect(screen.getByText("Ödeme özeti")).toBeInTheDocument();
  });

  it("filters to the selected category, titled '<Kategori> blogları' like live", async () => {
    const user = userEvent.setup();
    render(<BlogFilterableList posts={posts} categories={categories} />);

    await user.click(pill("Kart"));

    expect(screen.getByRole("heading", { name: "Kart blogları" })).toBeInTheDocument();
    expect(screen.getByText("Kart Yazısı")).toBeInTheDocument();
    expect(screen.queryByText("Ödeme Yazısı")).not.toBeInTheDocument();
    expect(window.location.search).toBe("?kategori=kart");
  });

  it("shows an explicit empty-state message for a category with no posts, not a blank grid", async () => {
    const user = userEvent.setup();
    render(<BlogFilterableList posts={posts} categories={[...categories, { label: "Boş", slug: "bos" }]} />);

    await user.click(pill("Boş"));

    expect(screen.getByText("Bu kategoride henüz yazı yok.")).toBeInTheDocument();
  });

  it("links pills to /blog?kategori= and renders the Suspense fallback under Tümü", () => {
    render(<BlogFilterableListFallback posts={posts} categories={categories} />);
    expect(pill("Ödeme")).toHaveAttribute("href", "/blog?kategori=odeme");
    expect(screen.getByRole("heading", { name: "Tüm Bloglar" })).toBeInTheDocument();
  });

  it("has no breadcrumb (the live blog list has none)", () => {
    render(<BlogFilterableList posts={posts} categories={categories} />);
    expect(screen.queryByRole("navigation", { name: "breadcrumb" })).not.toBeInTheDocument();
  });
});
