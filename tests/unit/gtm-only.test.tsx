import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
vi.mock("@/lib/validation/env", () => ({
  publicEnv: {
    NEXT_PUBLIC_GTM_ID: "",
    NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST",
    NEXT_PUBLIC_META_PIXEL_ID: "1623537109216457",
  },
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next/script", () => ({
  default: ({ src, children }: { src?: string; children?: React.ReactNode }) => (
    <div data-testid="tracking-script" data-src={src}>
      {children}
    </div>
  ),
}));
import { AnalyticsConsent } from "@/components/layout/AnalyticsConsent";
beforeEach(() => localStorage.clear());
afterEach(cleanup);
it("does not load Meta or GA4 after acceptance when GTM is absent", () => {
  render(<AnalyticsConsent />);
  // Without a configured container there is no GA4/Meta fallback or banner for it.
  expect(screen.queryByTestId("tracking-script")).toBeNull();
  cleanup();
  localStorage.setItem("vara-consent", "granted");
  render(<AnalyticsConsent />);
  expect(screen.queryByTestId("tracking-script")).toBeNull();
});
