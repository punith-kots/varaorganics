import type { Metadata } from "next";
import "./globals.css";
import { cormorant, jost } from "@/config/fonts";
import { site } from "@/config/site";
import { SITE_URL, publicEnv } from "@/lib/validation/env";
import { AnalyticsConsent } from "@/components/layout/AnalyticsConsent";
import { InteraktWidget } from "@/components/layout/InteraktWidget";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} h-full`}>
      {/* Grammarly adds body attributes before hydration. Limit suppression to this element. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {publicEnv.NEXT_PUBLIC_GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${publicEnv.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        )}
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <AnalyticsConsent />
        <InteraktWidget />
      </body>
    </html>
  );
}
