import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Campaigns } from "@/components/Campaigns";

const campaigns = [
  { title: "Kampanya A", description: "Açıklama A", image: "/a.jpg", imageAlt: "A", href: "/a" },
  { title: "Kampanya B", description: "Açıklama B", image: "/b.jpg", imageAlt: "B", href: "/b" },
];

describe("Campaigns", () => {
  // Desktop and mobile bands both render in jsdom, so every title appears twice.
  it("renders every campaign with the first one active", () => {
    render(<Campaigns campaigns={campaigns} />);
    expect(screen.getAllByText("Kampanya A").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Kampanya B").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("Kampanya 1")[0]).toHaveAttribute("aria-current", "true");
  });

  it("shows the heading with an 'İncele' link to /kampanyalar", () => {
    render(<Campaigns campaigns={campaigns} heading="Kampanyalar" />);
    expect(screen.getByRole("heading", { name: "Kampanyalar" })).toBeInTheDocument();
    expect(screen.getByText("İncele").closest("a")).toHaveAttribute("href", "/kampanyalar");
  });

  it("advances to the next campaign and disables the arrows at the ends (no loop, like live)", async () => {
    const user = userEvent.setup();
    render(<Campaigns campaigns={campaigns} />);

    expect(screen.getByLabelText("Önceki kampanya")).toBeDisabled();
    await user.click(screen.getByLabelText("Sonraki kampanya"));
    expect(screen.getAllByLabelText("Kampanya 2")[0]).toHaveAttribute("aria-current", "true");
    expect(screen.getByLabelText("Sonraki kampanya")).toBeDisabled();
    expect(screen.getByLabelText("Önceki kampanya")).not.toBeDisabled();
  });

  it("jumps to a campaign from its pagination dot", async () => {
    const user = userEvent.setup();
    render(<Campaigns campaigns={campaigns} />);
    await user.click(screen.getAllByLabelText("Kampanya 2")[0]);
    expect(screen.getAllByLabelText("Kampanya 1")[0]).not.toHaveAttribute("aria-current");
  });

  it("renders nothing when given an empty campaign list", () => {
    const { container } = render(<Campaigns campaigns={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  // RFP feedback 5.0: there is deliberately no hardcoded default any more —
  // an empty list must render nothing rather than mask a dead CMS.
  it("renders nothing rather than hardcoded campaigns when the list is empty", () => {
    const { container } = render(<Campaigns campaigns={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
