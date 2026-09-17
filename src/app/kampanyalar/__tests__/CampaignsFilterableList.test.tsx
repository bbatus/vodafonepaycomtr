import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CampaignsFilterableList, CampaignsFilterableListFallback } from "@/app/kampanyalar/CampaignsFilterableList";

const campaigns = [
  { id: "1", image: "/a.jpg", title: "Öne Çıkan Kampanya", href: "/kampanyalar/a", category: "kart", featured: true },
  { id: "2", image: "/b.jpg", title: "Normal Kampanya", href: "/kampanyalar/b", category: "kart", featured: false },
  { id: "3", image: "/c.jpg", title: "Ödeme Kampanyası", href: "/kampanyalar/c", category: "odeme", featured: false },
];
const categories = [
  { label: "Kart", slug: "kart" },
  { label: "Ödeme", slug: "odeme" },
];

/** Desktop and mobile pill strips both render in jsdom; the desktop one comes first. */
const pill = (label: string) => screen.getAllByText(label, { selector: "a" })[0];

describe("CampaignsFilterableList", () => {
  it("under Tümü, splits into 'Bu ayın favorileri' (featured) and 'Tüm Kampanyalar' (the rest)", () => {
    render(<CampaignsFilterableList campaigns={campaigns} categories={categories} />);
    expect(screen.getByRole("heading", { name: "Kampanyalar" })).toBeInTheDocument();
    expect(screen.getByText("Bu ayın favorileri")).toBeInTheDocument();
    expect(screen.getByText("Tüm Kampanyalar")).toBeInTheDocument();
    expect(screen.getByText("Öne Çıkan Kampanya")).toBeInTheDocument();
    expect(screen.getByText("Ödeme Kampanyası")).toBeInTheDocument();
  });

  it("under a category, shows one grid titled '<Kategori> kampanyaları' (live parity), featured included", async () => {
    const user = userEvent.setup();
    render(<CampaignsFilterableList campaigns={campaigns} categories={categories} />);

    await user.click(pill("Kart"));

    expect(screen.queryByText("Bu ayın favorileri")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kart kampanyaları" })).toBeInTheDocument();
    expect(screen.getByText("Öne Çıkan Kampanya")).toBeInTheDocument();
    expect(screen.getByText("Normal Kampanya")).toBeInTheDocument();
    expect(screen.queryByText("Ödeme Kampanyası")).not.toBeInTheDocument();
    expect(window.location.search).toBe("?kategori=kart");
  });

  it("links every pill to its ?kategori= URL", () => {
    render(<CampaignsFilterableList campaigns={campaigns} categories={categories} />);
    expect(pill("Ödeme")).toHaveAttribute("href", "/kampanyalar?kategori=odeme");
    expect(pill("Tümü")).toHaveAttribute("href", "/kampanyalar");
  });

  it("shows ContentUnavailable's empty-state message when a category has no campaigns at all", async () => {
    const user = userEvent.setup();
    render(<CampaignsFilterableList campaigns={campaigns} categories={[...categories, { label: "Boş", slug: "bos" }]} />);

    await user.click(pill("Boş"));

    expect(screen.getByText("Şu anda gösterilecek içerik yok.")).toBeInTheDocument();
  });

  it("renders the Suspense fallback under Tümü", () => {
    render(<CampaignsFilterableListFallback campaigns={campaigns} categories={categories} />);
    expect(screen.getByText("Bu ayın favorileri")).toBeInTheDocument();
  });

  it("gives every card the live 'Detayları gör' link to the campaign", () => {
    render(<CampaignsFilterableList campaigns={campaigns} categories={categories} />);
    const links = screen.getAllByText("Detayları gör");
    expect(links[0].closest("a")).toHaveAttribute("href", "/kampanyalar/a");
  });
});
