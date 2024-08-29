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
import { Tabs } from "@/components/ui/tabs";
import {
  CONTENT_TYPE,
  DEFAULT_PRESETS,
  LYRIC_SECTION,
  MAIN_SECTION_NAME,
  PPT_GENERATION_SETTINGS_META,
  PPT_GENERATION_SHARED_GENERAL_SETTINGS,
  SECTION_PREFIX,
  SETTING_CATEGORY,
  TAB_TYPES,
  TEXTBOX_GROUPING_PREFIX,
} from "@/lib/constant";
import { SCREEN_SIZE } from "@/lib/constant/general";
import { useScreenSize } from "@/lib/hooks/use-screen-size";
import {
  ContentTextboxKey,
  ContentTypeType,
  PptSettingsStateType,
  SectionSettingsKeyType,
  SelectionItemsType,
  TabType,
} from "@/lib/types";
import {
  cn,
  getInitialTextboxSettings,
  getLinesStartingWith,
  getSectionSettingsInitialValue,
} from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import GeneratePreviewButton from "../GeneratePreviewButton";
import PptGeneratorSettingHeader from "./PptGeneratorSettingHeader";
import PptSettingsTabs from "./PptSettingsTabs";
import PresetsDropdown from "./PresetsDropdown";
import ContentSettingsTabContent from "./SettingsTabContent/Content";
import CoverSettingsTabContent from "./SettingsTabContent/Cover";
import GeneralSettingsTabContent from "./SettingsTabContent/General";

