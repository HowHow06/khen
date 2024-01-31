import { convertToTraditional } from "../character-converter";
import {
  BaseSettingMetaType,
  ComboboxItemsType,
  HorizontalAlignSettingType,
  PptGenerationSettingMetaType,
  ShadowTypeSettingType,
} from "../types";
import { fontFaces } from "./font-face";

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
    fieldType: "text",
  },
  filenamePrefix: {
    fieldSlug: "filename-prefix",
    fieldDisplayName: "File Name Prefix",
    fieldType: "text",
  },
  filenameSuffix: {
    fieldSlug: "filename-suffix",
    fieldDisplayName: "File Name Suffix",
    fieldType: "text",
  },
};

const PPT_GENERATION_GENERAL_SETTINGS: BaseSettingMetaType = {
  mainBackgroundImage: {
    fieldSlug: "main-background-image",
    fieldDisplayName: "Main Background Image",
    fieldType: "image",
  },
  mainBackgroundColor: {
    fieldSlug: "main-background-color",
    fieldDisplayName: "Main Background Color",
    fieldType: "color",
    defaultValue: "#000000",
  },
  separateSectionsToFiles: {
    fieldSlug: "separate-sections-to-files",
    fieldDisplayName: "Separate Sections Into Different Files",
    fieldType: "boolean",
    defaultValue: false,
  },
  useBackgroundColorWhenEmpty: {
    fieldSlug: "use-background-color-when-empty",
    fieldDisplayName: "Use Background Color for Empty Slides",
    fieldType: "boolean",
    defaultValue: true,
  },
  ignoreSubcontent: {
    fieldSlug: "ignore-subcontent",
    fieldDisplayName: "Ignore Secondary Content",
    fieldType: "boolean",
    defaultValue: false,
  },
  useSingleTextbox: {
    fieldSlug: "use-single-textbox",
    fieldDisplayName: "Use Single Textbox",
    fieldType: "boolean",
    defaultValue: false,
    isHidden: true,
  },
  singleLineMode: {
    fieldSlug: "single-line-mode",
    fieldDisplayName: "Single Line Mode",
    fieldType: "boolean",
    defaultValue: false,
  },
  lineCountPerSlide: {
    fieldSlug: "line-count-per-slide",
    fieldDisplayName: "Line Count Per Slide",
    fieldType: "number",
    defaultValue: 2,
    isHidden: true, // TODO: to implement
  },
  ignoreSubcontentWhenIdentical: {
    fieldSlug: "ignore-subcontent-when-identical",
    fieldDisplayName: "Ignore Secondary Content when identical",
    fieldType: "boolean",
    defaultValue: true,
  },
  transition: {
    fieldSlug: "transition",
    fieldDisplayName: "Transition",
    fieldType: "transition",
    isHidden: true, // TODO: implement transition, KHEN-26
  },
  sectionsAutoNumbering: {
    fieldSlug: "sections-auto-numbering",
    fieldDisplayName: "Section Auto Numbering",
    fieldType: "boolean",
    defaultValue: true,
  },
  useDifferentSettingForEachSection: {
    fieldSlug: "use-different-setting-for-each-section",
    fieldDisplayName: "Use Different Setting for Each Section",
    fieldType: "boolean",
    defaultValue: false,
    isHidden: true, // TODO: khen-29
  },
};

const PPT_GENERATION_SECTION_SETTINGS: BaseSettingMetaType = {
  useMainBackgroundImage: {
    fieldSlug: "use-main-background-image",
    fieldDisplayName: "Use Main Background Image",
    fieldType: "boolean",
    defaultValue: true,
  },
  sectionBackgroundImage: {
    fieldSlug: "section-background-image",
    fieldDisplayName: "Section Background Image",
    fieldType: "image",
  },
  useMainBackgroundColor: {
    fieldSlug: "use-main-background-color",
    fieldDisplayName: "Use Main Background Color",
    fieldType: "boolean",
    defaultValue: true,
  },
  sectionBackgroundColor: {
    fieldSlug: "section-background-color",
    fieldDisplayName: "Section Background Color",
    fieldType: "color",
    defaultValue: "#000000",
  },
};

