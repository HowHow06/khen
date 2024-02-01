import {
  CONTENT_TYPE,
  DEFAULT_GROUPING_NAME,
  DEFAULT_LINE_COUNT,
  SETTING_CATEGORY,
  TEXTBOX_GROUPING_PREFIX,
} from "../constant";
import { PptGenerationSettingMetaType, PptSettingsState } from "../types";

export const generatePptSettingsInitialState = (
  settings: PptGenerationSettingMetaType,
): PptSettingsState => {
  const initialState: PptSettingsState = {
    [SETTING_CATEGORY.GENERAL]: {},
    [SETTING_CATEGORY.CONTENT]: {},
  };

  Object.entries(settings).forEach(([category, settingsMeta]) => {
    if (category == SETTING_CATEGORY.GENERAL) {
      Object.entries(settingsMeta).forEach(([key, setting]) => {
        if (setting.isHidden) {
          return;
        }
        if (setting.defaultValue !== undefined) {
          initialState[category as keyof PptSettingsState][setting.fieldKey] =
            setting.defaultValue;
        }
      });
    }
    if (category == SETTING_CATEGORY.CONTENT) {
      Object.values(CONTENT_TYPE).forEach((contentType) => {
        const categoryName = category as keyof PptSettingsState;
        initialState[categoryName][contentType] = {};
        Object.entries(settingsMeta).forEach(([key, setting]) => {
          if (setting.isHidden || setting.defaultValue === undefined) {
            return;
          }
          const groupingName = (setting.groupingName ||
            DEFAULT_GROUPING_NAME) as keyof PptSettingsState;
          if (!initialState[categoryName][contentType][groupingName]) {
            initialState[categoryName][contentType][groupingName] = {};
          }
          initialState[categoryName][contentType][groupingName][
            setting.fieldKey
          ] = setting.defaultValue;
        });
        Array.from({ length: DEFAULT_LINE_COUNT }).forEach((_, index) => {
          Object.entries(settings.contentTextbox).forEach(([key, setting]) => {
            if (setting.isHidden || setting.defaultValue === undefined) {
              return;
            }

            const groupingName = `${TEXTBOX_GROUPING_PREFIX}${index + 1}`;
            if (!initialState[categoryName][contentType][groupingName]) {
              initialState[categoryName][contentType][groupingName] = {};
            }
            initialState[categoryName][contentType][groupingName][
              setting.fieldKey
            ] = setting.defaultValue;
          });
        });
      });
    }
    // TODO: implement initial value for content
    // TODO: define for other categories
  });

  return initialState;
};
