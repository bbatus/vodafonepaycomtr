import { describe, expect, it } from "vitest";
import { campaignDateRange } from "@/lib/campaignDate";

describe("campaignDateRange", () => {
  it("formats a start–end range like the live page, in Istanbul time", () => {
    expect(campaignDateRange("2026-08-31T21:00:00.000Z", "2026-09-29T21:00:00.000Z")).toBe("01.09.2026 - 30.09.2026");
  });

  it("handles an open-ended campaign", () => {
    expect(campaignDateRange("2026-09-01T00:00:00.000Z", null)).toBe("01.09.2026 tarihinden itibaren");
    expect(campaignDateRange(undefined, "2026-09-30T00:00:00.000Z")).toBe("30.09.2026 tarihine kadar");
  });

  it("returns null without any date, so the box is not rendered", () => {
    expect(campaignDateRange(null, undefined)).toBeNull();
  });
});
