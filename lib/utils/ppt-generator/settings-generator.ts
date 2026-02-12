import {
  CONTENT_TYPE,
  DEFAULT_GROUPING_NAME,
  DEFAULT_TEXTBOX_COUNT_PER_SLIDE,
  PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS,
  PPT_GENERATION_SETTINGS_META,
  PPT_GENERATION_SHARED_GENERAL_SETTINGS,
  SETTING_CATEGORY,
  TEXTBOX_GROUPING_PREFIX,
} from "@/lib/constant";
import { pptPresets } from "@/lib/presets";
import {
  BaseSettingMetaType,
  ContentTextboxSettingsType,
  PptGenerationSettingMetaType,
  PptSettingsStateType,
  SectionSettingsType,
  SettingsValueType,
} from "@/lib/types";
import { deepMerge } from "@/lib/utils/general";

/**
 * Get default values based on given settings meta (except)
 * hasGrouping: whether the fields are grouped, like how Bold, Font Color, Font Face are grouped under 'Text'
 */
const getInitialValuesFromSettings = <T = { [key in string]: any }>({
  settingsMeta,
  hasGrouping = false,
}: {
  settingsMeta: BaseSettingMetaType;
  hasGrouping?: boolean;
}): T => {
  let resultValues: any = {};
  Object.entries(settingsMeta).forEach(([key, setting]) => {
    if (setting.isNotAvailable || setting.defaultValue === undefined) {
      return;
    }

    if (hasGrouping) {
      const grouping = setting.groupingName || DEFAULT_GROUPING_NAME;
      if (resultValues[grouping] === undefined) {
        resultValues[grouping] = {};
      }
      resultValues[grouping][key] = setting.defaultValue;
      return;
    }

    resultValues[key] = setting.defaultValue;

    return;
  });

  return resultValues;
};

/**
 * Get an array of textbox default values based on given textbox settings meta
 */
const getTextboxSettingsInitialValues = ({
  textboxSettingsMeta,
  textboxCount = DEFAULT_TEXTBOX_COUNT_PER_SLIDE,
}: {
  textboxSettingsMeta: BaseSettingMetaType;
  textboxCount: number;
}): ContentTextboxSettingsType => {
  const textBoxInitialState: ContentTextboxSettingsType = {};
  Array.from({ length: textboxCount }).forEach((_, index) => {
    textBoxInitialState[`${TEXTBOX_GROUPING_PREFIX}${index + 1}`] =
      getInitialValuesFromSettings({
        settingsMeta: textboxSettingsMeta,
      });
  });
  return textBoxInitialState;
};

/**
 * Generate initial ppt settings state
 */
export const generatePptSettingsInitialState = (
  settings: PptGenerationSettingMetaType,
  textboxCount: number = DEFAULT_TEXTBOX_COUNT_PER_SLIDE,
): PptSettingsStateType => {
  const initialState: PptSettingsStateType = {
    [SETTING_CATEGORY.GENERAL]: {},
    [SETTING_CATEGORY.FILE]: {},
    [SETTING_CATEGORY.CONTENT]: {
      [CONTENT_TYPE.MAIN]: {
        textbox: {},
      },
      [CONTENT_TYPE.SECONDARY]: {
        textbox: {},
      },
    },
    [SETTING_CATEGORY.COVER]: {
      [CONTENT_TYPE.MAIN]: {},
      [CONTENT_TYPE.SECONDARY]: {},
    },
  };

  Object.entries(settings).forEach(([category, settingsMeta]) => {
    switch (category) {
      case SETTING_CATEGORY.GENERAL:
      case SETTING_CATEGORY.FILE:
        initialState[category] = getInitialValuesFromSettings({
          settingsMeta,
        });
        break;
      case SETTING_CATEGORY.COVER:
        Object.values(CONTENT_TYPE).forEach((contentType) => {
          initialState[category][contentType] = getInitialValuesFromSettings({
            settingsMeta,
          });
        });
        break;
      case SETTING_CATEGORY.CONTENT:
        Object.values(CONTENT_TYPE).forEach((contentType) => {
          initialState[category][contentType] = {
            ...getInitialValuesFromSettings({
              settingsMeta,
              hasGrouping: true,
            }),
            textbox: getTextboxSettingsInitialValues({
              textboxSettingsMeta: settings.contentTextbox,
              textboxCount,
            }),
          };
        });
        break;
    }
  });

  return initialState;
};

