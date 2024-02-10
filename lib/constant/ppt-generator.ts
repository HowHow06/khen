import { convertToTraditional } from "../character-converter";
import {
  ComboboxItemsType,
  HorizontalAlignSettingType,
  PptGenerationSettingMetaType,
  PresetsType,
  ShadowTypeSettingType,
} from "../types";
import { fontFaces } from "./font-face";

export const DEFAULT_GROUPING_NAME = "default" as const;
export const DEFAULT_LINE_COUNT_PER_SLIDE = 2 as const;
export const TEXTBOX_GROUPING_PREFIX = "textboxLine" as const;
export const DEFAULT_AUTHOR = "Khen Ho2" as const;

export const DEFAULT_SUBJECT =
  "Lyrics Presentation - Generated by Khen Ho2 PPT Generator" as const;
export const DEFAULT_TITLE = "PPT Generator Presentation" as const;
export const DEFAULT_PPT_LAYOUT = "LAYOUT_16x9" as const;
export const DEFAULT_FILENAME = "Sample Presentation.pptx" as const;

export const DEFAULT_BASE_OPTION = {
  w: "100%",
  isTextBox: true,
} as const;

export const SETTING_FIELD_TYPE = {
  TEXT: "text",
  BOOLEAN: "boolean",
  NUMBER: "number",
  PERCENTAGE: "percentage",
  IMAGE: "image",
  COLOR: "color",
  FONT: "font",
  HORIZONTAL_ALIGN: "horizontal-align",
  SHADOW_TYPE: "shadow-type",
  TRANSITION: "transition",
} as const;

export const HORIZONTAL_ALIGNMENT = {
  LEFT: "left",
  CENTER: "center",
  RIGHT: "right",
} as const;

export const SHADOW_TYPE = {
  OUTER: "outer",
  INNER: "inner",
} as const;

export const SETTING_CATEGORY = {
  FILE: "file",
  GENERAL: "general",
  SECTION: "section",
  CONTENT: "content",
  COVER: "cover",
  CONTENT_TEXTBOX: "contentTextbox",
} as const;

export const LYRIC_SECTION = {
  SECTION: "----",
  SUBSECTION: "---",
  MAINTITLE: "#",
  SECONDARYTITLE: "##",
  EMPTYSLIDE: "***",
} as const;

export const CUSTOM_PINYIN_MAP_SIMPLIFIED = {
  降服: "xiáng fú",
  得着: "dé zháo",
  差派: "chāi pài",
  朝阳: "zhāo yáng",
  不着: "bù zháo",
  祢: "nǐ",
};

const CUSTOM_PINYIN_MAP = CUSTOM_PINYIN_MAP_SIMPLIFIED as {
  [key: string]: string;
};

