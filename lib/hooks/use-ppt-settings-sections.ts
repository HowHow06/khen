import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
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

  const processMainTextChange = useCallback(
    (mainText: string) => {
      const isDifferentSettingsBySection =
        settingsValues.general.useDifferentSettingForEachSection === true;
      if (!isDifferentSettingsBySection) {
        return;
      }

      const originalSettingValues = settingsValues;
      const sectionNameList = getLinesStartingWith(
        mainText,
        LYRIC_SECTION.SECTION,
      );

      // for settings form value
      const newSectionValues = {
        ...deepCopy(originalSettingValues[SETTING_CATEGORY.SECTION] || {}),
      };

      // for section dropdown options
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

        const sectionIsUsingMainSettings =
          newSectionValues[currentSectionKey].general.useMainSectionSettings ||
          false;
        const sectionLabel = `${sectionName.replace(LYRIC_SECTION.SECTION, "").trim()}${!sectionIsUsingMainSettings ? " *" : ""}`;
        newSectionItems.push({
          value: currentSectionKey,
          label: sectionLabel,
        });
      });

      const hasRemovedSections =
        newSectionItems.length < sectionItems.length - 1;
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
        setCurrentSection((currentSection) =>
          newSectionItems.find(({ value }) => value === currentSection) ===
          undefined
            ? MAIN_SECTION_NAME
            : currentSection,
        );
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
    },
    [sectionItems, settingsValues, formReset],
  );

  // listen to mainText change, set options for sectionDropdown and set sectionValues
  useEffect(() => {
    const debouncedStateHandler = debounce(processMainTextChange, 300);
    debouncedStateHandler(mainText);
  }, [mainText, processMainTextChange]);

  return {
    sectionItems,
    currentSection,
    setCurrentSection,
  };
};

export default usePptSettingsSections;
