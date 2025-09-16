import { LineToSlideMapperProvider } from "@/components/context/LineToSlideMapperContext";
import { PptGeneratorFormProvider } from "@/components/context/PptGeneratorFormContext";
import { PptSettingsUIProvider } from "@/components/context/PptSettingsUIContext";

import MainLyricSection from "@/components/ppt-generator/MainLyricSection";
import SecondaryLyricSection from "@/components/ppt-generator/SecondaryLyricSection";
import FileNameSettings from "@/components/ppt-generator/settings/FileNameSettings";
import PptGeneratorSettings from "@/components/ppt-generator/settings/PptGeneratorSettings";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PPT Generator",
  description:
    "A tool to generator PPT by inserting lyrics, simplifying the creation of PowerPoint presentations for church praise and worship songs.",
};
type Props = {};

const PptGeneratorPage = (props: Props) => {
  return (
    <>
      {" "}
      {/* Font File: credit to https://github.com/pjobson/Microsoft-365-Fonts */}
      {/* https://github.com/vercel/next.js/discussions/40345#discussioncomment-10145316 */}
      {/* https://stackoverflow.com/questions/36178001/how-to-lazy-load-web-font-declared-by-font-face */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url(/css/microsoft-yahei.css);
        @import url(/css/ebrima.css);`,
        }}
      />
      <Container className="max-w-screen-xl py-8 text-center lg:py-16">
        <h1 className="text-primary-900 mb-4 text-3xl font-extrabold leading-none tracking-tight md:text-4xl lg:text-5xl">
          Khen PPT Generator
        </h1>
        <p className="text-primary-500 mb-8 text-base font-normal sm:px-16 lg:text-xl xl:px-48">
          Generate PPT Slides for your songs at ease!
        </p>
        <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0 lg:mb-8">
          <Button
            // variant="ghost"
            variant="outline"
            className="px-5 py-6"
            asChild
          >
            <Link href={"#search-lyrics"}>Get Started!</Link>
          </Button>
          {/* <Button
                variant="outline"
                className="px-5 py-6 text-center text-base font-medium"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
                </svg>
                Watch video
              </Button> */}
        </div>
      </Container>
      <Container>
        <h2
          className="mt-8 text-xl font-semibold tracking-tight"
          id="search-lyrics"
        >
          1. Search Lyrics
        </h2>
        <div className="">coming soon...</div>
      </Container>
      <LineToSlideMapperProvider>
        <PptSettingsUIProvider>
          <PptGeneratorFormProvider>
            <Container>
              <h2 className="mt-8 text-xl font-semibold tracking-tight">
                2. Insert Main Lyric
              </h2>
              <MainLyricSection />
            </Container>
            <Container>
              <h2 className="mt-8 text-xl font-semibold tracking-tight">
                3. Insert Secondary Lyric
              </h2>
              <SecondaryLyricSection />
            </Container>
            <Container>
              <h2 className="mt-8 text-xl font-semibold tracking-tight">
                4. Settings
              </h2>
              <PptGeneratorSettings />
            </Container>
            <Container>
              <h2 className="mt-8 text-xl font-semibold tracking-tight">
                5. Generate PPT!
              </h2>
              <div className="mr-2 w-full lg:w-1/2">
                <FileNameSettings />
                <div>
                  <Button variant="default" type="submit">
                    Generate
                  </Button>
                </div>
              </div>
            </Container>
          </PptGeneratorFormProvider>
        </PptSettingsUIProvider>
      </LineToSlideMapperProvider>
    </>
  );
};

export default PptGeneratorPage;
