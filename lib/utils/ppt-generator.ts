import { SETTING_CATEGORY } from "../constant";
import { PptGenerationSettingMetaType, PptSettingsState } from "../types";

export const generatePptSettingsInitialState = (
  settings: PptGenerationSettingMetaType,
): PptSettingsState => {
  const initialState: PptSettingsState = {
    [SETTING_CATEGORY.GENERAL]: {},
    [SETTING_CATEGORY.CONTENT]: {},
  };

  Object.entries(settings).forEach(([category, settingsMeta]) => {
    if (
      category == SETTING_CATEGORY.GENERAL ||
      category == SETTING_CATEGORY.CONTENT
    ) {
      Object.entries(settingsMeta).forEach(([key, setting]) => {
        if (setting.defaultValue !== undefined) {
          initialState[category as keyof PptSettingsState][setting.fieldKey] =
            setting.defaultValue;
        }
      });
    }
    // TODO: define for other categories
  });

  return initialState;
};
