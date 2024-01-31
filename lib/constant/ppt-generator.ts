import { convertToTraditional } from "../character-converter";
import {
  BaseSettingMetaType,
  ComboboxItemsType,
  HorizontalAlignSettingType,
  PptGenerationSettingMetaType,
  ShadowTypeSettingType,
} from "../types";
import { fontFaces } from "./font-face";

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

const PPT_GENERATION_FILE_SETTINGS: BaseSettingMetaType = {
  filename: {
    fieldSlug: "filename",
    fieldDisplayName: "File Name", // TODO: change display name to special syntax to match internalization
    fieldType: SETTING_FIELD_TYPE.TEXT,
  },
  filenamePrefix: {
    fieldSlug: "filenamePrefix",
    fieldDisplayName: "File Name Prefix",
    fieldType: SETTING_FIELD_TYPE.TEXT,
  },
  filenameSuffix: {
    fieldSlug: "filenameSuffix",
    fieldDisplayName: "File Name Suffix",
    fieldType: SETTING_FIELD_TYPE.TEXT,
  },
};

const PPT_GENERATION_GENERAL_SETTINGS: BaseSettingMetaType = {
  mainBackgroundImage: {
    fieldSlug: "mainBackgroundImage",
    fieldDisplayName: "Main Background Image",
    fieldType: SETTING_FIELD_TYPE.IMAGE,
  },
  mainBackgroundColor: {
    fieldSlug: "mainBackgroundColor",
    fieldDisplayName: "Main Background Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
  },
  separateSectionsToFiles: {
    fieldSlug: "separateSectionsToFiles",
    fieldDisplayName: "Separate Sections Into Different Files",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: false,
  },
  useBackgroundColorWhenEmpty: {
    fieldSlug: "useBackgroundColorWhenEmpty",
    fieldDisplayName: "Use Background Color for Empty Slides",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
  },
  ignoreSubcontent: {
    fieldSlug: "ignoreSubcontent",
    fieldDisplayName: "Ignore Secondary Content",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: false,
  },
  useSingleTextbox: {
    fieldSlug: "useSingleTextbox",
    fieldDisplayName: "Use Single Textbox",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: false,
    isHidden: true,
  },
  singleLineMode: {
    fieldSlug: "singleLineMode",
    fieldDisplayName: "Single Line Mode",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: false,
  },
  lineCountPerSlide: {
    fieldSlug: "lineCountPerSlide",
    fieldDisplayName: "Line Count Per Slide",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    defaultValue: 2,
    isHidden: true, // TODO: to implement
  },
  ignoreSubcontentWhenIdentical: {
    fieldSlug: "ignoreSubcontentWhenIdentical",
    fieldDisplayName: "Ignore Secondary Content when identical",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
  },
  transition: {
    fieldSlug: "transition",
    fieldDisplayName: "Transition",
    fieldType: SETTING_FIELD_TYPE.TRANSITION,
    isHidden: true, // TODO: implement transition, KHEN-26
  },
  sectionsAutoNumbering: {
    fieldSlug: "sectionsAutoNumbering",
    fieldDisplayName: "Section Auto Numbering",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
  },
  useDifferentSettingForEachSection: {
    fieldSlug: "useDifferentSettingForEachSection",
    fieldDisplayName: "Use Different Setting for Each Section",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: false,
    isHidden: true, // TODO: khen-29
  },
};

const PPT_GENERATION_SECTION_SETTINGS: BaseSettingMetaType = {
  useMainBackgroundImage: {
    fieldSlug: "useMainBackgroundImage",
    fieldDisplayName: "Use Main Background Image",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
  },
  sectionBackgroundImage: {
    fieldSlug: "sectionBackgroundImage",
    fieldDisplayName: "Section Background Image",
    fieldType: SETTING_FIELD_TYPE.IMAGE,
  },
  useMainBackgroundColor: {
    fieldSlug: "useMainBackgroundColor",
    fieldDisplayName: "Use Main Background Color",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
  },
  sectionBackgroundColor: {
    fieldSlug: "sectionBackgroundColor",
    fieldDisplayName: "Section Background Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
  },
};

const PPT_GENERATION_COVER_SETTINGS: BaseSettingMetaType = {
  coverTitlePositionY: {
    fieldSlug: "coverTitlePositionY",
    fieldDisplayName: "Position Y",
    fieldType: SETTING_FIELD_TYPE.PERCENTAGE,
    groupingName: "position",
  },
  coverTitleFont: {
    fieldSlug: "coverTitleFont",
    fieldDisplayName: "Font",
    fieldType: SETTING_FIELD_TYPE.FONT,
    defaultValue: fontFaces.MicrosoftYaHei.value,
    groupingName: "style",
  },
  coverTitleFontSize: {
    fieldSlug: "coverTitleFontSize",
    fieldDisplayName: "Font Size",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    groupingName: "style",
  },
  coverTitleFontColor: {
    fieldSlug: "coverTitleFontColor",
    fieldDisplayName: "Font Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
  },
};

const PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS: BaseSettingMetaType = {
  textboxPositionX: {
    fieldSlug: "textboxPositionX",
    fieldDisplayName: "Position X",
    fieldType: SETTING_FIELD_TYPE.PERCENTAGE,
  },
  textboxPositionY: {
    fieldSlug: "textboxPositionY",
    fieldDisplayName: "Position Y",
    fieldType: SETTING_FIELD_TYPE.PERCENTAGE,
  },
};

const PPT_GENERATION_CONTENT_SETTINGS: BaseSettingMetaType = {
  bold: {
    fieldSlug: "bold",
    fieldDisplayName: "Bold",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
    groupingName: "text",
  },
  fontColor: {
    fieldSlug: "fontColor",
    fieldDisplayName: "Font Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
    groupingName: "text",
  },
  font: {
    fieldSlug: "font",
    fieldDisplayName: "Font Face",
    fieldType: SETTING_FIELD_TYPE.FONT,
    defaultValue: fontFaces.MicrosoftYaHei.value,
    groupingName: "text",
  },
  charSpacing: {
    fieldSlug: "charSpacing",
    fieldDisplayName: "Character Spacing",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    groupingName: "text",
  },
  align: {
    fieldSlug: "align",
    fieldDisplayName: "Align",
    fieldType: SETTING_FIELD_TYPE.HORIZONTAL_ALIGN,
    defaultValue: HORIZONTAL_ALIGNMENT.CENTER,
    groupingName: "text",
  },
  hasGlow: {
    fieldSlug: "hasGlow",
    fieldDisplayName: "Enable Glow",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: false,
    groupingName: "glow",
  },
  glowSize: {
    fieldSlug: "glowSize",
    fieldDisplayName: "Size",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    groupingName: "glow",
  },
  glowColor: {
    fieldSlug: "glowColor",
    fieldDisplayName: "Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
    groupingName: "glow",
  },
  hasOutline: {
    fieldSlug: "hasOutline",
    fieldDisplayName: "Enable Outline",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: false,
    groupingName: "outline",
  },
  outlineWeight: {
    fieldSlug: "outlineWeight",
    fieldDisplayName: "Weight",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    groupingName: "outline",
  },
  outlineColor: {
    fieldSlug: "outlineColor",
    fieldDisplayName: "Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
    groupingName: "outline",
  },
  hasShadow: {
    fieldSlug: "hasShadow",
    fieldDisplayName: "Enable Shadow",
    fieldType: SETTING_FIELD_TYPE.BOOLEAN,
    defaultValue: true,
    groupingName: "shadow",
  },
  shadowType: {
    fieldSlug: "shadowType",
    fieldDisplayName: "Type",
    fieldType: SETTING_FIELD_TYPE.SHADOW_TYPE,
    defaultValue: "outer",
    groupingName: "shadow",
  },
  shadowColor: {
    fieldSlug: "shadowColor",
    fieldDisplayName: "Color",
    fieldType: SETTING_FIELD_TYPE.COLOR,
    defaultValue: "#000000",
    groupingName: "shadow",
  },
  shadowBlur: {
    fieldSlug: "shadowBlur",
    fieldDisplayName: "Blur",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    groupingName: "shadow",
  },
  shadowOffset: {
    fieldSlug: "shadowOffset",
    fieldDisplayName: "Offset",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    groupingName: "shadow",
  },
  shadowAngle: {
    fieldSlug: "shadowAngle",
    fieldDisplayName: "Angle",
    fieldType: SETTING_FIELD_TYPE.NUMBER,
    rangeMax: 359,
    groupingName: "shadow",
  },
  shadowOpacity: {
    fieldSlug: "shadowOpacity",
    fieldDisplayName: "Opacity",
    fieldType: SETTING_FIELD_TYPE.PERCENTAGE,
    useProportionForm: true,
    groupingName: "shadow",
  },
};

// NOTE: this is metadata of the available settings for the users
export const PPT_GENERATION_SETTINGS_META: PptGenerationSettingMetaType = {
  [SETTING_CATEGORY.FILE]: PPT_GENERATION_FILE_SETTINGS,
  [SETTING_CATEGORY.GENERAL]: PPT_GENERATION_GENERAL_SETTINGS,
  [SETTING_CATEGORY.SECTION]: PPT_GENERATION_SECTION_SETTINGS,
  [SETTING_CATEGORY.COVER]: PPT_GENERATION_COVER_SETTINGS,
  [SETTING_CATEGORY.CONTENT_TEXTBOX]: PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS,
  [SETTING_CATEGORY.CONTENT]: PPT_GENERATION_CONTENT_SETTINGS,
};

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
