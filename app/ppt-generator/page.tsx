import PptGeneratorContent from "@/components/ppt-generator/PptGeneratorContent";
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

const PptGeneratorPage = () => {
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
      <PptGeneratorContent />
    </>
  );
};

export default PptGeneratorPage;
