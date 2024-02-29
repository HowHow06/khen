"use client";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { usePptSettingsUIContext } from "@/components/context/PptSettingsUIContext";
import FormSelect from "@/components/ui/form-select";
import {
  CONTENT_TYPE,
  DEFAULT_PRESETS,
  LYRIC_SECTION,
  MAIN_SECTION_NAME,
  PPT_GENERATION_SETTINGS_META,
  PPT_GENERATION_SHARED_GENERAL_SETTINGS,
  SECTION_PREFIX,
  SETTING_CATEGORY,
  TEXTBOX_GROUPING_PREFIX,
  TEXTBOX_SETTING_KEY,
} from "@/lib/constant";
import { SCREEN_SIZE } from "@/lib/constant/general";
import { useScreenSize } from "@/lib/hooks/use-screen-size";
import {
  BaseSettingMetaType,
  PptSettingsStateType,
  SectionSettingsKeyType,
  SectionSettingsType,
  SelectionItemsType,
} from "@/lib/types";
import {
  cn,
  getLinesStartingWith,
  getSectionSettingsInitialValue,
  groupByAsObject,
} from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../ui/button";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import BaseSettings from "./BaseSettings";
import GroupedBaseSettings from "./GroupedBaseSettings";
import PresetsDropdown from "./PresetsDropdown";
import SettingsOptionsDropdown from "./SettingsOptionsDropdown";

const PptSettingsTabLists = () => {
  return (
    <ScrollArea className="w-full pb-3">
      <TabsList className={cn("grid w-max min-w-full grid-cols-3")}>
        <TabsTrigger value={SETTING_CATEGORY.GENERAL} className="min-w-20">
          General
        </TabsTrigger>
        <TabsTrigger value={SETTING_CATEGORY.COVER} className="min-w-20">
          Cover
        </TabsTrigger>
        <TabsTrigger value={SETTING_CATEGORY.CONTENT} className="min-w-20">
          Content
        </TabsTrigger>
        <ScrollBar orientation="horizontal" />
      </TabsList>
    </ScrollArea>
  );
};

type TabContentBaseProp = {
  scrollAreaClassName?: string;
  settingsPrefix: string;
};

type TabContentWithInnerTabProp = TabContentBaseProp & {
  tabsValue?: string;
  onTabsValueChange?: (tab: string) => void;
};

const GeneralSettingsTabContent = ({
  scrollAreaClassName,
  isForSection,
  settingsPrefix,
  isSectionUseMainSectionSettings = false,
}: TabContentBaseProp & {
  sectionSettings?: SectionSettingsType;
} & (
    | {
        isForSection: boolean;
        isSectionUseMainSectionSettings: boolean;
      }
    | {
        isForSection?: never;
        isSectionUseMainSectionSettings?: never;
      }
  )) => {
  const settingMetaToUse: BaseSettingMetaType = useMemo(() => {
    if (!isForSection) {
      return PPT_GENERATION_SETTINGS_META.general;
    }

    if (isSectionUseMainSectionSettings) {
      return {
        useMainSectionSettings:
          PPT_GENERATION_SETTINGS_META.section.useMainSectionSettings,
      }; // show only useMainSectionSettings
    }

    return PPT_GENERATION_SETTINGS_META.section;
  }, [isForSection, isSectionUseMainSectionSettings]);

  return (
    <TabsContent value={SETTING_CATEGORY.GENERAL}>
      <ScrollArea
        className={cn("h-[54vh] pl-3 pr-4 sm:h-[75vh]", scrollAreaClassName)}
      >
        <BaseSettings
          settingsMeta={settingMetaToUse}
          keyPrefix={settingsPrefix}
          className="pb-5 xl:pb-10"
        />
      </ScrollArea>
    </TabsContent>
  );
};

