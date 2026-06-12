import {
  CONTENT_TYPE,
  HORIZONTAL_ALIGNMENT,
  PPT_GENERATION_COMBINED_GENERAL_SETTINGS,
  PPT_GENERATION_COMBINED_SECTION_SETTINGS,
  PPT_GENERATION_CONTENT_SETTINGS,
  PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS,
  PPT_GENERATION_COVER_SETTINGS,
  PPT_GENERATION_FILE_SETTINGS,
  SECTION_PREFIX,
  SETTING_CATEGORY,
  SETTING_FIELD_TYPE,
  SHADOW_TYPE,
} from "../../lib/constant/ppt-generator";

type SettingMeta = Record<string, any>;
type Warning = Record<string, any>;

const overwriteJsonLineRegex = /^\s*\{.*\}\s*$/;
const sectionKeyRegex = new RegExp(`^${SECTION_PREFIX}\\d+$`);
const textboxKeyRegex = /^textbox\d+$/;
const presetIds = [
  "onsiteChinesePreset",
  "onsiteEnglishPreset",
  "liveChinesePreset",
  "liveEnglishPreset",
];
const contentTypes = Object.values(CONTENT_TYPE);

type InlineOverrideLocation = {
  scope: "global" | "section" | "unrecognized";
  lineNumber: number;
  sectionIndex?: number;
};

function isSectionHeader(line: string): boolean {
  return line.trim().startsWith("----");
}

function isJsonLikeLine(line: string): boolean {
  return line.trim().startsWith("{") || line.trim().endsWith("}");
}

function isOverwriteJsonLine(line: string): boolean {
  return overwriteJsonLineRegex.test(line);
}

function warning(args: {
  code: string;
  message: string;
  lineNumber: number;
  path?: string;
  expected?: unknown;
  actual?: unknown;
  scope?: string;
}): Warning {
  return {
    type: "warning",
    ...args,
  };
}

function describeValue(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function validatePlainObject(
  value: unknown,
  location: InlineOverrideLocation,
  path: string,
): value is Record<string, any> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateFieldValue({
  value,
  setting,
  path,
  location,
}: {
  value: unknown;
  setting: any;
  path: string;
  location: InlineOverrideLocation;
}): Warning[] {
  const warnings: Warning[] = [];
  const base = {
    lineNumber: location.lineNumber,
    path,
    scope: location.scope,
  };

  const pushTypeWarning = (expected: string) => {
    warnings.push(
      warning({
        ...base,
        code: "INLINE_OVERRIDE_VALUE_INVALID",
        message: `Inline override "${path}" should be ${expected}, but got ${describeValue(value)}.`,
        expected,
        actual: value,
      }),
    );
  };

  switch (setting.fieldType) {
    case SETTING_FIELD_TYPE.TEXT:
    case SETTING_FIELD_TYPE.FONT:
    case SETTING_FIELD_TYPE.TRANSITION:
      if (typeof value !== "string") {
        pushTypeWarning("a string");
      }
      break;
    case SETTING_FIELD_TYPE.BOOLEAN:
      if (typeof value !== "boolean") {
        pushTypeWarning("a boolean");
      }
      break;
    case SETTING_FIELD_TYPE.NUMBER:
    case SETTING_FIELD_TYPE.PERCENTAGE:
      if (typeof value !== "number" || Number.isNaN(value)) {
        pushTypeWarning("a number");
        break;
      }

      if (setting.rangeMin !== undefined && value < setting.rangeMin) {
        warnings.push(
          warning({
            ...base,
            code: "INLINE_OVERRIDE_VALUE_INVALID",
            message: `Inline override "${path}" should be at least ${setting.rangeMin}.`,
            expected: `>= ${setting.rangeMin}`,
            actual: value,
          }),
        );
      }
      if (setting.rangeMax !== undefined && value > setting.rangeMax) {
        warnings.push(
          warning({
            ...base,
            code: "INLINE_OVERRIDE_VALUE_INVALID",
            message: `Inline override "${path}" should be at most ${setting.rangeMax}.`,
            expected: `<= ${setting.rangeMax}`,
            actual: value,
          }),
        );
      }
      if (
        setting.fieldType === SETTING_FIELD_TYPE.PERCENTAGE &&
        setting.rangeMin === undefined &&
        setting.rangeMax === undefined
      ) {
        const min = 0;
        const max = setting.useProportionForm ? 1 : 100;
        if (value < min || value > max) {
          warnings.push(
            warning({
              ...base,
              code: "INLINE_OVERRIDE_VALUE_INVALID",
              message: `Inline override "${path}" should be between ${min} and ${max}.`,
              expected: `${min}..${max}`,
              actual: value,
            }),
          );
        }
      }
      break;
    case SETTING_FIELD_TYPE.IMAGE:
      if (value !== null && typeof value !== "string") {
        pushTypeWarning("a string path/data URL or null");
      }
      break;
    case SETTING_FIELD_TYPE.COLOR:
      if (
        typeof value !== "string" ||
        !/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{4}){1,2}$/.test(value)
      ) {
        warnings.push(
          warning({
            ...base,
            code: "INLINE_OVERRIDE_VALUE_INVALID",
            message: `Inline override "${path}" should be a hex color such as "#FFFFFF".`,
            expected: "hex color string",
            actual: value,
          }),
        );
      }
      break;
    case SETTING_FIELD_TYPE.HORIZONTAL_ALIGN:
      if (!Object.values(HORIZONTAL_ALIGNMENT).includes(value as any)) {
        warnings.push(
          warning({
            ...base,
            code: "INLINE_OVERRIDE_VALUE_INVALID",
            message: `Inline override "${path}" should be one of: ${Object.values(HORIZONTAL_ALIGNMENT).join(", ")}.`,
            expected: Object.values(HORIZONTAL_ALIGNMENT),
            actual: value,
          }),
        );
      }
      break;
    case SETTING_FIELD_TYPE.SHADOW_TYPE:
      if (!Object.values(SHADOW_TYPE).includes(value as any)) {
        warnings.push(
          warning({
            ...base,
            code: "INLINE_OVERRIDE_VALUE_INVALID",
            message: `Inline override "${path}" should be one of: ${Object.values(SHADOW_TYPE).join(", ")}.`,
            expected: Object.values(SHADOW_TYPE),
            actual: value,
          }),
        );
      }
      break;
  }

  if (path.endsWith(".presetChosen") && typeof value === "string") {
    if (!presetIds.includes(value)) {
      warnings.push(
        warning({
          ...base,
          code: "INLINE_OVERRIDE_PRESET_INVALID",
          message: `Inline override "${path}" should use an internal preset id, not a display name or alias.`,
          expected: presetIds,
          actual: value,
        }),
      );
    }
  }

  return warnings;
}

