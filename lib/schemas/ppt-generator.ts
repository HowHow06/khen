import { ZodSchema, z } from "zod";
import {
  DEFAULT_GROUPING_NAME,
  HORIZONTAL_ALIGNMENT,
  PPT_GENERATION_SETTINGS_META,
  SETTING_CATEGORY,
  SHADOW_TYPE,
  TEXTBOX_SETTING_KEY,
} from "../constant";
import {
  BaseSettingItemMetaType,
  BaseSettingMetaType,
  HorizontalAlignSettingType,
  PptGenerationSettingMetaType,
  ShadowTypeSettingType,
} from "../types";

const fileTypeValidator = (file: File, validTypes: string[]) => {
  return validTypes.includes(file.type);
};

const createZodSchemaFromSettingItem = (setting: BaseSettingItemMetaType) => {
  const baseZodSchemaFactory = (setting: BaseSettingItemMetaType) => {
    switch (setting.fieldType) {
      case "text":
        return z.string().default(setting.defaultValue);
      case "boolean":
        return z.boolean().default(setting.defaultValue);
      case "number":
        let baseSchema = z.number();
        if (setting.rangeMin) {
          baseSchema = baseSchema.gte(setting.rangeMin, {
            message: `The minimum value is ${setting.rangeMin}.`,
          });
        }
        if (setting.rangeMax) {
          baseSchema = baseSchema.lte(setting.rangeMax, {
            message: `The maximum value is ${setting.rangeMax}.`,
          });
        }
        return baseSchema.default(setting.defaultValue);
      case "image":
        return z
          .union([
            z.custom<File>(
              (file) => {
                if (!(file instanceof File)) {
                  return false;
                }
                const validTypes = ["image/jpeg", "image/png"];
                return fileTypeValidator(file, validTypes);
              },
              {
                message: "Invalid image file",
              },
            ),
            z.string().regex(/\.(jpeg|jpg|png)$/, {
              // message: "Invalid image path, must end with .png, .jpg, or .jpeg",
              message: "Invalid image path.",
            }),
          ])
          .nullable();
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

      default:
        return z.string();
    }
  };

  const baseZodSchema = baseZodSchemaFactory(setting);

  if (setting.isOptional) {
    return baseZodSchema.optional();
  }

  return baseZodSchema;
};

const generateZodSchemaObjectFromSettings = ({
  settings,
  hasGrouping = false,
}: {
  settings: BaseSettingMetaType;
  hasGrouping?: boolean;
}): Record<string, ZodSchema> => {
  const outputSchemaObject: Record<string, ZodSchema> = {};
  const groupedSchemaObject: Record<string, Record<string, ZodSchema>> = {};
  Object.entries(settings).forEach(([key, setting]) => {
    if (setting.isNotAvailable) {
      return;
    }
    const schema = createZodSchemaFromSettingItem(setting);

    if (!hasGrouping) {
      outputSchemaObject[key] = schema;
      return;
    }

    const groupingName = setting.groupingName || DEFAULT_GROUPING_NAME;
    groupedSchemaObject[groupingName] = {
      ...groupedSchemaObject[groupingName],
      [key]: schema,
    };
    return;
  });

  if (!hasGrouping) {
    return outputSchemaObject;
  }

  return Object.entries(groupedSchemaObject).reduce(
    (acc, [groupingName, fields]) => {
      acc[groupingName] = z.object(fields);
      return acc;
    },
    {} as { [groupingName: string]: any },
  );
};

export const generatSectionSettingZodSchema = (
  settingsMeta: PptGenerationSettingMetaType,
) => {
  const sectionSchema: { [key in string]: any } = {};
  // General section schema-------------------
  const generalSchema = generateZodSchemaObjectFromSettings({
    settings: settingsMeta.section,
  });
  sectionSchema[SETTING_CATEGORY.GENERAL] = z.object(generalSchema);

  // Cover section schema--------------------
  const coverSchema = generateZodSchemaObjectFromSettings({
    settings: settingsMeta.cover,
  });
  sectionSchema[SETTING_CATEGORY.COVER] = z.record(z.object(coverSchema));

  // Content section schema-------------------
  const contentSchema = generateZodSchemaObjectFromSettings({
    settings: settingsMeta.content,
    hasGrouping: true,
  });
  const textBoxSchema = generateZodSchemaObjectFromSettings({
    settings: settingsMeta.contentTextbox,
  });

  contentSchema[TEXTBOX_SETTING_KEY] = z.record(z.object(textBoxSchema));
  sectionSchema[SETTING_CATEGORY.CONTENT] = z.record(z.object(contentSchema));

  return z.object(sectionSchema);
};

export const sectionSettingSchema = generatSectionSettingZodSchema(
  PPT_GENERATION_SETTINGS_META,
);

const generateSettingZodSchema = (metaData: PptGenerationSettingMetaType) => {
  let schemaObject: any = {};

  Object.entries(metaData).forEach(([category, settings]) => {
    if (
      category === SETTING_CATEGORY.GENERAL ||
      category === SETTING_CATEGORY.FILE
    ) {
      const schema = generateZodSchemaObjectFromSettings({ settings });
      schemaObject[category] = z.object(schema);
    }

    if (category === SETTING_CATEGORY.CONTENT) {
      const contentSchema = generateZodSchemaObjectFromSettings({
        settings,
        hasGrouping: true,
      });
      const textBoxSchema = generateZodSchemaObjectFromSettings({
        settings: metaData.contentTextbox,
      });
      contentSchema[TEXTBOX_SETTING_KEY] = z.record(z.object(textBoxSchema));
      schemaObject[category] = z.record(z.object(contentSchema));
    }

    if (category === SETTING_CATEGORY.COVER) {
      const coverSchema = generateZodSchemaObjectFromSettings({
        settings,
      });
      schemaObject[category] = z.record(z.object(coverSchema));
    }

    if (category === SETTING_CATEGORY.SECTION) {
      schemaObject[category] = z.record(sectionSettingSchema).optional();
    }
  });
  return z.object(schemaObject);
};

export const settingsSchema = generateSettingZodSchema(
  PPT_GENERATION_SETTINGS_META,
);
