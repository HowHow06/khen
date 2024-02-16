import { PptSettingsUIProvider } from "@/components/context/PptSettingsUIContext";
import PptGeneratorClientSection from "@/components/ppt-generator/PptGeneratorClientSection";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";

type Props = {};

const PptGeneratorPage = (props: Props) => {
  return (
    <>
      <Container>
        <div className="mx-auto max-w-screen-xl px-4 py-8 text-center lg:px-12 lg:py-16">
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
            >
              Get Started!
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
        </div>
      </Container>
      <Container>
        <h2 className="mt-8 text-xl font-semibold tracking-tight">
          1. Search Lyrics
        </h2>
        <div className="">to be implemented...</div>
      </Container>
      <PptSettingsUIProvider>
        <PptGeneratorClientSection />
      </PptSettingsUIProvider>
    </>
  );
};

export default PptGeneratorPage;
