import {
  DropdownImagesType,
  PptGenerationSettingMetaType,
  PptSettingsStateType,
  PresetsType,
  SelectionItemsType,
} from "../types";
import { getValueFromPath } from "../utils";
import { convertToTraditional } from "../utils/character-converter";
import { fontFaces } from "./font-face";

export const DEFAULT_GROUPING_NAME = "default";
export const DEFAULT_TEXTBOX_COUNT_PER_SLIDE = 2;
export const DEFAULT_LINE_COUNT_PER_TEXTBOX = 1;
export const TEXTBOX_GROUPING_PREFIX = "textbox";
export const SECTION_PREFIX = "section";
export const DEFAULT_AUTHOR = "Khen Ho2";

export const DEFAULT_SUBJECT =
  "Lyrics Presentation - Generated by Khen Ho2 PPT Generator";
export const DEFAULT_TITLE = "PPT Generator Presentation";
export const DEFAULT_PPT_LAYOUT = "LAYOUT_16x9";
export const DEFAULT_FILENAME = "Sample Presentation.pptx";

export const DEFAULT_BASE_OPTION = {
  w: "100%",
  isTextBox: true,
} as Partial<PptxGenJS.default.TextPropsOptions>;

export enum SETTING_FIELD_TYPE {
  TEXT = "text",
  BOOLEAN = "boolean",
  NUMBER = "number",
  PERCENTAGE = "percentage",
  IMAGE = "image",
  COLOR = "color",
  FONT = "font",
  HORIZONTAL_ALIGN = "horizontal-align",
  SHADOW_TYPE = "shadow-type",
  TRANSITION = "transition",
}

export enum HORIZONTAL_ALIGNMENT {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
}

export enum SHADOW_TYPE {
  OUTER = "outer",
  INNER = "inner",
}

export enum PINYIN_TYPE {
  WITH_TONE = "with tone",
  WITHOUT_TONE = "without tone",
}

export enum SETTING_CATEGORY {
  FILE = "file",
  GENERAL = "general",
  SECTION = "section",
  CONTENT = "content",
  COVER = "cover",
  CONTENT_TEXTBOX = "contentTextbox",
}

export enum LYRIC_SECTION {
  SECTION = "----",
  SUBSECTION = "---",
  MAIN_TITLE = "#",
  SECONDARY_TITLE = "##",
  EMPTY_SLIDE = "***",
  FILL_SLIDE = "**",
}

export const CUSTOM_PINYIN_MAP_SIMPLIFIED = {
  降服: "xiáng fú",
  得着: "dé zháo",
  差派: "chāi pài",
  朝阳: "zhāo yáng",
  不着: "bù zháo",
  祢: "nǐ",
  袮: "nǐ",
  牵引着: "qiān yǐn zhe",
  明了: "míng liǎo",
  同行: "tóng xíng",
  灭没: "miè mò",
  伯利恒: "bó lì héng",
  乐歌: "lè gē",
  沈浸: "chén jìn",
};

const CUSTOM_PINYIN_MAP = CUSTOM_PINYIN_MAP_SIMPLIFIED as {
  [key: string]: string;
};

Object.entries(CUSTOM_PINYIN_MAP_SIMPLIFIED).map(([text, customPinyin]) => {
  const traditionalText = convertToTraditional(text);
  if (traditionalText !== text) {
    CUSTOM_PINYIN_MAP[traditionalText] = customPinyin;
  }
});

export { CUSTOM_PINYIN_MAP };

export const PPT_GENERATION_FILE_SETTINGS = {
  filename: {
    fieldDisplayName: "File Name", // TODO: change display name to special syntax to match internalization
    fieldType: SETTING_FIELD_TYPE.TEXT,
    defaultValue: "",
    isOptional: true,
    placeholder: "Insert the file name here.",
  },
  filenamePrefix: {
    fieldDisplayName: "File Name Prefix",
    fieldType: SETTING_FIELD_TYPE.TEXT,
    defaultValue: "",
    isOptional: true,
  },
  filenameSuffix: {
    fieldDisplayName: "File Name Suffix",
    fieldType: SETTING_FIELD_TYPE.TEXT,
    defaultValue: "",
    isOptional: true,
  },
} as const;

