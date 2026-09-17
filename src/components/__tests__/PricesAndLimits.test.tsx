import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PricesAndLimits } from "@/components/PricesAndLimits";

import type { CmsFeeRow, CmsLimitTable } from "@/lib/cms";

const fee = (over: Partial<CmsFeeRow>): CmsFeeRow => ({
  id: "1",
  rowType: "fee",
  label: "Özel Ücret",
  value: "10 TL",
  highlightValue: false,
  order: 1,
  ...over,
});
const feeRows: CmsFeeRow[] = [fee({})];
const limitTables: CmsLimitTable[] = [
  {
    id: "1",
    title: "Özel Limit",
    order: 1,
    footnote: "*Limitler her ay yenilenir.",
    rows: [{ category: "A", period: "Günlük", unverifiedLimit: "1", verifiedLimit: "2" }],
  },
];

describe("PricesAndLimits", () => {
  it("shows the fee rows tab by default", () => {
    render(<PricesAndLimits feeRows={feeRows} limitTables={limitTables} />);
    expect(screen.getByText("Özel Ücret")).toBeInTheDocument();
  });

  it("switches to the limits tab on click", async () => {
    const user = userEvent.setup();
    render(<PricesAndLimits feeRows={feeRows} limitTables={limitTables} />);

    await user.click(screen.getByText("Limitler"));
    expect(screen.getByText("Özel Limit")).toBeInTheDocument();
    expect(screen.queryByText("Özel Ücret")).not.toBeInTheDocument();
  });

  it("renders an empty table when a list is empty (no hardcoded fallback data)", () => {
    render(<PricesAndLimits feeRows={[]} limitTables={[]} />);
    expect(screen.queryByText("Faturana Yansıt Hizmet Bedeli")).not.toBeInTheDocument();
    expect(screen.queryByText("Ön Ödemeli Kart / ATM Limitleri")).not.toBeInTheDocument();
  });

  it("renders a section heading row without a value and a highlighted value in green", () => {
    render(
      <PricesAndLimits
        feeRows={[fee({ id: "h", rowType: "heading", label: "ATM’den Para Çekme", value: "" }), fee({ id: "g", label: "Yurt içi", value: "Ücretsiz", highlightValue: true })]}
        limitTables={[]}
      />
    );
    expect(screen.getByText("ATM’den Para Çekme")).toHaveClass("text-2xl");
    expect(screen.getByText("Ücretsiz")).toHaveClass("text-[#008a00]");
  });

  it("renders note rows below the table, not as table rows", () => {
    const note = {
      root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Ücretlerde değişiklik yapma hakkı saklıdır.", version: 1 }], version: 1 }], version: 1 },
    };
    render(<PricesAndLimits feeRows={[fee({}), fee({ id: "n", rowType: "note", label: "", value: "", note })]} limitTables={[]} />);
    const text = screen.getByText("Ücretlerde değişiklik yapma hakkı saklıdır.");
    expect(text.closest("table")).toBeNull();
  });

  it("applies the live page's 260px quirk to the 7th table row (header row included)", () => {
    const rows = Array.from({ length: 7 }, (_, i) => fee({ id: String(i), label: `Satır ${i}` }));
    render(<PricesAndLimits feeRows={rows} limitTables={[]} />);
    expect(screen.getByText("Satır 5").closest("tr")).toHaveClass("h-[260px]");
    expect(screen.getByText("Satır 4").closest("tr")).toHaveClass("h-[104px]");
  });

  it("shows a limit table's footnote under it", async () => {
    const user = userEvent.setup();
    render(<PricesAndLimits feeRows={feeRows} limitTables={limitTables} />);
    await user.click(screen.getByText("Limitler"));
    expect(screen.getByText("*Limitler her ay yenilenir.")).toBeInTheDocument();
  });
});
