import { StrictMode } from "react";
import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useConsentTracking } from "@/lib/analytics/useConsentTracking";

function Probe({ track, id = "checkout" }: { track: () => boolean; id?: string }) {
  useConsentTracking(track, id);
  return null;
}

describe("page event consent timing", () => {
  it("waits for consent, then emits only once despite Strict Mode and rerenders", () => {
    let allowed = false;
    const delivered = vi.fn();
    const track = () => { if (!allowed) return false; delivered(); return true; };
    const view = render(<StrictMode><Probe track={track} /></StrictMode>);
    expect(delivered).not.toHaveBeenCalled();
    allowed = true;
    act(() => { window.dispatchEvent(new Event("vara:consent")); });
    view.rerender(<StrictMode><Probe track={() => track()} /></StrictMode>);
    act(() => { window.dispatchEvent(new Event("vara:consent")); });
    expect(delivered).toHaveBeenCalledOnce();
    view.unmount();
  });

  it("records a newly displayed product SKU", () => {
    const track = vi.fn(() => true);
    const view = render(<Probe track={track} id="VARA-GHEE-500" />);
    view.rerender(<Probe track={track} id="VARA-GHEE-1000" />);
    expect(track).toHaveBeenCalledTimes(2);
    view.unmount();
  });
});
