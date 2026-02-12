import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { ArrowRight, FileSliders, Sparkles } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Khen | Ho2 Tool Suite",
  description: "A web based tool suite. ",
};

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col">
      {/* Hero Section */}
      <div className="relative flex flex-1 items-center overflow-hidden">
        {/* Background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

        <Container className="relative py-20 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                Tools for worship teams
              </span>
            </div>

            {/* Heading */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Welcome to{" "}
              <span className="text-gradient block">Khen Tool Suite</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-10 max-w-lg text-lg text-muted-foreground md:text-xl">
              Streamline your worship preparation with our suite of tools
              designed for efficiency and ease of use.
            </p>

            {/* CTA */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="gap-2 px-8" asChild>
                <Link href="/ppt-generator">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Features Section */}
      <section className="border-t bg-muted/30">
        <Container className="py-16 lg:py-20">
          <h2 className="mb-12 text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Available Tools
          </h2>

          <div className="mx-auto max-w-lg">
            {/* PPT Generator Card */}
            <Link
              href="/ppt-generator"
              className="group block rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                <FileSliders className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold tracking-tight group-hover:text-primary">
                PPT Generator
              </h3>
              <p className="mb-4 text-muted-foreground">
                Transform your worship lyrics into stunning PowerPoint slides
                with extensive customization options.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Try it now
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>

          {/* Coming soon indicator */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            More tools coming soon...
          </p>
        </Container>
      </section>
    </div>
  );
}
