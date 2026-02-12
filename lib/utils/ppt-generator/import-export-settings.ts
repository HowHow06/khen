import {
  IMPORTED_SETTING_TYPE,
  MAIN_SECTION_NAME,
  PPT_GENERATION_SETTINGS_META,
  SETTING_CATEGORY,
} from "@/lib/constant";
import { sectionSettingSchema, settingsSchema } from "@/lib/schemas";
import {
  PptSettingsStateType,
  SectionSettingsKeyType,
  SectionSettingsType,
} from "@/lib/types";
import { deepCopy } from "@/lib/utils/general";
import {
  generateSectionSettingsFromFullSettings,
  getSectionSettingsInitialValue,
} from "./settings-generator";
import { ZodError, ZodSchema } from "zod";

export const exportFullSettings = ({
  settingsValue,
  isIncludeSectionSettings,
}: {
  settingsValue: PptSettingsStateType;
  isIncludeSectionSettings: boolean;
}) => {
  const settingsCopy = deepCopy(settingsValue);
  if (!isIncludeSectionSettings && settingsCopy[SETTING_CATEGORY.SECTION]) {
    delete settingsCopy[SETTING_CATEGORY.SECTION];
  }

  // remove background image
  settingsCopy[SETTING_CATEGORY.GENERAL].mainBackgroundImage = null;

  if (isIncludeSectionSettings && settingsCopy[SETTING_CATEGORY.SECTION]) {
    const sectionSettings = {
      ...settingsCopy[SETTING_CATEGORY.SECTION],
    };

    // remove background image in sections
    Object.entries(sectionSettings).forEach(
      ([sectionKey, sectionSettingValue]) => {
        sectionSettingValue[SETTING_CATEGORY.GENERAL].sectionBackgroundImage =
          null;

        // added ! to tell typescript that the settingsCopy[SETTING_CATEGORY.SECTION] will not be undefined
        settingsCopy[SETTING_CATEGORY.SECTION]![
          sectionKey as SectionSettingsKeyType
        ] = sectionSettingValue;
      },
    );
  }

  exportObjectToJsonFile({
    obj: settingsCopy,
    document: document,
    fileName: `KhenPptGeneratorSettings_${new Date().getTime()}.json`,
  });
};

export const exportSectionSettings = ({
  settingsValue,
  targetSectionName,
}: {
  settingsValue: PptSettingsStateType;
  targetSectionName: SectionSettingsKeyType;
}) => {
  const originalTargetSectionValues = deepCopy(
    settingsValue[SETTING_CATEGORY.SECTION]?.[targetSectionName],
  );

  if (!originalTargetSectionValues) {
    return;
  }

  // remove background image in section
  originalTargetSectionValues[SETTING_CATEGORY.GENERAL].sectionBackgroundImage =
    null;

  exportObjectToJsonFile({
    obj: originalTargetSectionValues,
    document: document,
    fileName: `KhenPptGeneratorSectionSettings_${new Date().getTime()}.json`,
  });
};