function validateFields({
  value,
  meta,
  path,
  location,
}: {
  value: unknown;
  meta: SettingMeta;
  path: string;
  location: InlineOverrideLocation;
}): Warning[] {
  if (!validatePlainObject(value, location, path)) {
    return [
      warning({
        code: "INLINE_OVERRIDE_VALUE_INVALID",
        message: `Inline override "${path}" should be an object.`,
        lineNumber: location.lineNumber,
        path,
        expected: "object",
        actual: describeValue(value),
        scope: location.scope,
      }),
    ];
  }

  return Object.entries(value).flatMap(([key, fieldValue]) => {
    const setting = meta[key];
    const fieldPath = `${path}.${key}`;

    if (!setting || setting.isNotAvailable) {
      return [
        warning({
          code: "INLINE_OVERRIDE_KEY_UNKNOWN",
          message: `Inline override key "${fieldPath}" is not a known setting.`,
          lineNumber: location.lineNumber,
          path: fieldPath,
          scope: location.scope,
        }),
      ];
    }

    return validateFieldValue({
      value: fieldValue,
      setting,
      path: fieldPath,
      location,
    });
  });
}

function validateCover(
  value: unknown,
  location: InlineOverrideLocation,
): Warning[] {
  if (!validatePlainObject(value, location, "cover")) {
    return [
      warning({
        code: "INLINE_OVERRIDE_VALUE_INVALID",
        message: 'Inline override "cover" should be an object.',
        lineNumber: location.lineNumber,
        path: "cover",
        expected: "object",
        actual: describeValue(value),
        scope: location.scope,
      }),
    ];
  }

  return Object.entries(value).flatMap(([contentType, contentValue]) => {
    if (!contentTypes.includes(contentType as CONTENT_TYPE)) {
      return [
        warning({
          code: "INLINE_OVERRIDE_KEY_UNKNOWN",
          message: `Inline override key "cover.${contentType}" should be one of: ${contentTypes.join(", ")}.`,
          lineNumber: location.lineNumber,
          path: `cover.${contentType}`,
          expected: contentTypes,
          scope: location.scope,
        }),
      ];
    }

    return validateFields({
      value: contentValue,
      meta: PPT_GENERATION_COVER_SETTINGS,
      path: `cover.${contentType}`,
      location,
    });
  });
}

