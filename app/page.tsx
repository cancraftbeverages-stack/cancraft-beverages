import { Hero } from "@/components/marketing/Hero";
import { DifferentiationCards } from "@/components/marketing/DifferentiationCards";
import { ProcessRail } from "@/components/marketing/ProcessRail";
import { CategoryGrid } from "@/components/marketing/CategoryGrid";
import { CapabilityStats } from "@/components/marketing/CapabilityStats";
import { ServicePillars } from "@/components/marketing/ServicePillars";
import { BrandStageTabs } from "@/components/marketing/BrandStageTabs";
import { InfinitySection } from "@/components/marketing/InfinitySection";
import { FacilityGallery } from "@/components/marketing/FacilityGallery";
import { QualitySection } from "@/components/marketing/QualitySection";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Beverage Contract Manufacturing, Uttar Pradesh",
  description:
    "Beverage development and contract manufacturing for startups, growing brands and established businesses. Can-format production in Dasna, Hapur, Uttar Pradesh. No MOQ.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <DifferentiationCards />
      <ProcessRail />
      <CategoryGrid />
      <CapabilityStats />
      <ServicePillars />
      <BrandStageTabs />
      <InfinitySection />
      <FacilityGallery />
      <QualitySection />
      <FinalCTA />
    </>
  );
}
