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
  TAB_TYPES,
  TAB_TYPE_STATE_NAME_MAPPING,
  TEXTBOX_GROUPING_PREFIX,
  TEXTBOX_SETTING_KEY,
} from "../constant";

export type TransitionSettingType = ""; // TODO: implement this

export type FieldTypeToTypeScriptType = {
  [SETTING_FIELD_TYPE.TEXT]: string;
  [SETTING_FIELD_TYPE.BOOLEAN]: boolean;
  [SETTING_FIELD_TYPE.NUMBER]: number;
  [SETTING_FIELD_TYPE.PERCENTAGE]: number;
  [SETTING_FIELD_TYPE.IMAGE]: File | string | null;
  [SETTING_FIELD_TYPE.COLOR]: `#${string}`;
  [SETTING_FIELD_TYPE.FONT]: string;
  [SETTING_FIELD_TYPE.HORIZONTAL_ALIGN]: HORIZONTAL_ALIGNMENT;
  [SETTING_FIELD_TYPE.SHADOW_TYPE]: SHADOW_TYPE;
  [SETTING_FIELD_TYPE.TRANSITION]: TransitionSettingType;
};

export type TextSettingItemMetaType = {
  fieldType: SETTING_FIELD_TYPE.TEXT;
  defaultValue: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.TEXT];
  placeholder?: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.TEXT];
};
export type BooleanSettingItemMetaType = {
  fieldType: SETTING_FIELD_TYPE.BOOLEAN;
  defaultValue: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.BOOLEAN];
};
export type NumberSettingItemMetaType = {
  fieldType: SETTING_FIELD_TYPE.NUMBER;
  defaultValue: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.NUMBER];
  rangeMin?: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.NUMBER];
  rangeMax?: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.NUMBER];
  step?: number;
};
export type PercentageSettingItemMetaType = {
  fieldType: SETTING_FIELD_TYPE.PERCENTAGE;
  defaultValue: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.PERCENTAGE];
  useProportionForm?: boolean; // if true, the range will be 0.0-1.0
};
export type ImageSettingItemMetaType = {
  fieldType: SETTING_FIELD_TYPE.IMAGE;
  defaultValue: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.IMAGE];
};
export type ColorSettingItemMetaType = {
  fieldType: SETTING_FIELD_TYPE.COLOR;
  defaultValue: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.COLOR];
};
export type FontSettingItemMetaType = {
  fieldType: SETTING_FIELD_TYPE.FONT;
  defaultValue: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.FONT];
};
export type HorizontalAlignSettingItemMetaType = {
  fieldType: SETTING_FIELD_TYPE.HORIZONTAL_ALIGN;
  defaultValue: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.HORIZONTAL_ALIGN];
};
export type ShadowTypeSettingItemMetaType = {
  fieldType: SETTING_FIELD_TYPE.SHADOW_TYPE;
  defaultValue: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.SHADOW_TYPE];
};
export type TransitionTypeSettingItemMetaType = {
  fieldType: SETTING_FIELD_TYPE.TRANSITION;
  defaultValue: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.TRANSITION];
};

export type BaseSettingItemMetaType = {
  fieldDisplayName: string;
  remark?: string;
  tips?: string;
  tipsImagePath?: string;
  isNotAvailable?: boolean; //this setting is not ready / disabled by admin
  isHidden?:
    | boolean
    | ((settingsState: PptSettingsStateType, fieldName: string) => boolean); // not visible to user, but still exist in value
  groupingName?: string;
  isOptional?: boolean;
  pptxgenName?: keyof PptxGenJS.default.TextPropsOptions; // name of option in the pptxgen
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

export type BaseSettingMetaType = {
  [key: string]: BaseSettingItemMetaType;
};

export type PptGenerationSettingMetaType = {
  [key in SETTING_CATEGORY]: BaseSettingMetaType;
};

export type SettingsValueType<
  T extends Record<string, BaseSettingItemMetaType>,
> = {
  -readonly [K in keyof T as T[K]["isNotAvailable"] extends true
    ? never
    : K]?: FieldTypeToTypeScriptType[T[K]["fieldType"]]; // key of setting: value type obtained from the infer type based on the fieldType
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
    [Key in keyof T as T[Key] extends {
      groupingName: Group;
      isNotAvailable?: false;
    }
      ? Key
      : never]?: FieldTypeToTypeScriptType[T[Key]["fieldType"]];
  };
};

export type ContentTextboxKey = `${typeof TEXTBOX_GROUPING_PREFIX}${number}`;
// Static part of the CONTENT category settings
export type ContentTextboxSettingsType = {
  [key in ContentTextboxKey]: SettingsValueType<
    typeof PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS
  >;
};

export type ContentSettingsType = GroupedSettingsValueType<
  typeof PPT_GENERATION_CONTENT_SETTINGS
> & {
  [TEXTBOX_SETTING_KEY]: ContentTextboxSettingsType;
};

type BasePptSettingsStateType = {
  [SETTING_CATEGORY.FILE]: SettingsValueType<
    typeof PPT_GENERATION_FILE_SETTINGS
  >;
  [SETTING_CATEGORY.GENERAL]: SettingsValueType<
    typeof PPT_GENERATION_COMBINED_GENERAL_SETTINGS
  >;
  [SETTING_CATEGORY.COVER]: {
    [T in CONTENT_TYPE]: SettingsValueType<
      typeof PPT_GENERATION_COVER_SETTINGS
    >;
  };
  [SETTING_CATEGORY.CONTENT]: {
    [T in CONTENT_TYPE]: ContentSettingsType;
  };
};

export type SectionSettingsKeyType = `${typeof SECTION_PREFIX}${number}`;

export type SectionSettingsType = Omit<
  BasePptSettingsStateType,
  SETTING_CATEGORY.FILE | SETTING_CATEGORY.GENERAL
> & {
  [SETTING_CATEGORY.GENERAL]: SettingsValueType<
    typeof PPT_GENERATION_COMBINED_SECTION_SETTINGS
  >;
};

export type PptSettingsStateType = BasePptSettingsStateType & {
  [SETTING_CATEGORY.SECTION]?: {
    [key in SectionSettingsKeyType]: SectionSettingsType;
  };
};

export type PptMainSectionInfo = {
  sectionName: string;
  startLineIndex: number;
  endLineIndex: number;
};

export type PresetsType = {
  presetDisplayName: string;
  presetName: string;
}[];

export type TabType = (typeof TAB_TYPES)[keyof typeof TAB_TYPES];
export type TabStateNameType =
  (typeof TAB_TYPE_STATE_NAME_MAPPING)[keyof typeof TAB_TYPE_STATE_NAME_MAPPING];

export type PptSettingsUIState = {
  openAccordions: {
    [key: string]: string[];
  };
  sectionTabs: {
    [sectionName: string]: {
      [key in TabStateNameType]: string;
    };
  };
} & {
  [key in TabStateNameType]: string;
};

export type DropdownImagesType = {
  displayName: string;
  path: string;
}[];
