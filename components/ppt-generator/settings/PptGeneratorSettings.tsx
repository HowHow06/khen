"use client";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { usePptSettingsUIContext } from "@/components/context/PptSettingsUIContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DEFAULT_PRESETS,
  MAIN_SECTION_NAME,
  PPT_GENERATION_SHARED_GENERAL_SETTINGS,
  SETTING_CATEGORY,
  TAB_TYPES,
} from "@/lib/constant";
import { SCREEN_SIZE } from "@/lib/constant/general";
import { useScreenSize } from "@/lib/hooks/use-screen-size";
import { SectionSettingsKeyType, TabType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import GeneratePreviewButton from "../GeneratePreviewButton";
import PptGeneratorSettingHeader from "./PptGeneratorSettingHeader";
import PptGeneratorSettingsTabContent, {
  PptGeneratorSettingsTabContentProps,
} from "./PptGeneratorSettingsTabContent";
import PresetsDropdown from "./PresetsDropdown";

const PptGeneratorSettings = () => {
  const { settingsValues, sectionItems, currentSection, setCurrentSection } =
    usePptGeneratorFormContext();
  const {
    settingsUIState,
    setCurrentCategoryTab,
    setCurrentContentTab,
    setCurrentCoverTab,
    setSectionTabs,
  } = usePptSettingsUIContext();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const screenSize = useScreenSize();
  const isExtraSmallScreen = screenSize === SCREEN_SIZE.XS;

  const isDifferentSettingsBySection =
    settingsValues.general.useDifferentSettingForEachSection === true;

  const isUserAtSectionSettings =
    isDifferentSettingsBySection && currentSection !== MAIN_SECTION_NAME;

  const currentSectionSetting =
    settingsValues.section?.[currentSection as SectionSettingsKeyType];
  const currentSetting = isUserAtSectionSettings
    ? currentSectionSetting
    : settingsValues;

  const currentGeneralSetting = currentSetting?.general;

  const currentTextboxCount =
    currentGeneralSetting?.textboxCountPerContentPerSlide ??
    PPT_GENERATION_SHARED_GENERAL_SETTINGS.textboxCountPerContentPerSlide
      .defaultValue;

  const currentIsIgnoreSubContent =
    currentGeneralSetting?.ignoreSubcontent === true;

  const isUseMainSectionSettings =
    isUserAtSectionSettings &&
    currentSectionSetting?.general?.useMainSectionSettings === true;

  const toggleSettingSidebar = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Function Currying
  const handleSectionTabChange =
    ({ sectionName, tabType }: { sectionName: string; tabType: TabType }) =>
    (newTabValue: string) => {
      setSectionTabs({
        sectionName: sectionName,
        tab: newTabValue,
        tabType: tabType,
      });
    };

  const settingsContentProps: PptGeneratorSettingsTabContentProps =
    isUserAtSectionSettings
      ? {
          tabs: {
            value:
              settingsUIState.sectionTabs[currentSection]?.currentCategoryTab ||
              SETTING_CATEGORY.GENERAL,
            onValueChange: handleSectionTabChange({
              sectionName: currentSection,
              tabType: TAB_TYPES.SETTINGS_CATEGORY,
            }),
          },
          isHideSettingsTabsList: isUseMainSectionSettings,
          generalContent: {
            settingsPrefix: `${SETTING_CATEGORY.SECTION}.${currentSection}.${SETTING_CATEGORY.GENERAL}.`,
            isForSection: true,
            isSectionUseMainSectionSettings:
              currentSectionSetting?.general.useMainSectionSettings === true,
          },
          coverContent: {
            settingsPrefix: `${SETTING_CATEGORY.SECTION}.${currentSection}.${SETTING_CATEGORY.COVER}.`,
            onTabsValueChange: handleSectionTabChange({
              sectionName: currentSection,
              tabType: TAB_TYPES.COVER,
            }),
            tabsValue:
              settingsUIState.sectionTabs[currentSection]?.currentCoverTab,
          },
          contentContent: {
            settingsPrefix: `${SETTING_CATEGORY.SECTION}.${currentSection}.${SETTING_CATEGORY.CONTENT}.`,
            textBoxCount: currentTextboxCount,
            isIgnoreSubcontent: currentIsIgnoreSubContent,
            onTabsValueChange: handleSectionTabChange({
              sectionName: currentSection,
              tabType: TAB_TYPES.CONTENT,
            }),
            tabsValue:
              settingsUIState.sectionTabs[currentSection]?.currentContentTab,
          },
        }
      : {
          tabs: {
            value: settingsUIState.currentCategoryTab,
            onValueChange: setCurrentCategoryTab,
          },
          isHideSettingsTabsList: false,
          generalContent: {
            settingsPrefix: `${SETTING_CATEGORY.GENERAL}.`,
            isForSection: false,
            isSectionUseMainSectionSettings: false,
          },
          coverContent: {
            settingsPrefix: `${SETTING_CATEGORY.COVER}.`,
            onTabsValueChange: setCurrentCoverTab,
            tabsValue: settingsUIState?.currentCoverTab,
          },
          contentContent: {
            settingsPrefix: `${SETTING_CATEGORY.CONTENT}.`,
            textBoxCount: currentTextboxCount,
            isIgnoreSubcontent: currentIsIgnoreSubContent,
            onTabsValueChange: setCurrentContentTab,
            tabsValue: settingsUIState.currentContentTab,
          },
        };

  return (
    <div className="flex flex-row space-x-2">
      <Sheet
        modal={isExtraSmallScreen ? true : false}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      >
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
        <GeneratePreviewButton />
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
          <SheetHeader>
            <PptGeneratorSettingHeader
              isDifferentSettingsBySection={isDifferentSettingsBySection}
              currentSection={currentSection}
              sectionItems={sectionItems}
              setCurrentSection={setCurrentSection}
            />
          </SheetHeader>
          <PptGeneratorSettingsTabContent {...settingsContentProps} />
        </SheetContent>
      </Sheet>
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