function validateContent(
  value: unknown,
  location: InlineOverrideLocation,
): Warning[] {
  if (!validatePlainObject(value, location, "content")) {
    return [
      warning({
        code: "INLINE_OVERRIDE_VALUE_INVALID",
        message: 'Inline override "content" should be an object.',
        lineNumber: location.lineNumber,
        path: "content",
        expected: "object",
        actual: describeValue(value),
        scope: location.scope,
      }),
    ];
  }

  return Object.entries(value).flatMap(([contentType, contentValue]) => {
    if (!contentTypes.includes(contentType as CONTENT_TYPE)) {
      return [
        warning({
          code: "INLINE_OVERRIDE_KEY_UNKNOWN",
          message: `Inline override key "content.${contentType}" should be one of: ${contentTypes.join(", ")}.`,
          lineNumber: location.lineNumber,
          path: `content.${contentType}`,
          expected: contentTypes,
          scope: location.scope,
        }),
      ];
    }

    if (
      !validatePlainObject(contentValue, location, `content.${contentType}`)
    ) {
      return [
        warning({
          code: "INLINE_OVERRIDE_VALUE_INVALID",
          message: `Inline override "content.${contentType}" should be an object.`,
          lineNumber: location.lineNumber,
          path: `content.${contentType}`,
          expected: "object",
          actual: describeValue(contentValue),
          scope: location.scope,
        }),
      ];
    }

    return Object.entries(contentValue).flatMap(([groupName, groupValue]) => {
      if (groupName === "textbox") {
        if (
          !validatePlainObject(
            groupValue,
            location,
            `content.${contentType}.textbox`,
          )
        ) {
          return [
            warning({
              code: "INLINE_OVERRIDE_VALUE_INVALID",
              message: `Inline override "content.${contentType}.textbox" should be an object.`,
              lineNumber: location.lineNumber,
              path: `content.${contentType}.textbox`,
              expected: "object",
              actual: describeValue(groupValue),
              scope: location.scope,
            }),
          ];
        }

        return Object.entries(groupValue).flatMap(
          ([textboxKey, textboxValue]) => {
            if (!textboxKeyRegex.test(textboxKey)) {
              return [
                warning({
                  code: "INLINE_OVERRIDE_KEY_UNKNOWN",
                  message: `Inline override key "content.${contentType}.textbox.${textboxKey}" should look like "textbox1".`,
                  lineNumber: location.lineNumber,
                  path: `content.${contentType}.textbox.${textboxKey}`,
                  expected: "textbox<number>",
                  scope: location.scope,
                }),
              ];
            }

            return validateFields({
              value: textboxValue,
              meta: PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS,
              path: `content.${contentType}.textbox.${textboxKey}`,
              location,
            });
          },
        );
      }

      const groupedSettings = Object.entries(
        PPT_GENERATION_CONTENT_SETTINGS,
      ).filter(([, setting]) => setting.groupingName === groupName);
      if (groupedSettings.length === 0) {
        return [
          warning({
            code: "INLINE_OVERRIDE_KEY_UNKNOWN",
            message: `Inline override key "content.${contentType}.${groupName}" is not a known content settings group.`,
            lineNumber: location.lineNumber,
            path: `content.${contentType}.${groupName}`,
            scope: location.scope,
          }),
        ];
      }

      return validateFields({
        value: groupValue,
        meta: Object.fromEntries(groupedSettings),
        path: `content.${contentType}.${groupName}`,
        location,
      });
    });
  });
}

