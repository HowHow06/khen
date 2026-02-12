"use client";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { usePptSettingsUIContext } from "@/components/context/PptSettingsUIContext";
import { Button } from "@/components/ui/button";
import {
  MAIN_SECTION_NAME,
  PPT_GENERATION_SHARED_GENERAL_SETTINGS,
  SETTING_CATEGORY,
  TAB_TYPES,
} from "@/lib/constant";
import { SectionSettingsKeyType } from "@/lib/types";
import { cn } from "@/lib/utils/general";
import { Code2, Layers } from "lucide-react";
import { useState } from "react";
import AdvancedSettingsMode from "./AdvancedSettingsMode";
import PptGeneratorSettingHeader from "./PptGeneratorSettingHeader";
import PptGeneratorSettingsTabContent, {
  PptGeneratorSettingsTabContentProps,
} from "./PptGeneratorSettingsTabContent";

type SettingsMode = "visual" | "advanced";

type Props = {
  onSectionChange?: (sectionName: { value: string; label: string }) => void;
};

const PptGeneratorSettingsContent = ({ onSectionChange }: Props) => {
  const [settingsMode, setSettingsMode] = useState<SettingsMode>("visual");
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
      {/* Mode Toggle */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center rounded-lg border bg-muted/30 p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsMode("visual")}
            className={cn(
              "gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              settingsMode === "visual"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            Visual
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsMode("advanced")}
            className={cn(
              "gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              settingsMode === "advanced"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Code2 className="h-3.5 w-3.5" />
            Advanced
          </Button>
        </div>
      </div>

      {settingsMode === "visual" ? (
        <>
          <PptGeneratorSettingHeader
            isDifferentSettingsBySection={isDifferentSettingsBySection}
            currentSection={currentSection}
            sectionItems={sectionItems}
            setCurrentSection={setCurrentSection}
            onSectionChange={onSectionChange}
          />
          <PptGeneratorSettingsTabContent {...settingsContentProps} />
        </>
      ) : (
        <AdvancedSettingsMode />
      )}
    </>
  );
};

export default PptGeneratorSettingsContent;
