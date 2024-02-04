import {
  HORIZONTAL_ALIGNMENT,
  SETTING_CATEGORY,
  SETTING_FIELD_TYPE,
  SHADOW_TYPE,
} from "../constant";

export type HorizontalAlignSettingType =
  (typeof HORIZONTAL_ALIGNMENT)[keyof typeof HORIZONTAL_ALIGNMENT];
export type ShadowTypeSettingType =
  (typeof SHADOW_TYPE)[keyof typeof SHADOW_TYPE];
export type TransitionSettingType = ""; // TODO: implement this
export type FontFaceSettingType = string;

export type TextSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.TEXT;
  defaultValue: string;
  placeholder?: string;
};
export type BooleanSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.BOOLEAN;
  defaultValue: boolean;
};
export type NumberSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.NUMBER;
  defaultValue: number;
  rangeMin?: number;
  rangeMax?: number;
};
export type PercentageSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.PERCENTAGE;
  defaultValue: number;
  useProportionForm?: boolean; // if true, the range will be 0.0-1.0
};
export type ImageSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.IMAGE;
  defaultValue: any; //TODO: change type for this
};
export type ColorSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.COLOR;
  defaultValue: string;
};
export type FontSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.FONT;
  defaultValue: FontFaceSettingType;
};
export type HorizontalAlignSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.HORIZONTAL_ALIGN;
  defaultValue: HorizontalAlignSettingType;
};
export type ShadowTypeSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.SHADOW_TYPE;
  defaultValue: ShadowTypeSettingType;
};
export type TransitionTypeSettingItemMetaType = {
  fieldType: typeof SETTING_FIELD_TYPE.TRANSITION;
  defaultValue: TransitionSettingType;
};

export type BaseSettingItemMetaType = {
  fieldKey: string; // TODO: revise if slug is needed
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

export type PptSettingsItemState = {
  [key: string]: any; // Replace 'any' with a more specific type as needed
};

export type PptSettingsState = {
  [SETTING_CATEGORY.GENERAL]: PptSettingsItemState;
  [SETTING_CATEGORY.CONTENT]: PptSettingsItemState;
  [SETTING_CATEGORY.COVER]: PptSettingsItemState;
  [SETTING_CATEGORY.FILE]: PptSettingsItemState;
  // [SETTING_CATEGORY.SECTION]?: {
  //   [sectionKey: string]: PptSettingsCategoryState;
  // };
  // Add other categories as needed
};
