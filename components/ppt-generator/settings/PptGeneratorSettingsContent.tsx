"use client";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { usePptSettingsUIContext } from "@/components/context/PptSettingsUIContext";
import {
  MAIN_SECTION_NAME,
  PPT_GENERATION_SHARED_GENERAL_SETTINGS,
  SETTING_CATEGORY,
  TAB_TYPES,
} from "@/lib/constant";
import { SectionSettingsKeyType } from "@/lib/types";
import PptGeneratorSettingHeader from "./PptGeneratorSettingHeader";
import PptGeneratorSettingsTabContent, {
  PptGeneratorSettingsTabContentProps,
} from "./PptGeneratorSettingsTabContent";

type Props = {};

const PptGeneratorSettingsContent = (props: Props) => {
  const { settingsValues, sectionItems, currentSection, setCurrentSection } =
    usePptGeneratorFormContext();
  const {
    settingsUIState,
    setCurrentCategoryTab,
    setCurrentContentTab,
    setCurrentCoverTab,
    setSectionTabs,
  } = usePptSettingsUIContext();

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

  // Function Currying
  const handleSectionTabChange =
    ({ sectionName, tabType }: { sectionName: string; tabType: TAB_TYPES }) =>
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
    <>
      <PptGeneratorSettingHeader
        isDifferentSettingsBySection={isDifferentSettingsBySection}
        currentSection={currentSection}
        sectionItems={sectionItems}
        setCurrentSection={setCurrentSection}
      />
      <PptGeneratorSettingsTabContent {...settingsContentProps} />
    </>
  );
};

export default PptGeneratorSettingsContent;