const exportObjectToJsonFile = ({
  obj,
  document,
  fileName,
}: {
  obj: any;
  document: Document;
  fileName: string;
}) => {
  // Convert the settings to a JSON string
  const settingsJson = JSON.stringify(obj, null, 2); // Pretty print JSON

  // Create a Blob from the JSON string
  const blob = new Blob([settingsJson], { type: "application/json" });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element and trigger the download
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName; // Filename for the downloaded file
  document.body.appendChild(a); // Append to body to ensure it can be clicked
  a.click(); // Trigger click to download

  // Clean up by revoking the Blob URL and removing the anchor element
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Check which setting type is the given JSON
 */
export const getSettingTypeFromJSON = ({
  json,
}: {
  json: JSON;
}): IMPORTED_SETTING_TYPE | null => {
  if (getIsValidToSchema(json, settingsSchema)) {
    return IMPORTED_SETTING_TYPE.FULL_SETTING;
  }

  if (getIsValidToSchema(json, sectionSettingSchema)) {
    return IMPORTED_SETTING_TYPE.SECTION;
  }
  return null;
};

const getIsValidToSchema = (json: JSON, schema: ZodSchema): boolean => {
  try {
    schema.parse(json);
    return true;
  } catch (error) {
    if (error instanceof ZodError) {
      return false;
    }
  }
  return false;
};

const generateFullSettingsForMainApplication = ({
  newSettings,
  originalSettings,
  isPreserveUseDifferentSetting = false,
  isPreserveExistingSectionSetting = true,
}: {
  newSettings: PptSettingsStateType;
  originalSettings: PptSettingsStateType;
  isPreserveUseDifferentSetting: boolean;
  isPreserveExistingSectionSetting: boolean;
}) => {
  let settingsToUse = newSettings;
  // 1. Preserve filename
  settingsToUse[SETTING_CATEGORY.FILE].filename =
    originalSettings.file.filename;

  // 2. Preserve / Reset section settings
  if (isPreserveExistingSectionSetting) {
    // preserve section values
    settingsToUse[SETTING_CATEGORY.SECTION] = {
      ...originalSettings[SETTING_CATEGORY.SECTION],
    };
  }

  if (
    !isPreserveExistingSectionSetting &&
    originalSettings[SETTING_CATEGORY.SECTION] !== undefined
  ) {
    // reset section values if section settings exist
    const sectionInitialValue = getSectionSettingsInitialValue({
      settings: PPT_GENERATION_SETTINGS_META,
    });
    const sectionSettings = originalSettings[SETTING_CATEGORY.SECTION] as {
      [key in SectionSettingsKeyType]: SectionSettingsType;
    };

    Object.entries(sectionSettings).forEach(([key, value]) => {
      settingsToUse[SETTING_CATEGORY.SECTION] = {
        ...settingsToUse[SETTING_CATEGORY.SECTION],
        [key]: sectionInitialValue,
      };
    });
  }

  // 3. Preserve use different setting
  if (isPreserveUseDifferentSetting) {
    settingsToUse[SETTING_CATEGORY.GENERAL].useDifferentSettingForEachSection =
      originalSettings.general.useDifferentSettingForEachSection;
  }

  return settingsToUse;
};

const generateFullSettingsForSectionApplication = ({
  newSettings,
  originalSettings,
  targetSectionName,
}: {
  newSettings: PptSettingsStateType;
  originalSettings: PptSettingsStateType;
  targetSectionName: SectionSettingsKeyType;
}) => {
  const sectionSettings = generateSectionSettingsFromFullSettings(newSettings);

  const outputSettings = originalSettings;
  outputSettings[SETTING_CATEGORY.SECTION] = {
    ...originalSettings[SETTING_CATEGORY.SECTION],
    [targetSectionName as SectionSettingsKeyType]: sectionSettings,
  };

  return outputSettings;
};

/**
 * Generate a new full settings (include both main and section) for import feature
 */
export const generateFullSettings = ({
  newSettings,
  originalSettings,
  isApplyToSection = false,
  isPreserveUseDifferentSetting = false,
  isPreserveExistingSectionSetting = true,
  targetSectionName,
}: {
  newSettings: PptSettingsStateType;
  originalSettings: PptSettingsStateType;
  isApplyToSection: boolean;
  isPreserveUseDifferentSetting: boolean;
  isPreserveExistingSectionSetting: boolean;
  targetSectionName: string;
}): PptSettingsStateType => {
  const originalSettingsCopy = deepCopy(originalSettings);
  if (isApplyToSection && targetSectionName !== MAIN_SECTION_NAME) {
    const resultSettings = generateFullSettingsForSectionApplication({
      newSettings,
      originalSettings: originalSettingsCopy,
      targetSectionName: targetSectionName as SectionSettingsKeyType,
    });
    return resultSettings;
  }

  const settingsToUse = generateFullSettingsForMainApplication({
    newSettings,
    originalSettings: originalSettingsCopy,
    isPreserveExistingSectionSetting,
    isPreserveUseDifferentSetting,
  });

  return settingsToUse;
};
