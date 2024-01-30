import { SETTING_CATEGORY } from "../constant";

export type HorizontalAlignSettingType = "left" | "center" | "right";
export type ShadowTypeSettingType = "outer" | "inner";
export type TransitionSettingType = ""; // TODO: implement this

export type TextSettingItemMetaType = {
  fieldType: "text";
  defaultValue?: string;
};
export type BooleanSettingItemMetaType = {
  fieldType: "boolean";
  defaultValue: boolean;
};
export type NumberSettingItemMetaType = {
  fieldType: "number";
  defaultValue?: number;
  rangeMin?: number;
  rangeMax?: number;
};
export type PercentageSettingItemMetaType = {
  fieldType: "percentage";
  defaultValue?: number;
  useIndexRepresentation?: boolean; // if true, the range will be 0.0-1.0
};
export type ImageSettingItemMetaType = {
  fieldType: "image";
  defaultValue?: any; //TODO: change type for this
};
export type ColorSettingItemMetaType = {
  fieldType: "color";
  defaultValue: string;
};
export type FontSettingItemMetaType = {
  fieldType: "font";
  defaultValue?: string;
};
export type HorizontalAlignSettingItemMetaType = {
  fieldType: "horizontal-align";
  defaultValue?: HorizontalAlignSettingType;
};
export type ShadowTypeSettingItemMetaType = {
  fieldType: "shadow-type";
  defaultValue?: ShadowTypeSettingType;
};
export type TransitionTypeSettingItemMetaType = {
  fieldType: "transition";
  defaultValue?: TransitionSettingType;
};

export type BaseSettingItemMetaType = {
  fieldSlug: string; // TODO: revise if slug is needed
  fieldDisplayName?: string;
  remark?: string;
  tips?: string;
  isHidden?: boolean; // hidden from user, this setting is not ready / disabled by admin
  groupingName?: string;
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

export type PptSettingsCategoryState = {
  [key: string]: any; // Replace 'any' with a more specific type as needed
};

export type PptSettingsState = {
  [SETTING_CATEGORY.GENERAL]: PptSettingsCategoryState;
  // [SETTING_CATEGORY.SECTION]?: {
  //   [sectionKey: string]: PptSettingsCategoryState;
  // };
  // Add other categories as needed
};
