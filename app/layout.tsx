import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileUtilityBar } from "@/components/layout/MobileUtilityBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { company } from "@/content/company";
import { SITE_URL } from "@/lib/site";

/**
 * Font abstraction: --font-body / --font-display are consumed by
 * tailwind.config.ts (fontFamily.body / fontFamily.display), so swapping
 * the actual typefaces later never touches component code.
 *
 * Inter (body) is the approved final choice per ARCHITECTURE.md.
 * Space Grotesk (display) is a temporary, licence-free stand-in for the
 * approved "General Sans" display face — swap it here once General Sans
 * files are supplied/licensed.
 */
const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// metadataBase resolves relative canonical/OG URLs to absolute ones. No
// production domain is confirmed yet, so SITE_URL falls back to localhost
// (see lib/site.ts) — set NEXT_PUBLIC_SITE_URL before deploying.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${company.brandName} — Beverage Contract Manufacturing, ${company.factory.state}`,
    template: `%s — ${company.brandName}`,
  },
  description:
    "Beverage development and contract manufacturing for startups, growing brands and established businesses. Can-format production in Dasna, Hapur, Uttar Pradesh. No MOQ.",
  robots: {
    index: true,
    follow: true,
  },
};

// Organization + WebSite structured data, sitewide — only verified facts.
// No logo (no real logo asset yet), no sameAs (no confirmed social
// profiles), no street address (only locality/region/country are verified).
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.brandName,
  legalName: company.legalName,
  url: SITE_URL,
  email: company.contact.email,
  telephone: company.contact.phoneDisplay,
  foundingDate: String(company.established),
  address: {
    "@type": "PostalAddress",
    addressLocality: company.factory.locality,
    addressRegion: company.factory.state,
    addressCountry: "IN",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: company.brandName,
  url: SITE_URL,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-accent-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink-950"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        <MobileUtilityBar />
      </body>
    </html>
  );
}