Object.entries(CUSTOM_PINYIN_MAP_SIMPLIFIED).map(([text, customPinyin]) => {
  const traditionalText = convertToTraditional(text);
  if (traditionalText != text) {
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

export const PPT_GENERATION_GENERAL_SETTINGS = {
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
  useBackgroundColorWhenEmpty: {
    fieldDisplayName: "Use Background Color for Empty Slides",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
    tips: "If unchecked, background image will be used for empty slides.",
  },
  ignoreSubcontent: {
    fieldDisplayName: "Ignore Secondary Content",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: false,
  },
  useSingleTextbox: {
    fieldDisplayName: "Use Single Textbox",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: false,
    isHidden: true,
  },
  singleLineMode: {
    fieldDisplayName: "Single Line Mode",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: false,
    tips: "If checked, each slide will have only one line of lyric from each main content and secondary content.",
  },
  lineCountPerSlide: {
    fieldDisplayName: "Line Count Per Slide",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    defaultValue: 2,
    isHidden: true, // TODO: to implement
  },
  ignoreSubcontentWhenIdentical: {
    fieldDisplayName: "Ignore Secondary Content when identical",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
    isHidden: true, // TODO: to implement **, khen-38
  },
  transition: {
    fieldDisplayName: "Transition",
    fieldType: SETTING_FIELD_TYPE.TRANSITION,
    isHidden: true, // TODO: implement transition, KHEN-26
    defaultValue: "",
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
    isHidden: true, // TODO: to implement khen-29
  },
} as const;

export const PPT_GENERATION_SECTION_SETTINGS = {
  useMainBackgroundImage: {
    fieldDisplayName: "Use Main Background Image",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
  },
  sectionBackgroundImage: {
    fieldDisplayName: "Section Background Image",
    fieldType: SETTING_FIELD_TYPE.IMAGE,
    isOptional: true,
    defaultValue: null,
  },
  useMainBackgroundColor: {
    fieldDisplayName: "Use Main Background Color",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
  },
  sectionBackgroundColor: {
    fieldDisplayName: "Section Background Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
  },
} as const;

export const PPT_GENERATION_COVER_SETTINGS = {
  coverTitlePositionY: {
    fieldDisplayName: "Position Y (%)",
    fieldType: SETTING_FIELD_TYPE.PERCENTAGE,
    defaultValue: 0,
    groupingName: "position",
    tips: "Percentage distance of the textbox from the slide’s top edge (e.g., 50 represents the middle of the slide).",
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
    groupingName: "text",
  },
  charSpacing: {
    fieldDisplayName: "Character Spacing",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    defaultValue: 2,
    groupingName: "text",
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
    defaultValue: 4,
    groupingName: "glow",
  },
  glowColor: {
    fieldDisplayName: "Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
    groupingName: "glow",
  },
  glowOpacity: {
    fieldDisplayName: "Opacity",
    fieldType: SETTING_FIELD_TYPE.PERCENTAGE,
    defaultValue: 0.25,
    useProportionForm: true,
    groupingName: "glow",
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
  },
  outlineColor: {
    fieldDisplayName: "Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
    groupingName: "outline",
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
    defaultValue: "outer",
    groupingName: "shadow",
  },
  shadowColor: {
    fieldDisplayName: "Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
    groupingName: "shadow",
  },
  shadowBlur: {
    fieldDisplayName: "Blur",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    defaultValue: 3,
    groupingName: "shadow",
  },
  shadowOffset: {
    fieldDisplayName: "Offset",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    defaultValue: 3,
    groupingName: "shadow",
  },
  shadowAngle: {
    fieldDisplayName: "Angle",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    rangeMax: 360,
    defaultValue: 45,
    groupingName: "shadow",
  },
  shadowOpacity: {
    fieldDisplayName: "Opacity",
    fieldType: SETTING_FIELD_TYPE.PERCENTAGE,
    defaultValue: 0.5,
    useProportionForm: true,
    groupingName: "shadow",
  },
} as const;

// NOTE: this is metadata of the available settings for the users
export const PPT_GENERATION_SETTINGS_META: PptGenerationSettingMetaType = {
  [SETTING_CATEGORY.FILE]: PPT_GENERATION_FILE_SETTINGS,
  [SETTING_CATEGORY.GENERAL]: PPT_GENERATION_GENERAL_SETTINGS,
  [SETTING_CATEGORY.SECTION]: PPT_GENERATION_SECTION_SETTINGS,
  [SETTING_CATEGORY.COVER]: PPT_GENERATION_COVER_SETTINGS,
  [SETTING_CATEGORY.CONTENT_TEXTBOX]: PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS,
  [SETTING_CATEGORY.CONTENT]: PPT_GENERATION_CONTENT_SETTINGS,
} as const;

export const FONT_FACES_ITEMS: ComboboxItemsType = Object.entries(
  fontFaces,
).map(([key, font]) => font);

export const HORIZONTAL_ALIGNMENT_ITEMS: ComboboxItemsType<HorizontalAlignSettingType> =
  Object.values(HORIZONTAL_ALIGNMENT).map((alignment) => {
    return {
      value: alignment,
      label: alignment,
    };
  });

export const SHADOW_TYPE_ITEMS: ComboboxItemsType<ShadowTypeSettingType> =
  Object.values(SHADOW_TYPE).map((shadowType) => {
    return {
      value: shadowType,
      label: shadowType,
    };
  });

export const CONTENT_TYPE = {
  MAIN: "main",
  SECONDARY: "secondary",
} as const;

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
