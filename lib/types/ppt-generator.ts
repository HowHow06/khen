import {
  CONTENT_TYPE,
  HORIZONTAL_ALIGNMENT,
  PPT_GENERATION_CONTENT_SETTINGS,
  PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS,
  PPT_GENERATION_COVER_SETTINGS,
  PPT_GENERATION_FILE_SETTINGS,
  PPT_GENERATION_GENERAL_SETTINGS,
  SETTING_CATEGORY,
  SETTING_FIELD_TYPE,
  SHADOW_TYPE,
  TEXTBOX_GROUPING_PREFIX,
} from "../constant";

export type HorizontalAlignSettingType =
  (typeof HORIZONTAL_ALIGNMENT)[keyof typeof HORIZONTAL_ALIGNMENT];
export type ShadowTypeSettingType =
  (typeof SHADOW_TYPE)[keyof typeof SHADOW_TYPE];
export type TransitionSettingType = ""; // TODO: implement this

type FieldTypeToTypeScriptType = {
  [SETTING_FIELD_TYPE.TEXT]: string;
  [SETTING_FIELD_TYPE.BOOLEAN]: boolean;
  [SETTING_FIELD_TYPE.NUMBER]: number;
  [SETTING_FIELD_TYPE.PERCENTAGE]: number;
  [SETTING_FIELD_TYPE.IMAGE]: File | null;
  [SETTING_FIELD_TYPE.COLOR]: string;
  [SETTING_FIELD_TYPE.FONT]: string;
  [SETTING_FIELD_TYPE.HORIZONTAL_ALIGN]: HorizontalAlignSettingType;
  [SETTING_FIELD_TYPE.SHADOW_TYPE]: ShadowTypeSettingType;
  [SETTING_FIELD_TYPE.TRANSITION]: TransitionSettingType;
};

export type InferTypeScriptTypeFromSettingFieldType<T> =
  T extends keyof FieldTypeToTypeScriptType
    ? FieldTypeToTypeScriptType[T]
    : never;

export type TextSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.TEXT;
  defaultValue: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.TEXT
  >;
  placeholder?: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.TEXT
  >;
};
export type BooleanSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.BOOLEAN;
  defaultValue: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.BOOLEAN
  >;
};
export type NumberSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.NUMBER;
  defaultValue: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.NUMBER
  >;
  rangeMin?: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.NUMBER
  >;
  rangeMax?: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.NUMBER
  >;
};
export type PercentageSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.PERCENTAGE;
  defaultValue: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.PERCENTAGE
  >;
  useProportionForm?: boolean; // if true, the range will be 0.0-1.0
};
export type ImageSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.IMAGE;
  defaultValue: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.IMAGE
  >; //TODO: change type for this
};
export type ColorSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.COLOR;
  defaultValue: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.COLOR
  >;
};
export type FontSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.FONT;
  defaultValue: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.FONT
  >;
};
export type HorizontalAlignSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.HORIZONTAL_ALIGN;
  defaultValue: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.HORIZONTAL_ALIGN
  >;
};
export type ShadowTypeSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.SHADOW_TYPE;
  defaultValue: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.SHADOW_TYPE
  >;
};
export type TransitionTypeSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.TRANSITION;
  defaultValue: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.TRANSITION
  >;
};

export type BaseSettingItemMetaType = {
  fieldKey: string; // TODO: revise if field key is needed, consider remove this and use the key instead
  fieldDisplayName?: string;
  remark?: string;
  tips?: string;
  isHidden?: boolean; // hidden from user, this setting is not ready / disabled by admin
  groupingName?: string;
  isOptional?: boolean;
} & (
  | TextSettingItemMetaType
  | BooleanSettingItemMetaType
  | NumberSettingItemMetaType
  | PercentageSettingItemMetaType
  | ImageSettingItemMetaType
  | ColorSettingItemMetaType
  | FontSettingItemMetaType
  | HorizontalAlignSettingItemMetaType
  | ShadowTypeSettingItemMetaType
  | TransitionTypeSettingItemMetaType
);

type PptGenerationCategory =
  (typeof SETTING_CATEGORY)[keyof typeof SETTING_CATEGORY];

export type BaseSettingMetaType = {
  [key: string]: BaseSettingItemMetaType;
};

export type PptGenerationSettingMetaType = {
  [key in PptGenerationCategory]: BaseSettingMetaType;
};

export type PptSettingsPresetName = "onsite-chinese";

export type SettingsValueType<
  T extends Record<string, BaseSettingItemMetaType>,
> = {
  [K in keyof T as T[K]["isHidden"] extends true
    ? never
    : K]?: InferTypeScriptTypeFromSettingFieldType<T[K]["fieldType"]>; // key of setting: value type obtained from the infer type based on the fieldType
};

export type GroupedSettingsValueType<
  T extends Record<
    string,
    BaseSettingItemMetaType &
      Required<Pick<BaseSettingItemMetaType, "groupingName">> // make the groupingName required
  >,
> = {
  [Group in T[keyof T]["groupingName"]]?: {
    // only take the Key whereby the groupingName is the same as the Group key, for example: bold should not exist in shadow grouping
    [Key in keyof T as T[Key] extends { groupingName: Group; isHidden?: false }
      ? Key
      : never]?: InferTypeScriptTypeFromSettingFieldType<T[Key]["fieldType"]>;
  };
};

// Static part of the CONTENT category settings
export type ContentTextboxSettingsType = {
  [key in `${typeof TEXTBOX_GROUPING_PREFIX}${number}`]: SettingsValueType<
    typeof PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS
  >;
};

export type ContentSettingsType = GroupedSettingsValueType<
  typeof PPT_GENERATION_CONTENT_SETTINGS
> &
  ContentTextboxSettingsType;

export type ContentTypeType = (typeof CONTENT_TYPE)[keyof typeof CONTENT_TYPE];

export type PptSettingsStateType = {
  [SETTING_CATEGORY.FILE]: SettingsValueType<
    typeof PPT_GENERATION_FILE_SETTINGS
  >;
  [SETTING_CATEGORY.GENERAL]: SettingsValueType<
    typeof PPT_GENERATION_GENERAL_SETTINGS
  >;
  [SETTING_CATEGORY.COVER]: {
    [T in ContentTypeType]: SettingsValueType<
      typeof PPT_GENERATION_COVER_SETTINGS
    >;
  };
  [SETTING_CATEGORY.CONTENT]: {
    [T in ContentTypeType]: ContentSettingsType;
  };
};

export type PptMainSectionInfo = {
  sectionName: string;
  startLineIndex: number;
  endLineIndex: number;
};
