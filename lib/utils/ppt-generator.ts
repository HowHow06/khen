import { CONTENT_TYPE, SETTING_CATEGORY } from "../constant";
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
        if (setting.defaultValue !== undefined) {
          initialState[category as keyof PptSettingsState][setting.fieldKey] =
            setting.defaultValue;
        }
      });
    }
    if (category == SETTING_CATEGORY.CONTENT) {
      Object.values(CONTENT_TYPE).forEach((contentType) => {
        initialState[category as keyof PptSettingsState][contentType] = {};
        Object.entries(settingsMeta).forEach(([key, setting]) => {
          if (setting.defaultValue !== undefined) {
            initialState[category as keyof PptSettingsState][contentType][
              setting.fieldKey
            ] = setting.defaultValue;
          }
        });
      });
    }
    // TODO: implement initial value for content
    // TODO: define for other categories
  });

  return initialState;
};