function validateSectionObject(
  value: unknown,
  location: InlineOverrideLocation,
  pathPrefix = "",
): Warning[] {
  if (!validatePlainObject(value, location, pathPrefix || "section override")) {
    return [
      warning({
        code: "INLINE_OVERRIDE_VALUE_INVALID",
        message: "Inline section override should be an object.",
        lineNumber: location.lineNumber,
        path: pathPrefix || undefined,
        expected: "object",
        actual: describeValue(value),
        scope: location.scope,
      }),
    ];
  }

  const fieldWarnings = Object.entries(value).flatMap(([key, categoryValue]) => {
    const path = pathPrefix ? `${pathPrefix}.${key}` : key;
    switch (key) {
      case SETTING_CATEGORY.GENERAL:
        return validateFields({
          value: categoryValue,
          meta: PPT_GENERATION_COMBINED_SECTION_SETTINGS,
          path,
          location,
        });
      case SETTING_CATEGORY.COVER:
        return validateCover(categoryValue, {
          ...location,
        }).map((item) => ({
          ...item,
          path: pathPrefix ? `${pathPrefix}.${item.path}` : item.path,
        }));
      case SETTING_CATEGORY.CONTENT:
        return validateContent(categoryValue, {
          ...location,
        }).map((item) => ({
          ...item,
          path: pathPrefix ? `${pathPrefix}.${item.path}` : item.path,
        }));
      default:
        return [
          warning({
            code: "INLINE_OVERRIDE_KEY_UNKNOWN",
            message: `Inline section override key "${path}" is not allowed. Use general, cover, or content.`,
            lineNumber: location.lineNumber,
            path,
            scope: location.scope,
          }),
        ];
    }
  });

  const obj = value as Record<string, any>;
  const generalSection = obj[SETTING_CATEGORY.GENERAL];
  if (
    !validatePlainObject(generalSection, location, "general") ||
    !Object.prototype.hasOwnProperty.call(generalSection, "useMainSectionSettings")
  ) {
    const path = pathPrefix
      ? `${pathPrefix}.general.useMainSectionSettings`
      : "general.useMainSectionSettings";
    fieldWarnings.push(
      warning({
        code: "INLINE_OVERRIDE_MISSING_REQUIRED_FIELD",
        message: `Section override is missing "general.useMainSectionSettings: false". Without it, the section override will be silently ignored.`,
        lineNumber: location.lineNumber,
        path,
        expected: false,
        actual: generalSection?.useMainSectionSettings,
        scope: location.scope,
      }),
    );
  }

  return fieldWarnings;
}

function validateGlobalObject(
  value: unknown,
  location: InlineOverrideLocation,
): Warning[] {
  if (!validatePlainObject(value, location, "global override")) {
    return [
      warning({
        code: "INLINE_OVERRIDE_VALUE_INVALID",
        message: "Inline global override should be an object.",
        lineNumber: location.lineNumber,
        expected: "object",
        actual: describeValue(value),
        scope: location.scope,
      }),
    ];
  }

  return Object.entries(value).flatMap(([key, categoryValue]) => {
    switch (key) {
      case SETTING_CATEGORY.FILE:
        return validateFields({
          value: categoryValue,
          meta: PPT_GENERATION_FILE_SETTINGS,
          path: key,
          location,
        });
      case SETTING_CATEGORY.GENERAL:
        return validateFields({
          value: categoryValue,
          meta: PPT_GENERATION_COMBINED_GENERAL_SETTINGS,
          path: key,
          location,
        });
      case SETTING_CATEGORY.COVER:
        return validateCover(categoryValue, location);
      case SETTING_CATEGORY.CONTENT:
        return validateContent(categoryValue, location);
      case SETTING_CATEGORY.SECTION:
        if (!validatePlainObject(categoryValue, location, "section")) {
          return [
            warning({
              code: "INLINE_OVERRIDE_VALUE_INVALID",
              message: 'Inline override "section" should be an object.',
              lineNumber: location.lineNumber,
              path: "section",
              expected: "object",
              actual: describeValue(categoryValue),
              scope: location.scope,
            }),
          ];
        }
        return Object.entries(categoryValue).flatMap(
          ([sectionKey, sectionValue]) => {
            if (!sectionKeyRegex.test(sectionKey)) {
              return [
                warning({
                  code: "INLINE_OVERRIDE_KEY_UNKNOWN",
                  message: `Inline override key "section.${sectionKey}" should look like "section1".`,
                  lineNumber: location.lineNumber,
                  path: `section.${sectionKey}`,
                  expected: "section<number>",
                  scope: location.scope,
                }),
              ];
            }

            return validateSectionObject(
              sectionValue,
              location,
              `section.${sectionKey}`,
            );
          },
        );
      default:
        return [
          warning({
            code: "INLINE_OVERRIDE_KEY_UNKNOWN",
            message: `Inline global override key "${key}" is not allowed.`,
            lineNumber: location.lineNumber,
            path: key,
            scope: location.scope,
          }),
        ];
    }
  });
}

