import { SETTING_CATEGORY } from "../constant";
import { PptGenerationSettingMetaType, PptSettingsState } from "../types";

export const generatePptSettingsInitialState = (
  settings: PptGenerationSettingMetaType,
): PptSettingsState => {
  const initialState: PptSettingsState = {
    [SETTING_CATEGORY.GENERAL]: {},
  };

  Object.entries(settings).forEach(([category, settingsMeta]) => {
    if (category == SETTING_CATEGORY.GENERAL) {
      Object.entries(settingsMeta).forEach(([key, setting]) => {
        if (setting.defaultValue !== undefined) {
          initialState[category as keyof PptSettingsState][key] =
            setting.defaultValue;
        }
      });
    }
    // TODO: define for other categories
  });

  return initialState;
};
