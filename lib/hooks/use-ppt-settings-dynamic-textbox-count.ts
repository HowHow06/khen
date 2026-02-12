"use client";
import {
  CONTENT_TYPE,
  PPT_GENERATION_SHARED_GENERAL_SETTINGS,
  TEXTBOX_GROUPING_PREFIX,
} from "@/lib/constant";
import {
  ContentSettingsType,
  ContentTextboxKey,
  PptSettingsStateType,
  SectionSettingsKeyType,
} from "@/lib/types";
import { deepCompare, deepCopy } from "@/lib/utils/general";
import { getInitialTextboxSettings } from "@/lib/utils/ppt-generator/settings-generator";
import { useCallback, useEffect } from "react";
import { UseFormReset } from "react-hook-form";
import usePrevious from "./use-previous";

type Props = {
  settingsValues: PptSettingsStateType;
  formReset: UseFormReset<{
    [x: string]: any;
  }>;
};

const usePptSettingsDynamicTextboxCount = ({
  settingsValues,
  formReset,
}: Props) => {
  const prevSettingsValue = usePrevious(settingsValues);

  const getContentSettingsWithTextbox = useCallback(
    (
      targetContentSetting: {
        main: ContentSettingsType;
        secondary: ContentSettingsType;
      },
      newTextboxCount: number,
    ): {
      main: ContentSettingsType;
      secondary: ContentSettingsType;
    } => {
      const currentContentSettings = deepCopy(targetContentSetting);

      Object.entries(currentContentSettings).forEach(
        ([contentType, settings]) => {
          const contentTypeKey = contentType as CONTENT_TYPE;
          const originalTextboxCount = Object.keys(settings.textbox).length;
          const differenceInTextboxCount =
            newTextboxCount - originalTextboxCount;
          if (differenceInTextboxCount === 0) {
            return;
          }
          if (differenceInTextboxCount > 0) {
            // add new default value
            Array.from({ length: differenceInTextboxCount }).forEach(
              (_, index) => {
                const newTextboxNumber = originalTextboxCount + index + 1;
                const textboxKey =
                  `${TEXTBOX_GROUPING_PREFIX}${newTextboxNumber}` as ContentTextboxKey;

                currentContentSettings[contentTypeKey].textbox[textboxKey] =
                  getInitialTextboxSettings();
              },
            );
          }

          if (differenceInTextboxCount < 0) {
            // remove excess textboxes
            Array.from({ length: -differenceInTextboxCount }).forEach(
              (_, index) => {
                const targetTextboxNumber = newTextboxCount + 1 + index;
                delete currentContentSettings[contentTypeKey].textbox[
                  `${TEXTBOX_GROUPING_PREFIX}${targetTextboxNumber}`
                ];
              },
            );
          }
        },
      );

      return currentContentSettings;
    },
    [],
  );

  useEffect(() => {
    const fieldKey = "textboxCountPerContentPerSlide" as const;
    const defaultTextboxCount =
      PPT_GENERATION_SHARED_GENERAL_SETTINGS[fieldKey].defaultValue;

    const settingsValuesCopy = deepCopy(settingsValues);
    const isMainTextboxCountChanged =
      prevSettingsValue?.general[fieldKey] !==
      settingsValuesCopy.general[fieldKey];

    if (isMainTextboxCountChanged) {
      // handle main content settings
      const newContentSettings = getContentSettingsWithTextbox(
        settingsValuesCopy.content,
        settingsValuesCopy.general[fieldKey] || defaultTextboxCount,
      );
      settingsValuesCopy.content = newContentSettings;
    }

    const sectionsValues =
      settingsValuesCopy.section && Object.entries(settingsValuesCopy.section);
    if (sectionsValues) {
      // handle content settings for each section
      sectionsValues.forEach(([key, newValues]) => {
        const sectionKey = key as SectionSettingsKeyType;
        const isTextboxCountChanged =
          prevSettingsValue?.section?.[sectionKey]?.general[fieldKey] !==
          newValues.general[fieldKey];
        if (isTextboxCountChanged) {
          const newContentSettings = getContentSettingsWithTextbox(
            newValues.content,
            newValues.general[fieldKey] || defaultTextboxCount,
          );
          // modify the settingsValuesCopy object by reference
          newValues.content = newContentSettings;
        }
      });
    }

    const isSettingsChanged = !deepCompare(
      prevSettingsValue || {},
      settingsValuesCopy,
    );

    if (isSettingsChanged) {
      formReset(settingsValuesCopy);
    }
  }, [
    settingsValues,
    prevSettingsValue,
    getContentSettingsWithTextbox,
    formReset,
  ]);

  return;
};

export default usePptSettingsDynamicTextboxCount;