const PPT_GENERATION_GENERAL_SETTINGS = {
  mainBackgroundImage: {
    fieldDisplayName: "Main Background Image",
    fieldType: SETTING_FIELD_TYPE.IMAGE,
    defaultValue: null,
    isOptional: true,
  },
  mainBackgroundColor: {
    fieldDisplayName: "Main Background Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
  },
  separateSectionsToFiles: {
    fieldDisplayName: "Separate Sections Into Different Files",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: false,
    tips: "Separate sections into different files and download them as a zip file.",
  },
  sectionsAutoNumbering: {
    fieldDisplayName: "Section Auto Numbering",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
    tips: "Numbering (1., 1.1, 1.2 etc.) will be automatically added to the main sections and sub sections.",
  },
  useDifferentSettingForEachSection: {
    fieldDisplayName: "Use Different Setting for Each Section",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: false,
  },
} as const;

const PPT_GENERATION_SECTION_SETTINGS = {
  useMainSectionSettings: {
    fieldDisplayName: "Use Main Section Settings",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
  },
  useMainBackgroundImage: {
    fieldDisplayName: "Use Main Background Image",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
    isHidden: (settings: PptSettingsStateType, fieldName: string): boolean =>
      !!getValueFromPath<boolean>(
        settings,
        fieldName.replace("useMainBackgroundImage", "useMainSectionSettings"),
      ),
  },
  sectionBackgroundImage: {
    fieldDisplayName: "Section Background Image",
    fieldType: SETTING_FIELD_TYPE.IMAGE,
    isOptional: true,
    defaultValue: null,
    isHidden: (settings: PptSettingsStateType, fieldName: string): boolean =>
      !!getValueFromPath<boolean>(
        settings,
        fieldName.replace("sectionBackgroundImage", "useMainSectionSettings"),
      ) ||
      !!getValueFromPath<boolean>(
        settings,
        fieldName.replace("sectionBackgroundImage", "useMainBackgroundImage"),
      ),
  },
  useMainBackgroundColor: {
    fieldDisplayName: "Use Main Background Color",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
    isHidden: (settings: PptSettingsStateType, fieldName: string): boolean =>
      !!getValueFromPath<boolean>(
        settings,
        fieldName.replace("useMainBackgroundColor", "useMainSectionSettings"),
      ),
  },
  sectionBackgroundColor: {
    fieldDisplayName: "Section Background Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    isOptional: true,
    defaultValue: "#000000",
    isHidden: (settings: PptSettingsStateType, fieldName: string): boolean =>
      !!getValueFromPath<boolean>(
        settings,
        fieldName.replace("sectionBackgroundColor", "useMainSectionSettings"),
      ) ||
      !!getValueFromPath<boolean>(
        settings,
        fieldName.replace("sectionBackgroundColor", "useMainBackgroundColor"),
      ),
  },
} as const;

export const PPT_GENERATION_SHARED_GENERAL_SETTINGS = {
  useBackgroundColorWhenEmpty: {
    fieldDisplayName: "Use Background Color for Empty Slides",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
    tips: "If unchecked, background image will be used for empty slides.",
  },
  lineCountPerTextbox: {
    fieldDisplayName: "Line Count per Textbox",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    defaultValue: DEFAULT_LINE_COUNT_PER_TEXTBOX,
    isNotAvailable: false,
    rangeMin: 1,
    rangeMax: 99,
  },
  textboxCountPerContentPerSlide: {
    fieldDisplayName: "Textbox Count per Content per Slide",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    defaultValue: DEFAULT_TEXTBOX_COUNT_PER_SLIDE,
    rangeMin: 1,
    rangeMax: 4,
    tips: "Number of textbox that will be generated for each main content and secondary content in each slide. Default is 2.",
  },
  ignoreSubcontent: {
    fieldDisplayName: "Ignore Secondary Content",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: false,
  },
  ignoreSubcontentWhenIdentical: {
    fieldDisplayName: "Ignore Secondary Content when identical",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
  },
  transition: {
    fieldDisplayName: "Transition",
    fieldType: SETTING_FIELD_TYPE.TRANSITION,
    isNotAvailable: true, // TODO: implement transition, KHEN-26
    defaultValue: "",
  },
} as const;

