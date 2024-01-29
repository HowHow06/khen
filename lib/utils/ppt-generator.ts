import { z } from "zod";
import {
  BaseSettingItemMetaType,
  PptGenerationSettingMetaType,
  PptSettingsState,
} from "../types";

export const generatePptSettingsInitialState = (
  settings: PptGenerationSettingMetaType,
): PptSettingsState => {
  const initialState: PptSettingsState = {
    general: {},
  };

  Object.entries(settings).forEach(([category, settingsMeta]) => {
    if (category == "general") {
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

const fileTypeValidator = (file: File, validTypes: string[]) => {
  return validTypes.includes(file.type);
};

const createZodSchemaFromSettingItem = (setting: BaseSettingItemMetaType) => {
  switch (setting.fieldType) {
    case "boolean":
      return z.boolean().default(setting.defaultValue ?? false);
    case "number":
      return z.number().default(setting.defaultValue ?? 0);
    case "image":
      return z.custom<File>(
        (file) => {
          if (!(file instanceof File)) {
            return false;
          }
          const validTypes = ["image/jpeg", "image/png"];
          return fileTypeValidator(file, validTypes);
        },
        {
          message: "Invalid image", // Custom error message
        },
      );
    // TODO: Add cases for other field types
    default:
      return z.string();
  }
};

export const generateSettingZodSchema = (
  metaData: PptGenerationSettingMetaType,
) => {
  let schemaObject: any = {};

  Object.entries(metaData).forEach(([category, settings]) => {
    if (category == "general") {
      let categorySchema: any = {};
      Object.entries(settings).forEach(([key, setting]) => {
        categorySchema[key] = createZodSchemaFromSettingItem(setting);
      });
      schemaObject[category] = z.object(categorySchema);
    }
    // TODO: define for other categories
  });
  return z.object(schemaObject);
};