const CoverSettingsTabContent = ({
  tabsValue,
  onTabsValueChange,
  scrollAreaClassName,
  settingsPrefix,
}: TabContentWithInnerTabProp & {}) => {
  return (
    <TabsContent value={SETTING_CATEGORY.COVER}>
      <Tabs
        defaultValue={CONTENT_TYPE.MAIN}
        value={tabsValue}
        onValueChange={onTabsValueChange}
        className="w-full px-2"
      >
        <TabsList className="my-2 grid w-full grid-cols-2">
          <TabsTrigger value={CONTENT_TYPE.MAIN}>Main</TabsTrigger>
          <TabsTrigger value={CONTENT_TYPE.SECONDARY}>Secondary</TabsTrigger>
        </TabsList>
        <TabsContent value={CONTENT_TYPE.MAIN}>
          <ScrollArea
            className={cn("h-[50vh] pr-3 sm:h-[72vh]", scrollAreaClassName)}
          >
            <BaseSettings
              settingsMeta={PPT_GENERATION_SETTINGS_META.cover}
              keyPrefix={settingsPrefix + CONTENT_TYPE.MAIN + "."}
              className="pb-5 xl:pb-10"
            />
          </ScrollArea>
        </TabsContent>
        <TabsContent value={CONTENT_TYPE.SECONDARY}>
          <ScrollArea
            className={cn("h-[50vh] pr-3 sm:h-[72vh]", scrollAreaClassName)}
          >
            <BaseSettings
              settingsMeta={PPT_GENERATION_SETTINGS_META.cover}
              keyPrefix={settingsPrefix + CONTENT_TYPE.SECONDARY + "."}
              className="pb-5 xl:pb-10"
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
};

const groupedContentSettings = groupByAsObject(
  PPT_GENERATION_SETTINGS_META.content,
  "groupingName",
);

const ContentSettingsTabContent = ({
  tabsValue,
  onTabsValueChange,
  isIgnoreSubcontent = false,
  textBoxCount,
  scrollAreaClassName,
  settingsPrefix,
}: TabContentWithInnerTabProp & {
  textBoxCount: number;
  isIgnoreSubcontent?: boolean;
}) => {
  const groupedTextBoxSettings = useMemo(() => {
    return Array.from({
      length: textBoxCount,
    }).reduce<{}>((result, _, currentIndex) => {
      return {
        ...result,
        [`${TEXTBOX_GROUPING_PREFIX}${currentIndex + 1}`]:
          PPT_GENERATION_SETTINGS_META.contentTextbox,
      };
    }, {});
  }, [textBoxCount]);

  return (
    <TabsContent value={SETTING_CATEGORY.CONTENT}>
      <Tabs
        defaultValue={CONTENT_TYPE.MAIN}
        value={tabsValue}
        onValueChange={onTabsValueChange}
        className="w-full px-2"
      >
        {!isIgnoreSubcontent && (
          <TabsList className="my-2 grid w-full grid-cols-2">
            <TabsTrigger value={CONTENT_TYPE.MAIN}>Main</TabsTrigger>
            <TabsTrigger value={CONTENT_TYPE.SECONDARY}>Secondary</TabsTrigger>
          </TabsList>
        )}
        <TabsContent value={CONTENT_TYPE.MAIN}>
          <ScrollArea
            className={cn("h-[50vh] pr-3 sm:h-[72vh]", scrollAreaClassName)}
          >
            <GroupedBaseSettings
              keyPrefix={`${settingsPrefix}${CONTENT_TYPE.MAIN}.${TEXTBOX_SETTING_KEY}.`}
              accordionKey={CONTENT_TYPE.MAIN + TEXTBOX_SETTING_KEY}
              groupedSettingsMeta={groupedTextBoxSettings}
            />
            <GroupedBaseSettings
              keyPrefix={`${settingsPrefix}${CONTENT_TYPE.MAIN}.`}
              accordionKey={CONTENT_TYPE.MAIN}
              groupedSettingsMeta={groupedContentSettings}
              defaultAccordionValue={[`text`]}
              className="pb-5 xl:pb-10"
            />
          </ScrollArea>
        </TabsContent>
        {!isIgnoreSubcontent && (
          <TabsContent value={CONTENT_TYPE.SECONDARY}>
            <ScrollArea
              className={cn("h-[50vh] pr-3 sm:h-[72vh]", scrollAreaClassName)}
            >
              <GroupedBaseSettings
                keyPrefix={`${settingsPrefix}${CONTENT_TYPE.SECONDARY}.${TEXTBOX_SETTING_KEY}.`}
                accordionKey={CONTENT_TYPE.SECONDARY + TEXTBOX_SETTING_KEY}
                groupedSettingsMeta={groupedTextBoxSettings}
              />
              <GroupedBaseSettings
                keyPrefix={`${settingsPrefix}${CONTENT_TYPE.SECONDARY}.`}
                accordionKey={CONTENT_TYPE.SECONDARY}
                groupedSettingsMeta={groupedContentSettings}
                defaultAccordionValue={[`text`]}
                className="pb-5 xl:pb-10"
              />
            </ScrollArea>
          </TabsContent>
        )}
      </Tabs>
    </TabsContent>
  );
};

const PptGeneratorSetting = () => {
  const { form, mainText } = usePptGeneratorFormContext();
  const { getValues, reset } = form;
  const {
    settingsUIState,
    setCurrentCategoryTab,
    setCurrentContentTab,
    setCurrentCoverTab,
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
    const newSectionValues: {
      [key in SectionSettingsKeyType]: SectionSettingsType;
    } = { ...originalSettingValues[SETTING_CATEGORY.SECTION] };

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
        label: `${sectionName.replace(LYRIC_SECTION.SECTION, "")}`,
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

  // useEffect(() => {
  //   //TODO: repopulate the textbox value in settings, similar to section settings
  // }, [currentTextboxCount]);

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
                  ? "right-1/2 duration-500 sm:right-96 xl:right-1/4"
                  : "right-0 duration-300"
              }`}
            >
              <ChevronLeft
                className={`${isOpen ? "rotate-180 transform" : ""} transition-transform duration-700`}
              />
            </Button>
          </SheetTrigger>
        )}

        <SheetContent
          className={cn(
            "w-100 h-4/5 sm:h-full sm:w-96 xl:w-1/4",
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
            <div className="flex flex-row items-center space-x-5">
              <SheetTitle>Settings</SheetTitle>
              <PresetsDropdown
                hasSectionSettings={isDifferentSettingsBySection}
                currentSectionName={currentSection}
                presets={DEFAULT_PRESETS}
              />
              <SettingsOptionsDropdown
                hasSectionSettings={isDifferentSettingsBySection}
                currentSectionName={currentSection}
              />
            </div>
            {isDifferentSettingsBySection && (
              <FormSelect
                items={sectionItems}
                selectedValue={currentSection}
                onItemSelect={(value) => setCurrentSection(value)}
                className="w-full"
              />
            )}
          </SheetHeader>
          {isUserAtSectionSettings ? (
            <Tabs
              defaultValue={SETTING_CATEGORY.GENERAL}
              className="mt-2 w-full"
            >
              {!isUseMainSectionSettings && <PptSettingsTabLists />}
              <GeneralSettingsTabContent
                settingsPrefix={`${SETTING_CATEGORY.SECTION}.${currentSection}.${SETTING_CATEGORY.GENERAL}.`}
                isForSection={true}
                isSectionUseMainSectionSettings={
                  currentSectionSetting?.general.useMainSectionSettings === true
                }
              />
              <CoverSettingsTabContent
                settingsPrefix={`${SETTING_CATEGORY.SECTION}.${currentSection}.${SETTING_CATEGORY.COVER}.`}
              />
              <ContentSettingsTabContent
                settingsPrefix={`${SETTING_CATEGORY.SECTION}.${currentSection}.${SETTING_CATEGORY.CONTENT}.`}
                textBoxCount={currentTextboxCount}
                isIgnoreSubcontent={currentIsIgnoreSubContent}
              />
            </Tabs>
          ) : (
            <Tabs
              defaultValue={SETTING_CATEGORY.GENERAL}
              className="mt-2 w-full"
              value={settingsUIState.currentCategoryTab}
              onValueChange={setCurrentCategoryTab}
            >
              <PptSettingsTabLists />
              <GeneralSettingsTabContent
                settingsPrefix={`${SETTING_CATEGORY.GENERAL}.`}
                scrollAreaClassName="h-[47vh] sm:h-[68vh]"
              />
              <CoverSettingsTabContent
                tabsValue={settingsUIState?.currentCoverTab}
                onTabsValueChange={setCurrentCoverTab}
                settingsPrefix={`${SETTING_CATEGORY.COVER}.`}
                scrollAreaClassName="h-[43vh] sm:h-[65vh]"
              />
              <ContentSettingsTabContent
                tabsValue={settingsUIState.currentContentTab}
                onTabsValueChange={setCurrentContentTab}
                settingsPrefix={`${SETTING_CATEGORY.CONTENT}.`}
                scrollAreaClassName={"h-[43vh] sm:h-[65vh]"}
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
