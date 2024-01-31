import { z } from "zod";
import {
  HORIZONTAL_ALIGNMENT,
  PPT_GENERATION_SETTINGS_META,
  SETTING_CATEGORY,
  SHADOW_TYPE,
} from "../constant";
import {
  BaseSettingItemMetaType,
  HorizontalAlignSettingType,
  PptGenerationSettingMetaType,
  ShadowTypeSettingType,
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
          message: "Invalid image",
        },
      );
    case "color":
      return z
        .string()
        .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{4}){1,2}$/, {
          message: "Invalid hex color",
        });
    case "font":
      return z.string();
    case "horizontal-align":
      return z.custom<string>(
        (value) => {
          return Object.values(HORIZONTAL_ALIGNMENT).includes(
            value as HorizontalAlignSettingType,
          );
        },
        {
          message: "Invalid horizontal alignment",
        },
      );
    case "shadow-type":
      return z.custom<string>(
        (value) => {
          return Object.values(SHADOW_TYPE).includes(
            value as ShadowTypeSettingType,
          );
        },
        {
          message: "Invalid shadow type",
        },
      );
    case "percentage":
      if (setting.useProportionForm) {
        return z
          .number()
          .min(0.0, { message: "Must be at least 0.0" })
          .max(1.0, { message: "Must not exceed 1.0" });
      }
      return z
        .number()
        .min(0, "Percentage must be at least 0")
        .max(100, "Percentage must not exceed 100");

    // TODO: Add cases for other field types
    default:
      return z.string();
  }
};

const generateSettingZodSchema = (metaData: PptGenerationSettingMetaType) => {
  let schemaObject: any = {};

  Object.entries(metaData).forEach(([category, settings]) => {
    if (
      category == SETTING_CATEGORY.GENERAL ||
      category == SETTING_CATEGORY.CONTENT
    ) {
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