export const PPT_GENERATION_COVER_SETTINGS = {
  coverTitlePositionY: {
    fieldDisplayName: "Position Y (%)",
    fieldType: SETTING_FIELD_TYPE.PERCENTAGE,
    defaultValue: 0,
    groupingName: "position",
    tips: "Percentage distance of the textbox from the slide’s top edge (e.g., 50 represents the middle of the slide).",
    tipsImagePath: "/images/tips/PositionYTips.png",
  },
  coverTitleFont: {
    fieldDisplayName: "Font",
    fieldType: SETTING_FIELD_TYPE.FONT,
    defaultValue: fontFaces.MicrosoftYaHei.value,
    groupingName: "style",
  },
  coverTitleFontSize: {
    fieldDisplayName: "Font Size",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    defaultValue: 80,
    rangeMin: 0,
    groupingName: "style",
  },
  coverTitleFontColor: {
    fieldDisplayName: "Font Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
  },
} as const;

export const PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS = {
  textboxPositionX: {
    fieldDisplayName: "Position X (%)",
    fieldType: SETTING_FIELD_TYPE.PERCENTAGE,
    defaultValue: 0,
    tips: "Percentage distance of the textbox from the slide’s top edge (e.g., 50 represents the middle of the slide).",
  },
  textboxPositionY: {
    fieldDisplayName: "Position Y (%)",
    fieldType: SETTING_FIELD_TYPE.PERCENTAGE,
    defaultValue: 0,
    tips: "Percentage distance of the textbox from the slide’s left edge (e.g., 50 represents the middle of the slide).",
    tipsImagePath: "/images/tips/PositionYTips.png",
  },
} as const;

