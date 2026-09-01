import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductHero } from "@/components/ProductHero";

/**
 * 01.09.2026 kullanıcı geri bildirimiyle güncellendi: eski overlay-on-image
 * deseni (bkz. ProductHero.tsx'in yorumu) kaldırıldı — artık tek düzen, her
 * breakpoint'te aynı: görsel üstte, başlık/alt başlık/buton altında, kendi
 * padding'li bloğunda.
 */
describe("ProductHero", () => {
  const base = { image: "/hero.jpg", imageAlt: "Hero", heading: "Başlık" };

  it("renders exactly one h1", () => {
    render(<ProductHero {...base} subheading="Alt başlık" />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("renders the heading block BELOW the image, not overlaid on it", () => {
    const { container } = render(<ProductHero {...base} />);

    const imageWrapper = container.querySelector("section > div:first-child");
    expect(imageWrapper?.className).not.toContain("absolute");

    const headingBlock = container.querySelector("h1")?.parentElement;
    expect(headingBlock?.className).not.toContain("absolute");
    // Comes after the image wrapper in the DOM, i.e. genuinely below it.
    expect(imageWrapper?.nextElementSibling).toBe(headingBlock);
  });

  it("omits the heading block entirely when heading is empty (title is now optional)", () => {
    const { container } = render(<ProductHero {...base} heading={undefined} />);
    expect(container.querySelector("h1")).not.toBeInTheDocument();
    expect(container.querySelector("img")).toBeInTheDocument();
  });

  it("renders the CTA when a label and url are given, and omits it otherwise", () => {
    const { rerender } = render(<ProductHero {...base} ctaLabel="Hemen Başla" ctaUrl="/kampanyalar" />);
    const link = screen.getByRole("link", { name: "Hemen Başla" });
    expect(link).toHaveAttribute("href", "/kampanyalar");

    rerender(<ProductHero {...base} ctaLabel="Hemen Başla" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("uses the live image geometry: 1030px-wide column, rounded-xl, 322px tall on desktop", () => {
    const { container } = render(<ProductHero {...base} />);
    expect(container.querySelector("section")?.className).toContain("max-w-[1030px]");
    // `<main>` is a flex column, where an `mx-auto` item shrinks to its
    // content instead of stretching — without w-full the 1030px cap is never
    // reached and the section collapses to the width of its own text.
    expect(container.querySelector("section")?.className).toContain("w-full");
    const frame = container.querySelector("section > div");
    expect(frame?.className).toContain("rounded-xl");
    expect(container.querySelector("img")?.className).toContain("lg:h-[322px]");
  });
});
