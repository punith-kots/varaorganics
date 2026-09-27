import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/batches/queries", () => ({
  getAllActiveBatches: vi.fn().mockResolvedValue([]),
}));

import LabReportPage from "@/app/(store)/labreport/page";
import CategoryPage, { generateMetadata } from "@/app/(store)/labreport/[category]/page";
import { getAllActiveBatches } from "@/features/batches/queries";
import { allProducts } from "@/data/catalog";
import { footerNav, primaryNav } from "@/config/nav";

afterEach(() => {
  cleanup();
  vi.mocked(getAllActiveBatches).mockResolvedValue([]);
});

describe("category lab report pages", () => {
  it("redirects the existing entry URL to ghee", () => {
    try {
      LabReportPage();
      throw new Error("Expected redirect");
    } catch (error) {
      expect((error as { digest: string }).digest).toContain("/labreport/ghee");
    }
  });

  it("shows only oil reports with category links and the original PDF", async () => {
    render(await CategoryPage({ params: Promise.resolve({ category: "oil" }) }));
    const tabs = within(screen.getByRole("navigation", { name: "Lab report categories" }));
    expect(tabs.getByRole("link", { name: "Oil" })).toHaveAttribute("aria-current", "page");
    for (const [name, slug] of [
      ["Ghee", "ghee"],
      ["Oil", "oil"],
      ["Honey", "honey"],
    ]) {
      expect(tabs.getByRole("link", { name })).toHaveAttribute("href", `/labreport/${slug}`);
    }
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getAllByRole("img")).toHaveLength(4);
    expect(screen.getByRole("link", { name: "Open PDF" })).toHaveAttribute(
      "href",
      "/lab-reports/nandhini-agro-foods-oil-report-2026.pdf",
    );
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute("download");
    expect(screen.queryByText("NABL accreditation certificate")).not.toBeInTheDocument();
  });

  it("shows an honest empty state for honey", async () => {
    render(await CategoryPage({ params: Promise.resolve({ category: "honey" }) }));
    expect(screen.getByText(/No honey laboratory report/)).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("filters batch records to the selected category", async () => {
    const records = allProducts.flatMap((product) =>
      product.currentBatch ? [{ product, batch: product.currentBatch }] : [],
    );
    expect(records.some(({ product }) => product.category === "oils")).toBe(true);
    vi.mocked(getAllActiveBatches).mockResolvedValue(records);
    render(await CategoryPage({ params: Promise.resolve({ category: "oil" }) }));
    expect(
      screen
        .getAllByRole("link", { name: /View batch results/ })
        .map((link) => link.getAttribute("href")),
    ).toEqual(
      records
        .filter(({ product }) => product.category === "oils")
        .map(({ batch }) => `/verify/${batch.batchNumber}`),
    );
  });

  it("rejects unknown categories and gives each category its own canonical URL", async () => {
    await expect(
      CategoryPage({ params: Promise.resolve({ category: "invalid" }) }),
    ).rejects.toThrow();
    const metadata = await generateMetadata({ params: Promise.resolve({ category: "oil" }) });
    expect(metadata.alternates?.canonical).toMatch(/\/labreport\/oil$/);
  });
  it("publishes both supplied documents and all three report pages", async () => {
    const { container } = render(
      await CategoryPage({ params: Promise.resolve({ category: "ghee" }) }),
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Lab reports & accreditation" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getAllByText(/issued to Gawdee Organic Pvt\. Ltd\./i)).toHaveLength(2);
    expect(container.querySelectorAll("img")).toHaveLength(3);
    expect(
      screen.getAllByRole("link", { name: "Open PDF" }).map((link) => link.getAttribute("href")),
    ).toEqual([
      "/lab-reports/ghee-lab-test-2026.pdf",
      "/lab-reports/equity-food-testing-nabl-accreditation.pdf",
    ]);
  });

  it("uses /labreport as the single navigation destination", () => {
    expect(primaryNav.find((item) => item.label === "Lab Reports")?.href).toBe("/labreport");
    expect(
      footerNav.flatMap((column) => column.links).find((item) => item.label === "Lab Reports")
        ?.href,
    ).toBe("/labreport");
  });
});
