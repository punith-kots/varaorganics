// @vitest-environment node
import { expect, it } from "vitest";
import config from "../../next.config";
it("allows regional GA collection and standard Meta endpoints for GTM tags", async () => {
  const groups = await config.headers!();
  const csp = groups[0]!.headers.find((h) => h.key === "Content-Security-Policy")!.value;
  const connect = csp.split("; ").find((s) => s.startsWith("connect-src "))!;
  for (const host of [
    "https://*.google-analytics.com",
    "https://*.google.com",
    "https://www.facebook.com",
    "https://connect.facebook.net",
    "https://graph.facebook.com",
    "https://*.on.aws",
    "https://*.run.app",
    "https://*.cloud.run",
  ])
    expect(connect).toContain(host);
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("frame-ancestors 'none'");
});
