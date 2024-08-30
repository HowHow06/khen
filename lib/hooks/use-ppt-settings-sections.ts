import { useEffect, useState } from "react";
import { UseFormReset } from "react-hook-form";
import {
  LYRIC_SECTION,
  MAIN_SECTION_NAME,
  PPT_GENERATION_SETTINGS_META,
  SECTION_PREFIX,
  SETTING_CATEGORY,
} from "../constant";
import {
  PptSettingsStateType,
  SectionSettingsKeyType,
  SelectionItemsType,
} from "../types";
import {
  deepCompare,
  deepCopy,
  getLinesStartingWith,
  getSectionSettingsInitialValue,
} from "../utils";

type Props = {
  mainText: string;
  settingsValues: PptSettingsStateType;
  formReset: UseFormReset<{
    [x: string]: any;
  }>;
};

const usePptSettingsSections = ({
  mainText,
  settingsValues,
  formReset,
}: Props) => {
  const [currentSection, setCurrentSection] = useState(MAIN_SECTION_NAME);
  const [sectionItems, setSectionItems] = useState<SelectionItemsType>([
    {
      value: MAIN_SECTION_NAME,
      label: "Main Section",
    },
  ]);
  const isDifferentSettingsBySection =
    settingsValues.general.useDifferentSettingForEachSection === true;

  useEffect(() => {
    if (!isDifferentSettingsBySection) {
      return;
    }

    const sectionNameList = getLinesStartingWith(
      mainText,
      LYRIC_SECTION.SECTION,
    );

    const originalSettingValues = settingsValues;

    // for settings form
    const newSectionValues = {
      ...deepCopy(originalSettingValues[SETTING_CATEGORY.SECTION] || {}),
    };

    // for dropdown options
    const newSectionItems = [
      {
        value: MAIN_SECTION_NAME,
        label: "Main Section",
      },
    ];

    sectionNameList.forEach((sectionName, currentIndex) => {
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

    const hasRemovedSections = newSectionItems.length < sectionItems.length - 1;
    if (hasRemovedSections) {
      // delete excess sections values
      const difference = sectionItems.length - 1 - newSectionItems.length;
      Array.from({ length: difference }).forEach((_, index) => {
        const sectionNumber = sectionNameList.length + 1 + index;
        delete newSectionValues[`${SECTION_PREFIX}${sectionNumber}`];
      });
    }

    const isSectionItemsChanged = !deepCompare(sectionItems, newSectionItems);
    if (isSectionItemsChanged) {
      setSectionItems(newSectionItems);
    }

    // Only reset the form if new values are different from the current ones
    const isSettingsValuesChanged = !deepCompare(
      newSectionValues,
      originalSettingValues[SETTING_CATEGORY.SECTION] || {},
    );

    if (isSettingsValuesChanged) {
      formReset({
        ...originalSettingValues,
        [SETTING_CATEGORY.SECTION]: newSectionValues,
      });
    }
  }, [
    mainText,
    sectionItems,
    isDifferentSettingsBySection,
    settingsValues,
    formReset,
  ]);

  useEffect(() => {
    if (
      sectionItems.find(({ value }) => value === currentSection) === undefined
    ) {
      setCurrentSection(MAIN_SECTION_NAME);
    }
  }, [currentSection, sectionItems]);

  return {
    sectionItems,
    currentSection,
    setCurrentSection,
  };
};

export default usePptSettingsSections;
