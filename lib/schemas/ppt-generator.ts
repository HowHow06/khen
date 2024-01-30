import { z } from "zod";
import { PPT_GENERATION_SETTINGS_META, SETTING_CATEGORY } from "../constant";
import {
  BaseSettingItemMetaType,
  PptGenerationSettingMetaType,
} from "../types";

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

const generateSettingZodSchema = (metaData: PptGenerationSettingMetaType) => {
  let schemaObject: any = {};

  Object.entries(metaData).forEach(([category, settings]) => {
    if (category == SETTING_CATEGORY.GENERAL) {
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

export const settingsSchema = generateSettingZodSchema(
  PPT_GENERATION_SETTINGS_META,
);