const PPT_GENERATION_COVER_SETTINGS: BaseSettingMetaType = {
  coverTitlePositionY: {
    fieldSlug: "cover-title-position-y",
    fieldDisplayName: "Position Y",
    fieldType: "percentage",
    groupingName: "position",
  },
  coverTitleFont: {
    fieldSlug: "cover-title-font",
    fieldDisplayName: "Font",
    fieldType: "font",
    defaultValue: fontFaces.MicrosoftYaHei.value,
    groupingName: "style",
  },
  coverTitleFontSize: {
    fieldSlug: "cover-title-font-size",
    fieldDisplayName: "Font Size",
    fieldType: "number",
    groupingName: "style",
  },
  coverTitleFontColor: {
    fieldSlug: "cover-title-font-color",
    fieldDisplayName: "Font Color",
    fieldType: "color",
    defaultValue: "#000000",
  },
};

const PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS: BaseSettingMetaType = {
  textboxPositionX: {
    fieldSlug: "textbox-position-x",
    fieldDisplayName: "Position X",
    fieldType: "percentage",
  },
  textboxPositionY: {
    fieldSlug: "textbox-position-y",
    fieldDisplayName: "Position Y",
    fieldType: "percentage",
  },
};

const PPT_GENERATION_CONTENT_SETTINGS: BaseSettingMetaType = {
  bold: {
    fieldSlug: "bold",
    fieldDisplayName: "Bold",
    fieldType: "boolean",
    defaultValue: true,
    groupingName: "text",
  },
  fontColor: {
    fieldSlug: "font-color",
    fieldDisplayName: "Font Color",
    fieldType: "color",
    defaultValue: "#000000",
    groupingName: "text",
  },
  font: {
    fieldSlug: "font",
    fieldDisplayName: "Font Face",
    fieldType: "font",
    defaultValue: fontFaces.MicrosoftYaHei.value,
    groupingName: "text",
  },
  charSpacing: {
    fieldSlug: "char-spacing",
    fieldDisplayName: "Character Spacing",
    fieldType: "number",
    groupingName: "text",
  },
  align: {
    fieldSlug: "align",
    fieldDisplayName: "Align",
    fieldType: "horizontal-align",
    groupingName: "text",
  },
  hasGlow: {
    fieldSlug: "has-glow",
    fieldDisplayName: "Enable Glow",
    fieldType: "boolean",
    defaultValue: false,
    groupingName: "glow",
  },
  glowSize: {
    fieldSlug: "glow-size",
    fieldDisplayName: "Size",
    fieldType: "number",
    groupingName: "glow",
  },
  glowColor: {
    fieldSlug: "glow-color",
    fieldDisplayName: "Color",
    fieldType: "color",
    defaultValue: "#000000",
    groupingName: "glow",
  },
  hasOutline: {
    fieldSlug: "has-outline",
    fieldDisplayName: "Enable Outline",
    fieldType: "boolean",
    defaultValue: false,
    groupingName: "outline",
  },
  outlineWeight: {
    fieldSlug: "outline-weight",
    fieldDisplayName: "Weight",
    fieldType: "number",
    groupingName: "outline",
  },
  outlineColor: {
    fieldSlug: "outline-color",
    fieldDisplayName: "Color",
    fieldType: "color",
    defaultValue: "#000000",
    groupingName: "outline",
  },
  hasShadow: {
    fieldSlug: "has-shadow",
    fieldDisplayName: "Enable Shadow",
    fieldType: "boolean",
    defaultValue: true,
    groupingName: "shadow",
  },
  shadowType: {
    fieldSlug: "shadow-type",
    fieldDisplayName: "Type",
    fieldType: "shadow-type",
    defaultValue: "outer",
    groupingName: "shadow",
  },
  shadowColor: {
    fieldSlug: "shadow-color",
    fieldDisplayName: "Color",
    fieldType: "color",
    defaultValue: "#000000",
    groupingName: "shadow",
  },
  shadowBlur: {
    fieldSlug: "shadow-blur",
    fieldDisplayName: "Blur",
    fieldType: "number",
    groupingName: "shadow",
  },
  shadowOffset: {
    fieldSlug: "shadow-offset",
    fieldDisplayName: "Offset",
    fieldType: "number",
    groupingName: "shadow",
  },
  shadowAngle: {
    fieldSlug: "shadow-angle",
    fieldDisplayName: "Angle",
    fieldType: "number",
    rangeMax: 359,
    groupingName: "shadow",
  },
  shadowOpacity: {
    fieldSlug: "shadow-opacity",
    fieldDisplayName: "Opacity",
    fieldType: "percentage",
    useIndexRepresentation: true,
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