function locateInlineOverrides(lyrics: string) {
  const lines = lyrics.split("\n");
  const locations: Array<InlineOverrideLocation & { jsonText: string }> = [];
  let hasSeenSection = false;
  let sectionIndex = 0;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    if (isSectionHeader(line)) {
      hasSeenSection = true;
      sectionIndex++;
      const nextLine = lines[index + 1];
      if (nextLine !== undefined && isOverwriteJsonLine(nextLine)) {
        locations.push({
          scope: "section",
          lineNumber: index + 2,
          sectionIndex,
          jsonText: nextLine.trim(),
        });
        index++;
      }
      continue;
    }

    if (!hasSeenSection && isOverwriteJsonLine(line)) {
      locations.push({
        scope: "global",
        lineNumber: index + 1,
        jsonText: line.trim(),
      });
      continue;
    }

    if (isJsonLikeLine(line)) {
      locations.push({
        scope: "unrecognized",
        lineNumber: index + 1,
        sectionIndex: hasSeenSection ? sectionIndex : undefined,
        jsonText: line.trim(),
      });
    }
  }

  return locations;
}

export function validateInlineOverrides(lyrics: string): Warning[] {
  return locateInlineOverrides(lyrics).flatMap((location) => {
    if (location.scope === "unrecognized") {
      return [
        warning({
          code: "INLINE_OVERRIDE_LOCATION_INVALID",
          message:
            "Inline JSON override was not before the first section or immediately after a section marker, so Khen will not apply it.",
          lineNumber: location.lineNumber,
          scope: location.scope,
        }),
      ];
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(location.jsonText);
    } catch (error) {
      return [
        warning({
          code: "INLINE_OVERRIDE_JSON_INVALID",
          message: `Inline JSON override is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
          lineNumber: location.lineNumber,
          scope: location.scope,
        }),
      ];
    }

    return location.scope === "global"
      ? validateGlobalObject(parsed, location)
      : validateSectionObject(parsed, location);
  });
}

function fieldSchema(setting: any) {
  const schema: Record<string, any> = {
    type: setting.fieldType,
    displayName: setting.fieldDisplayName,
    defaultValue: setting.defaultValue,
  };
  if (setting.rangeMin !== undefined) schema.minimum = setting.rangeMin;
  if (setting.rangeMax !== undefined) schema.maximum = setting.rangeMax;
  if (setting.fieldType === SETTING_FIELD_TYPE.PERCENTAGE) {
    schema.minimum ??= 0;
    schema.maximum ??= setting.useProportionForm ? 1 : 100;
  }
  if (setting.fieldType === SETTING_FIELD_TYPE.HORIZONTAL_ALIGN) {
    schema.enum = Object.values(HORIZONTAL_ALIGNMENT);
  }
  if (setting.fieldType === SETTING_FIELD_TYPE.SHADOW_TYPE) {
    schema.enum = Object.values(SHADOW_TYPE);
  }
  if (setting.fieldType === SETTING_FIELD_TYPE.COLOR) {
    schema.pattern = "^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{4}){1,2}$";
  }
  if (setting.fieldType === SETTING_FIELD_TYPE.IMAGE) {
    schema.type = ["string", "null"];
  }
  if (setting.tips) schema.description = setting.tips;
  return schema;
}

function simplifiedFieldSchema(setting: any): string {
  return setting.fieldType as string;
}

function fieldsSchema(meta: SettingMeta) {
  return Object.fromEntries(
    Object.entries(meta)
      .filter(([, setting]) => !setting.isNotAvailable)
      .map(([key, setting]) => [key, fieldSchema(setting)]),
  );
}

function simplifiedFieldsSchema(meta: SettingMeta): Record<string, string> {
  return Object.fromEntries(
    Object.entries(meta)
      .filter(([, setting]) => !setting.isNotAvailable)
      .map(([key, setting]) => [key, simplifiedFieldSchema(setting)]),
  );
}

function contentSchema() {
  const groups = Object.entries(
    PPT_GENERATION_CONTENT_SETTINGS as SettingMeta,
  ).reduce(
    (acc, [key, setting]) => {
      if (setting.isNotAvailable) return acc;
      const group = setting.groupingName || "default";
      acc[group] = acc[group] || {};
      acc[group][key] = fieldSchema(setting);
      return acc;
    },
    {} as Record<string, Record<string, any>>,
  );

  return {
    main: {
      ...groups,
      textbox: {
        "textbox<number>": fieldsSchema(
          PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS,
        ),
      },
    },
    secondary: {
      ...groups,
      textbox: {
        "textbox<number>": fieldsSchema(
          PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS,
        ),
      },
    },
  };
}

function simplifiedContentSchema() {
  const groups = Object.entries(
    PPT_GENERATION_CONTENT_SETTINGS as SettingMeta,
  ).reduce(
    (acc, [key, setting]) => {
      if (setting.isNotAvailable) return acc;
      const group = setting.groupingName || "default";
      acc[group] = acc[group] || {};
      acc[group][key] = simplifiedFieldSchema(setting);
      return acc;
    },
    {} as Record<string, Record<string, string>>,
  );

  return {
    main: {
      ...groups,
      textbox: {
        "textbox<number>": simplifiedFieldsSchema(
          PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS,
        ),
      },
    },
    secondary: {
      ...groups,
      textbox: {
        "textbox<number>": simplifiedFieldsSchema(
          PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS,
        ),
      },
    },
  };
}

function coverSchema() {
  return {
    main: fieldsSchema(PPT_GENERATION_COVER_SETTINGS),
    secondary: fieldsSchema(PPT_GENERATION_COVER_SETTINGS),
  };
}

function simplifiedCoverSchema() {
  return {
    main: simplifiedFieldsSchema(PPT_GENERATION_COVER_SETTINGS),
    secondary: simplifiedFieldsSchema(PPT_GENERATION_COVER_SETTINGS),
  };
}

const schemaExamples = {
  sectionPreset:
    '{"general":{"useMainSectionSettings":false,"presetChosen":"onsiteEnglishPreset"}}',
  coverResize:
    '{"general":{"useMainSectionSettings":false,"presetChosen":"onsiteChinesePreset"},"cover":{"main":{"coverTitleFontSize":74,"coverTitlePositionY":33}}}',
  contentFontSize:
    '{"general":{"useMainSectionSettings":false,"presetChosen":"onsiteEnglishPreset"},"content":{"main":{"text":{"fontSize":40}}}}',
};

export function buildInlineOverrideSchema({ detailed = false } = {}) {
  const placement = {
    global:
      "Place one JSON object before the first ---- section marker to override deck-level settings.",
    section:
      "Place one JSON object immediately after a ---- section marker to override that song section.",
  };
  const presetChosen = {
    note: "Inline JSON must use internal preset ids, not display names or CLI aliases.",
    enum: presetIds,
  };

  if (!detailed) {
    const simplifiedSectionOverride = {
      general: simplifiedFieldsSchema(PPT_GENERATION_COMBINED_SECTION_SETTINGS),
      cover: simplifiedCoverSchema(),
      content: simplifiedContentSchema(),
    };
    return {
      version: 1,
      description:
        "Simplified schema for Khen lyric inline JSON overrides. Run with --detail for full field metadata. Objects are partial: include only fields you want to override.",
      placement,
      presetChosen,
      globalOverride: {
        file: simplifiedFieldsSchema(PPT_GENERATION_FILE_SETTINGS),
        general: simplifiedFieldsSchema(PPT_GENERATION_COMBINED_GENERAL_SETTINGS),
        cover: simplifiedCoverSchema(),
        content: simplifiedContentSchema(),
        section: {
          "section<number>": simplifiedSectionOverride,
        },
      },
      sectionOverride: simplifiedSectionOverride,
      examples: schemaExamples,
    };
  }

  const sectionOverride = {
    general: fieldsSchema(PPT_GENERATION_COMBINED_SECTION_SETTINGS),
    cover: coverSchema(),
    content: contentSchema(),
  };

  return {
    version: 1,
    description:
      "Detailed schema for Khen lyric inline JSON overrides. Objects are partial: include only fields you want to override.",
    placement,
    presetChosen,
    globalOverride: {
      file: fieldsSchema(PPT_GENERATION_FILE_SETTINGS),
      general: fieldsSchema(PPT_GENERATION_COMBINED_GENERAL_SETTINGS),
      cover: coverSchema(),
      content: contentSchema(),
      section: {
        "section<number>": sectionOverride,
      },
    },
    sectionOverride,
    examples: schemaExamples,
  };
}
