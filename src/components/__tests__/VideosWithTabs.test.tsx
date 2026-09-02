import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VideosWithTabs, type VideoTab } from "@/components/VideosWithTabs";

const tabs: VideoTab[] = [
  { label: "Alışverişte nasıl kullanırım?", items: [{ label: "Hesap Doğrulama" }, { label: "App Store" }] },
  { label: "Nasıl açarım?", items: [{ label: "App Store", thumbnail: { url: "/thumb.jpg", alt: "Kapak" } }] },
];

describe("VideosWithTabs", () => {
  it("shows the first tab's items by default", () => {
    render(<VideosWithTabs tabs={tabs} />);
    // "Hesap Doğrulama" only appears in tab 1's item list — "App Store" is in
    // both tabs, so it's not a useful absence check here.
    expect(screen.getByText("Hesap Doğrulama")).toBeInTheDocument();
  });

  it("switches to the second tab's items on click", async () => {
    const user = userEvent.setup();
    render(<VideosWithTabs tabs={tabs} />);

    await user.click(screen.getByText("Nasıl açarım?"));

    expect(screen.getByText("App Store")).toBeInTheDocument();
    expect(screen.queryByText("Hesap Doğrulama")).not.toBeInTheDocument();
  });

  it("renders a card's own image when the editor picked one", async () => {
    const user = userEvent.setup();
    render(<VideosWithTabs tabs={tabs} />);
    await user.click(screen.getByText("Nasıl açarım?"));
    expect(screen.getByRole("img", { name: "Kapak" })).toBeInTheDocument();
  });

  /** The block is optional content now — an empty one must not render an empty shell. */
  it("renders nothing without tabs", () => {
    const { container } = render(<VideosWithTabs />);
    expect(container).toBeEmptyDOMElement();
  });
});