const PptGeneratorSetting = () => {
  const { form, mainText } = usePptGeneratorFormContext();
  const { getValues, reset } = form;
  const {
    settingsUIState,
    setCurrentCategoryTab,
    setCurrentContentTab,
    setCurrentCoverTab,
    setSectionTabs,
  } = usePptSettingsUIContext();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(MAIN_SECTION_NAME);
  const [sectionItems, setSectionItems] = useState<SelectionItemsType>([
    {
      value: MAIN_SECTION_NAME,
      label: "Main Section",
    },
  ]);
  const screenSize = useScreenSize();
  const isExtraSmallScreen = screenSize === SCREEN_SIZE.XS;

  const settingsValues = getValues() as PptSettingsStateType;
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

  let currentTextboxCount =
    currentGeneralSetting?.textboxCountPerContentPerSlide ??
    PPT_GENERATION_SHARED_GENERAL_SETTINGS.textboxCountPerContentPerSlide
      .defaultValue;

  const currentIsIgnoreSubContent =
    currentGeneralSetting?.ignoreSubcontent === true;

  const isUseMainSectionSettings =
    isUserAtSectionSettings &&
    currentSectionSetting?.general?.useMainSectionSettings === true;

  const toggleSettingSidebar = () => {
    setIsOpen(!isOpen);
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

  // handle add / remove section based on main text
  useEffect(() => {
    if (!isDifferentSettingsBySection) {
      return;
    }
    const sections = getLinesStartingWith(mainText, LYRIC_SECTION.SECTION);
    const newSectionItems = [
      {
        value: MAIN_SECTION_NAME,
        label: "Main Section",
      },
    ];

    const originalSettingValues = getValues();
    const newSectionValues = {
      ...originalSettingValues[SETTING_CATEGORY.SECTION],
    };

    sections.forEach((sectionName, currentIndex) => {
      const currentSectionNumber = currentIndex + 1;
      const currentSectionKey =
        `${SECTION_PREFIX}${currentSectionNumber}` as SectionSettingsKeyType;

      if (!newSectionValues[currentSectionKey]) {
        // generate initial values for new sections
        newSectionValues[currentSectionKey] = getSectionSettingsInitialValue({
          settings: PPT_GENERATION_SETTINGS_META,
        });
      }
      newSectionItems.push({
        value: currentSectionKey,
        label: `${sectionName.replace(LYRIC_SECTION.SECTION, "").trim()}`,
      });
    });

    if (sections.length < sectionItems.length - 1) {
      // delete excess sections
      const difference = sectionItems.length - 1 - sections.length;
      Array.from({ length: difference }).forEach((_, index) => {
        const sectionNumber = sections.length + 1 + index;
        delete newSectionValues[`${SECTION_PREFIX}${sectionNumber}`];
      });
    }

    setSectionItems(newSectionItems);
    reset({
      ...originalSettingValues,
      [SETTING_CATEGORY.SECTION]: newSectionValues,
    });
  }, [
    mainText,
    isDifferentSettingsBySection,
    getValues,
    reset,
    sectionItems.length,
  ]);

  // handle currentTextboxCount change
  useEffect(() => {
    const settingsValues = getValues() as PptSettingsStateType;
    const currentTargetSetting = isUserAtSectionSettings
      ? settingsValues.section?.[currentSection as SectionSettingsKeyType]
      : settingsValues;
    const currentContentSettings = currentTargetSetting?.content;
    if (
      currentTargetSetting === undefined ||
      currentContentSettings === undefined
    ) {
      return;
    }
    const newContentSettings = { ...currentContentSettings };
    Object.entries(currentContentSettings).forEach(
      ([contentType, settings]) => {
        const contentTypeKey = contentType as ContentTypeType;
        const originalTextboxCount = Object.keys(settings.textbox).length;
        const differenceInTextboxCount =
          currentTextboxCount - originalTextboxCount;
        if (differenceInTextboxCount === 0) {
          return;
        }
        if (differenceInTextboxCount > 0) {
          // add new
          Array.from({ length: differenceInTextboxCount }).forEach(
            (_, index) => {
              const newTextboxNumber = originalTextboxCount + index + 1;
              const textboxKey =
                `${TEXTBOX_GROUPING_PREFIX}${newTextboxNumber}` as ContentTextboxKey;

              newContentSettings[contentTypeKey].textbox[textboxKey] =
                getInitialTextboxSettings();
            },
          );
        }

        if (differenceInTextboxCount < 0) {
          // remove excess
          // Array.from({ length: -differenceInTextboxCount }).forEach(
          //   (_, index) => {
          //     const targetTextboxNumber = currentTextboxCount + 1 + index;
          //     delete newContentSettings[contentTypeKey].textbox[
          //       `${TEXTBOX_GROUPING_PREFIX}${targetTextboxNumber}`
          //     ];
          //   },
          // );
        }
      },
    );

    currentTargetSetting.content = newContentSettings;
    reset(settingsValues);
  }, [
    currentTextboxCount,
    getValues,
    reset,
    currentSection,
    isUserAtSectionSettings,
  ]);

  if (
    currentSection === MAIN_SECTION_NAME &&
    settingsUIState.currentContentTab !== CONTENT_TYPE.MAIN &&
    currentGeneralSetting?.ignoreSubcontent === true
  ) {
    setCurrentContentTab(CONTENT_TYPE.MAIN);
  }

  if (
    sectionItems.find(({ value }) => value === currentSection) === undefined
  ) {
    setCurrentSection(MAIN_SECTION_NAME);
  }

  const textboxCountMax =
    PPT_GENERATION_SHARED_GENERAL_SETTINGS.textboxCountPerContentPerSlide
      .rangeMax;
  const textboxCountMin =
    PPT_GENERATION_SHARED_GENERAL_SETTINGS.textboxCountPerContentPerSlide
      .rangeMin;
  if (currentTextboxCount > textboxCountMax) {
    currentTextboxCount = textboxCountMax;
  }
  if (currentTextboxCount < textboxCountMin) {
    currentTextboxCount = textboxCountMin;
  }

  return (
    <div className="flex flex-row space-x-2">
      <Sheet
        modal={isExtraSmallScreen ? true : false}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SheetTrigger asChild>
          <Button onClick={toggleSettingSidebar} variant="outline">
            {isOpen ? "Close" : "Open"} Settings
          </Button>
        </SheetTrigger>
        {!isExtraSmallScreen && (
          <SheetTrigger asChild>
            <Button
              onClick={toggleSettingSidebar}
              variant={"outline"}
              className={`fixed top-1/2 flex -translate-y-1/2 transform items-center rounded-r-none px-0 py-10 transition-all ease-in-out ${
                isOpen
                  ? "right-1/2 duration-500 sm:right-96 xl:right-1/4 2xl:right-[21vw]"
                  : "right-0 duration-300"
              }`}
              aria-label="Open settings"
            >
              <ChevronLeft
                className={`${isOpen ? "rotate-180 transform" : ""} transition-transform duration-700`}
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
              ? () => setIsOpen(false)
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
          {isUserAtSectionSettings ? (
            <Tabs
              value={
                settingsUIState.sectionTabs[currentSection]
                  ?.currentCategoryTab || SETTING_CATEGORY.GENERAL
              }
              className="flex h-full w-full flex-col"
              onValueChange={handleSectionTabChange({
                sectionName: currentSection,
                tabType: TAB_TYPES.SETTINGS_CATEGORY,
              })}
            >
              {!isUseMainSectionSettings && <PptSettingsTabs />}
              <GeneralSettingsTabContent
                settingsPrefix={`${SETTING_CATEGORY.SECTION}.${currentSection}.${SETTING_CATEGORY.GENERAL}.`}
                isForSection={true}
                isSectionUseMainSectionSettings={
                  currentSectionSetting?.general.useMainSectionSettings === true
                }
              />
              <CoverSettingsTabContent
                settingsPrefix={`${SETTING_CATEGORY.SECTION}.${currentSection}.${SETTING_CATEGORY.COVER}.`}
                onTabsValueChange={handleSectionTabChange({
                  sectionName: currentSection,
                  tabType: TAB_TYPES.COVER,
                })}
                tabsValue={
                  settingsUIState.sectionTabs[currentSection]?.currentCoverTab
                }
              />
              <ContentSettingsTabContent
                settingsPrefix={`${SETTING_CATEGORY.SECTION}.${currentSection}.${SETTING_CATEGORY.CONTENT}.`}
                textBoxCount={currentTextboxCount}
                isIgnoreSubcontent={currentIsIgnoreSubContent}
                onTabsValueChange={handleSectionTabChange({
                  sectionName: currentSection,
                  tabType: TAB_TYPES.CONTENT,
                })}
                tabsValue={
                  settingsUIState.sectionTabs[currentSection]?.currentContentTab
                }
              />
            </Tabs>
          ) : (
            <Tabs
              defaultValue={SETTING_CATEGORY.GENERAL}
              className="flex h-full w-full flex-col"
              value={settingsUIState.currentCategoryTab}
              onValueChange={setCurrentCategoryTab}
            >
              <PptSettingsTabs />
              <GeneralSettingsTabContent
                settingsPrefix={`${SETTING_CATEGORY.GENERAL}.`}
              />
              <CoverSettingsTabContent
                tabsValue={settingsUIState?.currentCoverTab}
                onTabsValueChange={setCurrentCoverTab}
                settingsPrefix={`${SETTING_CATEGORY.COVER}.`}
              />
              <ContentSettingsTabContent
                tabsValue={settingsUIState.currentContentTab}
                onTabsValueChange={setCurrentContentTab}
                settingsPrefix={`${SETTING_CATEGORY.CONTENT}.`}
                textBoxCount={currentTextboxCount}
                isIgnoreSubcontent={currentIsIgnoreSubContent}
              />
            </Tabs>
          )}
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

export default PptGeneratorSetting;
