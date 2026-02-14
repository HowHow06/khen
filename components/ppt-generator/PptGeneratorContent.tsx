"use client";

import { LineToSlideMapperProvider } from "@/components/context/LineToSlideMapperContext";
import { PptGeneratorFormProvider } from "@/components/context/PptGeneratorFormContext";
import { PptSettingsUIProvider } from "@/components/context/PptSettingsUIContext";
import Container from "@/components/ui/container";
import { useCallback } from "react";
import HiddenOverflowDetector from "./HiddenOverflowDetector";
import MainLyricSection from "./MainLyricSection";
import MiniPreviewPanel from "./MiniPreviewPanel";
import SecondaryLyricSection from "./SecondaryLyricSection";
import GeneratePptSection from "./settings/GeneratePptSection";
import PptGeneratorSettings from "./settings/PptGeneratorSettings";

// Section wrapper component for consistent styling
const Section = ({
  children,
  step,
  title,
  id,
  className = "",
}: {
  children: React.ReactNode;
  step: number;
  title: string;
  id?: string;
  className?: string;
}) => (
  <section
    id={id}
    className={`rounded-2xl border bg-card/50 p-6 shadow-sm transition-all hover:shadow-md ${className}`}
  >
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {step}
      </span>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    </div>
    {children}
  </section>
);

const PptGeneratorContent = () => {
  // Dispatch custom event to open full preview
  const handleOpenFullPreview = useCallback(() => {
    window.dispatchEvent(new CustomEvent('openFullPreview'));
  }, []);

  return (
    <LineToSlideMapperProvider>
      <PptSettingsUIProvider>
        <PptGeneratorFormProvider>
          <Container className="py-12 lg:py-16">
            <div className="space-y-8">
              {/* Search Section - Coming Soon */}
              <Section step={1} title="Search Lyrics" id="search-lyrics">
                <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed text-muted-foreground">
                  <span className="text-sm">Coming soon...</span>
                </div>
              </Section>

              {/* Main Lyric Section */}
              <Section step={2} title="Insert Main Lyric" id="main-lyric">
                <MainLyricSection />
              </Section>

              {/* Secondary Lyric Section */}
              <Section
                step={3}
                title="Insert Secondary Lyric"
                id="secondary-lyric"
              >
                <SecondaryLyricSection />
              </Section>

              {/* Settings Section */}
              <Section step={4} title="Settings" id="settings">
                <PptGeneratorSettings />
              </Section>

              {/* Generate Section */}
              <Section
                step={5}
                title="Generate PPT!"
                id="generate"
                className="bg-primary/[0.02]"
              >
                <GeneratePptSection />
              </Section>
            </div>
          </Container>

          {/* Mini Preview Panel - floating on desktop */}
          <MiniPreviewPanel onOpenFullPreview={handleOpenFullPreview} />

          {/* Hidden overflow detection - always mounted */}
          <HiddenOverflowDetector />
        </PptGeneratorFormProvider>
      </PptSettingsUIProvider>
    </LineToSlideMapperProvider>
  );
};

export default PptGeneratorContent;
