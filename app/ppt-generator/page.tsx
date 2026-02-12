import { LineToSlideMapperProvider } from "@/components/context/LineToSlideMapperContext";
import { PptGeneratorFormProvider } from "@/components/context/PptGeneratorFormContext";
import { PptSettingsUIProvider } from "@/components/context/PptSettingsUIContext";

import MainLyricSection from "@/components/ppt-generator/MainLyricSection";
import SecondaryLyricSection from "@/components/ppt-generator/SecondaryLyricSection";
import GeneratePptSection from "@/components/ppt-generator/settings/GeneratePptSection";
import PptGeneratorSettings from "@/components/ppt-generator/settings/PptGeneratorSettings";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { ArrowDown, Sparkles } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PPT Generator",
  description:
    "A tool to generator PPT by inserting lyrics, simplifying the creation of PowerPoint presentations for church praise and worship songs.",
};

type Props = {};

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

const PptGeneratorPage = (props: Props) => {
  return (
    <>
      {/* Font imports for PPT rendering */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url(/css/microsoft-yahei.css);
        @import url(/css/ebrima.css);`,
        }}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b bg-gradient-to-b from-muted/50 to-background">
        {/* Subtle background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <Container className="relative py-16 text-center lg:py-24">
          <div className="mx-auto max-w-3xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                Create beautiful presentations in minutes
              </span>
            </div>

            {/* Main heading */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              <span className="text-gradient">PPT Generator</span>
            </h1>

            <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
              Transform your worship lyrics into stunning PowerPoint slides with
              ease. Perfect for church services and praise events.
            </p>

            <Button size="lg" className="gap-2 px-8" asChild>
              <Link href="#main-lyric">
                Get Started
                <ArrowDown className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </div>

      {/* Main Content */}
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
          </PptGeneratorFormProvider>
        </PptSettingsUIProvider>
      </LineToSlideMapperProvider>
    </>
  );
};

export default PptGeneratorPage;
