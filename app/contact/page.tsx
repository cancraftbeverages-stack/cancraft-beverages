import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";
import { ContactDetails } from "@/components/marketing/ContactDetails";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Contact CanCraft Beverages — call, WhatsApp or email our team in Dasna, Hapur, Uttar Pradesh to start a beverage manufacturing project.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]} />
      <PageHero
        eyebrow="Contact"
        title="Let's talk about your beverage."
        supporting="Call, WhatsApp or email us directly — or share full project details and we'll get back to you."
        actions={
          <Button href="/start-your-project" size="lg">
            Start Your Beverage Project
          </Button>
        }
      />

      <ContactDetails />

      <section className="bg-paper-100 py-16 lg:py-20">
        <PageShell>
          <p className="max-w-2xl text-base leading-relaxed text-steel-600">
            Have a specific beverage category in mind?{" "}
            <Link href="/beverages" className="group font-medium text-accent-600 hover:text-accent-500">
              Explore what we manufacture{" "}
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-micro ease-confident group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </p>
        </PageShell>
      </section>

      <FinalCTA />
    </>
  );
}