/**
 * Generate initial settings for SECTION
 */
export const getSectionSettingsInitialValue = ({
  settings,
  textboxCount = DEFAULT_TEXTBOX_COUNT_PER_SLIDE,
}: {
  settings: PptGenerationSettingMetaType;
  textboxCount?: number;
}) => {
  const sectionInitialState: SectionSettingsType = {
    [SETTING_CATEGORY.GENERAL]: {},
    [SETTING_CATEGORY.COVER]: {
      [CONTENT_TYPE.MAIN]: {},
      [CONTENT_TYPE.SECONDARY]: {},
    },
    [SETTING_CATEGORY.CONTENT]: {
      [CONTENT_TYPE.MAIN]: {
        textbox: {},
      },
      [CONTENT_TYPE.SECONDARY]: {
        textbox: {},
      },
    },
  };
  const sectionGeneralSettings = settings.section;
  const coverSettings = settings.cover;
  const contentSettings = settings.content;
  const contentBoxSettings = settings.contentTextbox;

  sectionInitialState[SETTING_CATEGORY.GENERAL] = getInitialValuesFromSettings({
    settingsMeta: sectionGeneralSettings,
  });

  Object.values(CONTENT_TYPE).forEach((contentType) => {
    sectionInitialState[SETTING_CATEGORY.COVER][contentType] =
      getInitialValuesFromSettings({
        settingsMeta: coverSettings,
      });
    sectionInitialState[SETTING_CATEGORY.CONTENT][contentType] = {
      ...getInitialValuesFromSettings({
        settingsMeta: contentSettings,
        hasGrouping: true,
      }),
      textbox: getTextboxSettingsInitialValues({
        textboxSettingsMeta: contentBoxSettings,
        textboxCount,
      }),
    };
  });

  return sectionInitialState;
};

/**
 * Combine the given settings with default ppt settings
 */
export const combineWithDefaultSettings = (
  settingsValue: PptSettingsStateType,
): PptSettingsStateType => {
  const defaultInitialState = generatePptSettingsInitialState(
    PPT_GENERATION_SETTINGS_META,
  );
  const result = deepMerge(
    defaultInitialState,
    settingsValue,
  ) as PptSettingsStateType;
  return result;
};

/**
 * Generate default value for textbox settings
 */
export function getInitialTextboxSettings(): SettingsValueType<
  typeof PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS
> {
  const result = getInitialValuesFromSettings({
    settingsMeta: PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS,
  });
  return result;
}

/**
 * Generate section settings from full settings values
 */
export const generateSectionSettingsFromFullSettings = (
  settings: PptSettingsStateType,
): SectionSettingsType => {
  const presetGeneralSetting = settings[SETTING_CATEGORY.GENERAL];
  const sectionValues: SectionSettingsType = {
    [SETTING_CATEGORY.GENERAL]: {
      useMainSectionSettings: false,
      useMainBackgroundImage: false,
      sectionBackgroundImage: presetGeneralSetting.mainBackgroundImage,
      useMainBackgroundColor: false,
      sectionBackgroundColor: presetGeneralSetting.mainBackgroundColor,
    },
    [SETTING_CATEGORY.COVER]: settings.cover,
    [SETTING_CATEGORY.CONTENT]: settings.content,
  };

  Object.entries(PPT_GENERATION_SHARED_GENERAL_SETTINGS).forEach(
    ([settingKey, meta]) => {
      const key = settingKey as keyof SettingsValueType<
        typeof PPT_GENERATION_SHARED_GENERAL_SETTINGS
      >;
      const originalSetting = presetGeneralSetting[key];
      sectionValues.general = {
        ...sectionValues.general,
        [key]: originalSetting,
      };
    },
  );

  return sectionValues;
};

export const getPreset = (
  presetName: string,
): PptSettingsStateType | undefined => {
  if (presetName in pptPresets) {
    return pptPresets[presetName];
  }
  return undefined;
};