export const PPT_GENERATION_CONTENT_SETTINGS = {
  bold: {
    fieldDisplayName: "Bold",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
    groupingName: "text",
  },
  fontColor: {
    fieldDisplayName: "Font Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
    groupingName: "text",
  },
  font: {
    fieldDisplayName: "Font Face",
    fieldType: SETTING_FIELD_TYPE.FONT,
    defaultValue: fontFaces.MicrosoftYaHei.value,
    groupingName: "text",
  },
  fontSize: {
    fieldDisplayName: "Font Size",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    defaultValue: 60,
    rangeMin: 0,
    groupingName: "text",
  },
  charSpacing: {
    fieldDisplayName: "Character Spacing",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    defaultValue: 2,
    rangeMin: 0,
    groupingName: "text",
  },
  lineSpacingMultiple: {
    fieldDisplayName: "Line Spacing Multiple",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    defaultValue: 1.0,
    rangeMin: 0,
    rangeMax: 9.9,
    step: 0.1,
    groupingName: "text",
    tips: "1.0 represents single-spacing; 1.5 represents one and a half times the standard line height etc.",
    pptxgenName: "lineSpacingMultiple",
  },
  align: {
    fieldDisplayName: "Align",
    fieldType: SETTING_FIELD_TYPE.HORIZONTAL_ALIGN,
    defaultValue: HORIZONTAL_ALIGNMENT.CENTER,
    groupingName: "text",
  },
  hasGlow: {
    fieldDisplayName: "Enable Glow",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: false,
    groupingName: "glow",
  },
  glowSize: {
    fieldDisplayName: "Size",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    defaultValue: 7,
    rangeMin: 0,
    groupingName: "glow",
    isHidden: (settings: PptSettingsStateType, fieldName: string): boolean =>
      !getValueFromPath<boolean>(
        settings,
        fieldName.replace("glowSize", "hasGlow"),
      ),
  },
  glowColor: {
    fieldDisplayName: "Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
    groupingName: "glow",
    isHidden: (settings: PptSettingsStateType, fieldName: string): boolean =>
      !getValueFromPath<boolean>(
        settings,
        fieldName.replace("glowColor", "hasGlow"),
      ),
  },
  glowOpacity: {
    fieldDisplayName: "Opacity",
    fieldType: SETTING_FIELD_TYPE.PERCENTAGE,
    defaultValue: 0.4,
    useProportionForm: true,
    groupingName: "glow",
    isHidden: (settings: PptSettingsStateType, fieldName: string): boolean =>
      !getValueFromPath<boolean>(
        settings,
        fieldName.replace("glowOpacity", "hasGlow"),
      ),
  },
  hasOutline: {
    fieldDisplayName: "Enable Outline",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: false,
    groupingName: "outline",
  },
  outlineWeight: {
    fieldDisplayName: "Weight",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    groupingName: "outline",
    defaultValue: 1,
    rangeMin: 0,
    isHidden: (settings: PptSettingsStateType, fieldName: string): boolean =>
      !getValueFromPath<boolean>(
        settings,
        fieldName.replace("outlineWeight", "hasOutline"),
      ),
  },
  outlineColor: {
    fieldDisplayName: "Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
    groupingName: "outline",
    isHidden: (settings: PptSettingsStateType, fieldName: string): boolean =>
      !getValueFromPath<boolean>(
        settings,
        fieldName.replace("outlineColor", "hasOutline"),
      ),
  },
  hasShadow: {
    fieldDisplayName: "Enable Shadow",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
    groupingName: "shadow",
  },
  shadowType: {
    fieldDisplayName: "Type",
    fieldType: SETTING_FIELD_TYPE.SHADOW_TYPE,
    defaultValue: SHADOW_TYPE.OUTER,
    groupingName: "shadow",
    isHidden: (settings: PptSettingsStateType, fieldName: string): boolean =>
      !getValueFromPath<boolean>(
        settings,
        fieldName.replace("shadowType", "hasShadow"),
      ),
  },
  shadowColor: {
    fieldDisplayName: "Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
    groupingName: "shadow",
    isHidden: (settings: PptSettingsStateType, fieldName: string): boolean =>
      !getValueFromPath<boolean>(
        settings,
        fieldName.replace("shadowColor", "hasShadow"),
      ),
  },
  shadowBlur: {
    fieldDisplayName: "Blur",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    defaultValue: 3,
    rangeMin: 0,
    groupingName: "shadow",
    isHidden: (settings: PptSettingsStateType, fieldName: string): boolean =>
      !getValueFromPath<boolean>(
        settings,
        fieldName.replace("shadowBlur", "hasShadow"),
      ),
  },
  shadowOffset: {
    fieldDisplayName: "Offset",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    defaultValue: 3,
    rangeMin: 0,
    groupingName: "shadow",
    isHidden: (settings: PptSettingsStateType, fieldName: string): boolean =>
      !getValueFromPath<boolean>(
        settings,
        fieldName.replace("shadowOffset", "hasShadow"),
      ),
  },
  shadowAngle: {
    fieldDisplayName: "Angle",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    rangeMax: 360,
    rangeMin: -360,
    defaultValue: 45,
    groupingName: "shadow",
    isHidden: (settings: PptSettingsStateType, fieldName: string): boolean =>
      !getValueFromPath<boolean>(
        settings,
        fieldName.replace("shadowAngle", "hasShadow"),
      ),
  },
  shadowOpacity: {
    fieldDisplayName: "Opacity",
    fieldType: SETTING_FIELD_TYPE.PERCENTAGE,
    defaultValue: 0.5,
    useProportionForm: true,
    groupingName: "shadow",
    isHidden: (settings: PptSettingsStateType, fieldName: string): boolean =>
      !getValueFromPath<boolean>(
        settings,
        fieldName.replace("shadowOpacity", "hasShadow"),
      ),
  },
} as const;

export const PPT_GENERATION_COMBINED_GENERAL_SETTINGS = {
  ...PPT_GENERATION_GENERAL_SETTINGS,
  ...PPT_GENERATION_SHARED_GENERAL_SETTINGS,
} as const;

export const PPT_GENERATION_COMBINED_SECTION_SETTINGS = {
  ...PPT_GENERATION_SECTION_SETTINGS,
  ...PPT_GENERATION_SHARED_GENERAL_SETTINGS,
} as const;

