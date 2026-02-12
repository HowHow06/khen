"use client";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DEFAULT_PRESETS } from "@/lib/constant";
import { SCREEN_SIZE } from "@/lib/constant/general";
import { useScreenSize } from "@/lib/hooks/use-screen-size";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import ExportSlidesImageButton from "../ExportSlidesImageButton";
import GeneratePreviewButton from "../GeneratePreviewButton";
import PptGeneratorSettingsContent from "./PptGeneratorSettingsContent";
import PresetsDropdown from "./PresetsDropdown";

const PptGeneratorSettings = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const toggleSettingSidebar = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };
  const screenSize = useScreenSize();
  const isExtraSmallScreen = screenSize === SCREEN_SIZE.XS;
  const { settingsValues, currentSection } = usePptGeneratorFormContext();
  const isDifferentSettingsBySection =
    settingsValues.general.useDifferentSettingForEachSection === true;

  return (
    <div className="flex flex-row space-x-2">
      <Sheet
        modal={isExtraSmallScreen ? true : false}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      >
        <SheetTitle className="sr-only">Settings</SheetTitle>
        <SheetTrigger asChild>
          <Button onClick={toggleSettingSidebar} variant="outline">
            {isSettingsOpen ? "Close" : "Open"} Settings
          </Button>
        </SheetTrigger>
        {!isExtraSmallScreen && (
          <SheetTrigger asChild>
            <Button
              onClick={toggleSettingSidebar}
              variant={"outline"}
              className={`fixed top-1/2 flex -translate-y-1/2 transform items-center rounded-r-none px-0 py-10 transition-all ease-in-out ${
                isSettingsOpen
                  ? "right-1/2 duration-500 sm:right-96 xl:right-1/4 2xl:right-[21vw]"
                  : "right-0 duration-300"
              }`}
              aria-label="Open settings"
            >
              <ChevronLeft
                className={`${isSettingsOpen ? "rotate-180 transform" : ""} transition-transform duration-700`}
              />
            </Button>
          </SheetTrigger>
        )}
        <SheetContent
          className={cn(
            "w-100 flex h-4/5 flex-col gap-2 sm:h-full sm:w-96 sm:max-w-none xl:w-1/4 2xl:w-[21vw]",
            isExtraSmallScreen && "rounded-t-3xl shadow-md",
          )}
          side={isExtraSmallScreen ? "bottom" : "right"}
          onInteractOutside={
            isExtraSmallScreen
              ? () => setIsSettingsOpen(false)
              : (event) => event.preventDefault() // prevent it from closing
          }
        >
          <PptGeneratorSettingsContent />
        </SheetContent>
      </Sheet>
      <GeneratePreviewButton />
      <ExportSlidesImageButton />
      {/* Add presets dropdown at mobile screen size to ease configuration process*/}
      {isExtraSmallScreen && (
        <PresetsDropdown
          hasSectionSettings={isDifferentSettingsBySection}
          currentSectionName={currentSection}
          presets={DEFAULT_PRESETS}
        />
      )}
    </div>
  );
};

export default PptGeneratorSettings;
