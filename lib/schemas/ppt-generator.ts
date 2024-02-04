import { z } from "zod";
import {
  DEFAULT_GROUPING_NAME,
  DEFAULT_LINE_COUNT,
  HORIZONTAL_ALIGNMENT,
  PPT_GENERATION_SETTINGS_META,
  SETTING_CATEGORY,
  SHADOW_TYPE,
  TEXTBOX_GROUPING_PREFIX,
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
  const getBaseZodSchema = (setting: BaseSettingItemMetaType) => {
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

  const baseZodSchema = getBaseZodSchema(setting);

  if (setting.isOptional) {
    return baseZodSchema.optional();
  }

  return baseZodSchema;
};

// TODO: refactor this function
const generateSettingZodSchema = (metaData: PptGenerationSettingMetaType) => {
  let schemaObject: any = {};

  Object.entries(metaData).forEach(([category, settings]) => {
    if (
      category == SETTING_CATEGORY.GENERAL ||
      category == SETTING_CATEGORY.FILE
    ) {
      let categorySchema: any = {};
      Object.entries(settings).forEach(([key, setting]) => {
        if (setting.isHidden) {
          return;
        }
        categorySchema[setting.fieldKey] =
          createZodSchemaFromSettingItem(setting);
      });
      schemaObject[category] = z.object(categorySchema);
    }
    if (category == SETTING_CATEGORY.CONTENT) {
      let contentSchema: { [groupingName: string]: any } = {};
      Object.entries(settings).forEach(([key, setting]) => {
        if (setting.isHidden) {
          return;
        }

        const settingSchema = createZodSchemaFromSettingItem(setting);
        const groupingName = setting.groupingName || DEFAULT_GROUPING_NAME;

        if (!contentSchema[groupingName]) {
          contentSchema[groupingName] = {};
        }

        contentSchema[groupingName][setting.fieldKey] = settingSchema;
      });

      Array.from({ length: DEFAULT_LINE_COUNT }).forEach((_, index) => {
        Object.entries(metaData.contentTextbox).forEach(([key, setting]) => {
          if (setting.isHidden) {
            return;
          }

          const settingSchema = createZodSchemaFromSettingItem(setting);
          const groupingName = `${TEXTBOX_GROUPING_PREFIX}${index + 1}`;

          if (!contentSchema[groupingName]) {
            contentSchema[groupingName] = {};
          }

          contentSchema[groupingName][setting.fieldKey] = settingSchema;
        });
      });

      // Convert each groupingName object into a z.object and wrap the whole thing in z.record
      const contentZodSchema = Object.entries(contentSchema).reduce(
        (acc, [groupingName, fields]) => {
          acc[groupingName] = z.object(fields);
          return acc;
        },
        {} as { [groupingName: string]: any },
      );

      schemaObject[category] = z.record(z.object(contentZodSchema));
    }

    if (category == SETTING_CATEGORY.COVER) {
      const contentSchema: { [groupingName: string]: any } = {};
      Object.entries(settings).forEach(([key, setting]) => {
        if (setting.isHidden) {
          return;
        }

        const settingSchema = createZodSchemaFromSettingItem(setting);

        contentSchema[setting.fieldKey] = settingSchema;
      });

      schemaObject[category] = z.record(z.object(contentSchema));
    }
    // TODO: define for other categories
  });
  return z.object(schemaObject);
};

export const settingsSchema = generateSettingZodSchema(
  PPT_GENERATION_SETTINGS_META,
);