// NOTE: this is metadata of the available settings for the users
export const PPT_GENERATION_SETTINGS_META: PptGenerationSettingMetaType = {
  [SETTING_CATEGORY.FILE]: PPT_GENERATION_FILE_SETTINGS,
  [SETTING_CATEGORY.GENERAL]: PPT_GENERATION_COMBINED_GENERAL_SETTINGS,
  [SETTING_CATEGORY.SECTION]: PPT_GENERATION_COMBINED_SECTION_SETTINGS,
  [SETTING_CATEGORY.COVER]: PPT_GENERATION_COVER_SETTINGS,
  [SETTING_CATEGORY.CONTENT_TEXTBOX]: PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS,
  [SETTING_CATEGORY.CONTENT]: PPT_GENERATION_CONTENT_SETTINGS,
};

export const FONT_FACES_ITEMS: SelectionItemsType = Object.entries(
  fontFaces,
).map(([key, font]) => font);

export const HORIZONTAL_ALIGNMENT_ITEMS: SelectionItemsType<HORIZONTAL_ALIGNMENT> =
  Object.values(HORIZONTAL_ALIGNMENT).map((alignment) => {
    return {
      value: alignment,
      label: alignment,
    };
  });

export const SHADOW_TYPE_ITEMS: SelectionItemsType<SHADOW_TYPE> = Object.values(
  SHADOW_TYPE,
).map((shadowType) => {
  return {
    value: shadowType,
    label: shadowType,
  };
});

export const PINYIN_TYPE_ITEMS: SelectionItemsType<PINYIN_TYPE> = Object.values(
  PINYIN_TYPE,
).map((PINYIN_TYPE) => {
  return {
    value: PINYIN_TYPE,
    label: PINYIN_TYPE,
  };
});

export enum CONTENT_TYPE {
  MAIN = "main",
  SECONDARY = "secondary",
}

export const DEFAULT_PRESETS: PresetsType = [
  {
    presetDisplayName: "Default Onsite Chinese",
    presetName: "onsiteChinesePreset",
  },
  {
    presetDisplayName: "Default Live Chinese",
    presetName: "liveChinesePreset",
  },
  {
    presetDisplayName: "Default Onsite English",
    presetName: "onsiteEnglishPreset",
  },
  {
    presetDisplayName: "Default Live English",
    presetName: "liveEnglishPreset",
  },
];

export const MAIN_SECTION_NAME = "main-section";

export const MASTER_SLIDE_BACKGROUND_COLOR = "MASTER_SLIDE_BACKGROUND_COLOR";
export const MASTER_SLIDE_BACKGROUND_IMAGE = "MASTER_SLIDE_BACKGROUND_IMAGE";

export enum IMPORTED_SETTING_TYPE {
  SECTION = "SECTION",
  FULL_SETTING = "FULL_SETTING",
}

export const DEFAULT_IMAGES: DropdownImagesType = [
  {
    displayName: "Greenscreen Background",
    path: "/images/background/greenScreenWithBlackCover_v2.png",
  },
];

export const TEXTBOX_SETTING_KEY = "textbox" as const;

export const LYRIC_SECTION_ITEMS: SelectionItemsType = [
  {
    label: `Section`,
    value: LYRIC_SECTION.SECTION,
  },
  {
    label: `Sub Section`,
    value: LYRIC_SECTION.SUBSECTION,
  },
  {
    label: `Main Title`,
    value: LYRIC_SECTION.MAIN_TITLE,
  },
  {
    label: `Secondary Title`,
    value: LYRIC_SECTION.SECONDARY_TITLE,
  },
  {
    label: `Empty Slide`,
    value: LYRIC_SECTION.EMPTY_SLIDE,
  },
  {
    label: `Fill Slide`,
    value: LYRIC_SECTION.FILL_SLIDE,
  },
];

export enum TAB_TYPES {
  SETTINGS_CATEGORY = "SETTINGS_CATEGORY",
  CONTENT = "CONTENT",
  COVER = "COVER",
}

export const TAB_TYPE_UI_STATE_NAME_MAPPING = {
  [TAB_TYPES.SETTINGS_CATEGORY]: "currentCategoryTab",
  [TAB_TYPES.CONTENT]: "currentContentTab",
  [TAB_TYPES.COVER]: "currentCoverTab",
} as const;

export enum POPUP_TAB_TYPE {
  SETTINGS = "SETTINGS",
  LYRICS = "LYRICS",
}
