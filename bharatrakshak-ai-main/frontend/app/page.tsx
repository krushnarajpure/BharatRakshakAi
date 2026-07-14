import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { RoleSelection } from "@/components/landing/role-selection";
import { DisasterMapPreview } from "@/components/landing/disaster-map-preview";
import { CoreFeatures } from "@/components/landing/core-features";
import { ResponseWorkflow } from "@/components/landing/response-workflow";
import { DemoVideoSection } from "@/components/landing/demo-video-section";
import { InteractiveArchitecture } from "@/components/landing/interactive-architecture";
import { CommandCta } from "@/components/landing/command-cta";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="bg-[#05070a] text-white">
        <HeroSection />

        <RoleSelection />

        <DisasterMapPreview />

        <CoreFeatures />

        <ResponseWorkflow />

        <DemoVideoSection />

        <InteractiveArchitecture />

        <CommandCta />
      </main>
    </>
  );
}