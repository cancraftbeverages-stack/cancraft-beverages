import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { PageShell } from "@/components/layout/PageShell";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { CallLink } from "@/components/ui/CallLink";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Start Your Beverage Project",
  description:
    "Tell CanCraft Beverages about your beverage project — category, formulation status, can size and volume — or reach us directly on WhatsApp or by phone.",
  path: "/start-your-project",
});

export default function StartYourProjectPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[{ name: "Home", path: "/" }, { name: "Start Your Project", path: "/start-your-project" }]}
      />
      <PageHero
        eyebrow="Start Your Project"
        title="Tell us about your beverage."
        supporting="A few questions about your project — what you're making, where it stands, and how to reach you. No minimum order, no commitment."
        meta={
          <p className="text-sm text-steel-300">
            Prefer to talk first?{" "}
            <WhatsAppLink className="font-medium text-accent-500 hover:text-accent-600">
              Message us on WhatsApp
            </WhatsAppLink>{" "}
            or <CallLink className="font-medium text-accent-500 hover:text-accent-600">call us</CallLink>.
          </p>
        }
      />

      <section className="bg-paper-50 py-16 lg:py-24">
        <PageShell className="max-w-3xl">
          <EnquiryForm />
        </PageShell>
      </section>
    </>
  );
}
