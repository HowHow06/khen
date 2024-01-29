import { PptGenerationSettingMetaType, PptSettingsState } from "../types";

export const generatePptSettingsInitialState = (
  settings: PptGenerationSettingMetaType,
): PptSettingsState => {
  const initialState: PptSettingsState = {
    general: {},
  };

  Object.entries(settings).forEach(([category, settingsMeta]) => {
    Object.entries(settingsMeta).forEach(([key, setting]) => {
      if (setting.defaultValue !== undefined) {
        initialState[category as keyof PptSettingsState][setting.fieldSlug] =
          setting.defaultValue;
      }
    });
  });

  return initialState;
};
