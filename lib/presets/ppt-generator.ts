import {
  CONTENT_TYPE,
  HORIZONTAL_ALIGNMENT,
  SETTING_CATEGORY,
  TEXTBOX_GROUPING_PREFIX,
} from "../constant";
import { PptSettingsStateType } from "../types";

export const onsiteChinesePreset: PptSettingsStateType = {
  [SETTING_CATEGORY.FILE]: {
    filenamePrefix: "",
    filenameSuffix: "",
  },
  [SETTING_CATEGORY.GENERAL]: {
    mainBackgroundImage: null,
    mainBackgroundColor: "#000000",
    separateSectionsToFiles: false,
    useBackgroundColorWhenEmpty: true,
    ignoreSubcontent: false,
    ignoreSubcontentWhenIdentical: true,
    sectionsAutoNumbering: true,
    textboxCountPerContentPerSlide: 2,
  },
  [SETTING_CATEGORY.COVER]: {
    [CONTENT_TYPE.MAIN]: {
      coverTitlePositionY: 30,
      coverTitleFont: "Microsoft YaHei",
      coverTitleFontSize: 80,
      coverTitleFontColor: "#FFFFFF",
    },
    [CONTENT_TYPE.SECONDARY]: {
      coverTitlePositionY: 50,
      coverTitleFont: "Ebrima",
      coverTitleFontSize: 48,
      coverTitleFontColor: "#FFFFFF",
    },
  },
  [SETTING_CATEGORY.CONTENT]: {
    [CONTENT_TYPE.MAIN]: {
      text: {
        bold: true,
        fontColor: "#FFFFFF",
        font: "Microsoft YaHei",
        fontSize: 60,
        charSpacing: 2,
        align: HORIZONTAL_ALIGNMENT.CENTER,
      },
      glow: {
        hasGlow: false,
        glowSize: 7,
        glowColor: "#000000",
        glowOpacity: 0.4,
      },
      outline: {
        hasOutline: false,
        outlineWeight: 0,
        outlineColor: "#000000",
      },
      shadow: {
        hasShadow: true,
        shadowType: "outer",
        shadowColor: "#000000",
        shadowBlur: 3,
        shadowOffset: 3,
        shadowAngle: 45,
        shadowOpacity: 0.5,
      },
      textbox: {
        [`${TEXTBOX_GROUPING_PREFIX}1`]: {
          textboxPositionX: 0,
          textboxPositionY: 26,
        },
        [`${TEXTBOX_GROUPING_PREFIX}2`]: {
          textboxPositionX: 0,
          textboxPositionY: 56,
        },
      },
    },
    [CONTENT_TYPE.SECONDARY]: {
      text: {
        bold: true,
        fontColor: "#ffffff",
        font: "Ebrima",
        fontSize: 31,
        charSpacing: 0,
        align: HORIZONTAL_ALIGNMENT.CENTER,
      },
      glow: {
        hasGlow: false,
        glowSize: 8,
        glowColor: "#000000",
        glowOpacity: 0.4,
      },
      outline: {
        hasOutline: false,
        outlineWeight: 0,
        outlineColor: "#000000",
      },
      shadow: {
        hasShadow: true,
        shadowType: "outer",
        shadowColor: "#000000",
        shadowBlur: 3,
        shadowOffset: 3,
        shadowAngle: 45,
        shadowOpacity: 0.5,
      },
      textbox: {
        [`${TEXTBOX_GROUPING_PREFIX}1`]: {
          textboxPositionX: 0,
          textboxPositionY: 39,
        },
        [`${TEXTBOX_GROUPING_PREFIX}2`]: {
          textboxPositionX: 0,
          textboxPositionY: 69,
        },
      },
    },
  },
};

export const liveChinesePreset: PptSettingsStateType = {
  [SETTING_CATEGORY.FILE]: {
    filenamePrefix: "",
    filenameSuffix: "(live)",
  },
  [SETTING_CATEGORY.GENERAL]: {
    mainBackgroundImage: `/images/background/greenScreenWithBlackCover_v2.png`,
    mainBackgroundColor: "#00FF00",
    separateSectionsToFiles: false,
    useBackgroundColorWhenEmpty: true,
    ignoreSubcontent: false,
    ignoreSubcontentWhenIdentical: true,
    sectionsAutoNumbering: true,
    textboxCountPerContentPerSlide: 1,
  },
  [SETTING_CATEGORY.COVER]: {
    [CONTENT_TYPE.MAIN]: {
      coverTitlePositionY: 84,
      coverTitleFont: "Microsoft YaHei",
      coverTitleFontSize: 34,
      coverTitleFontColor: "#FFFFFF",
    },
    [CONTENT_TYPE.SECONDARY]: {
      coverTitlePositionY: 92,
      coverTitleFont: "Ebrima",
      coverTitleFontSize: 20,
      coverTitleFontColor: "#FFFFFF",
    },
  },
  [SETTING_CATEGORY.CONTENT]: {
    [CONTENT_TYPE.MAIN]: {
      text: {
        bold: true,
        fontColor: "#FFFFFF",
        font: "Microsoft YaHei",
        fontSize: 30,
        charSpacing: 2,
        align: HORIZONTAL_ALIGNMENT.CENTER,
      },
      glow: {
        hasGlow: false,
        glowSize: 7,
        glowColor: "#000000",
        glowOpacity: 0.4,
      },
      outline: {
        hasOutline: false,
        outlineWeight: 0,
        outlineColor: "#000000",
      },
      shadow: {
        hasShadow: true,
        shadowType: "outer",
        shadowColor: "#000000",
        shadowBlur: 3,
        shadowOffset: 3,
        shadowAngle: 45,
        shadowOpacity: 0.5,
      },
      textbox: {
        [`${TEXTBOX_GROUPING_PREFIX}1`]: {
          textboxPositionX: 0,
          textboxPositionY: 84,
        },
        [`${TEXTBOX_GROUPING_PREFIX}2`]: {
          textboxPositionX: 0,
          textboxPositionY: 55,
        },
      },
    },
    [CONTENT_TYPE.SECONDARY]: {
      text: {
        bold: true,
        fontColor: "#ffffff",
        font: "Ebrima",
        fontSize: 18,
        charSpacing: 0,
        align: HORIZONTAL_ALIGNMENT.CENTER,
      },
      glow: {
        hasGlow: false,
        glowSize: 8,
        glowColor: "#000000",
        glowOpacity: 0.4,
      },
      outline: {
        hasOutline: false,
        outlineWeight: 0,
        outlineColor: "#000000",
      },
      shadow: {
        hasShadow: true,
        shadowType: "outer",
        shadowColor: "#000000",
        shadowBlur: 3,
        shadowOffset: 3,
        shadowAngle: 45,
        shadowOpacity: 0.5,
      },
      textbox: {
        [`${TEXTBOX_GROUPING_PREFIX}1`]: {
          textboxPositionX: 0,
          textboxPositionY: 92,
        },
        [`${TEXTBOX_GROUPING_PREFIX}2`]: {
          textboxPositionX: 0,
          textboxPositionY: 65,
        },
      },
    },
  },
};

export const onsiteEnglishPreset: PptSettingsStateType = {
  [SETTING_CATEGORY.FILE]: {
    filenamePrefix: "",
    filenameSuffix: "",
  },
  [SETTING_CATEGORY.GENERAL]: {
    mainBackgroundImage: null,
    mainBackgroundColor: "#000000",
    separateSectionsToFiles: false,
    useBackgroundColorWhenEmpty: true,
    ignoreSubcontent: true,
    ignoreSubcontentWhenIdentical: true,
    sectionsAutoNumbering: true,
    textboxCountPerContentPerSlide: 1,
    lineCountPerTextbox: 2,
  },
  [SETTING_CATEGORY.COVER]: {
    [CONTENT_TYPE.MAIN]: {
      coverTitlePositionY: 44,
      coverTitleFont: "Segoe Print",
      coverTitleFontSize: 72,
      coverTitleFontColor: "#FFFFFF",
    },
    [CONTENT_TYPE.SECONDARY]: {
      coverTitlePositionY: 0,
      coverTitleFont: "Ebrima",
      coverTitleFontSize: 1,
      coverTitleFontColor: "#FFFFFF",
    },
  },
  [SETTING_CATEGORY.CONTENT]: {
    [CONTENT_TYPE.MAIN]: {
      text: {
        bold: true,
        fontColor: "#FFFFFF",
        font: "Ebrima",
        fontSize: 44,
        charSpacing: -1,
        align: HORIZONTAL_ALIGNMENT.CENTER,
        lineSpacingMultiple: 1.5,
      },
      glow: {
        hasGlow: false,
        glowSize: 7,
        glowColor: "#000000",
        glowOpacity: 0.4,
      },
      outline: {
        hasOutline: false,
        outlineWeight: 0,
        outlineColor: "#000000",
      },
      shadow: {
        hasShadow: true,
        shadowType: "outer",
        shadowColor: "#000000",
        shadowBlur: 3,
        shadowOffset: 3,
        shadowAngle: 45,
        shadowOpacity: 0.5,
      },
      textbox: {
        [`${TEXTBOX_GROUPING_PREFIX}1`]: {
          textboxPositionX: 0,
          textboxPositionY: 45,
        },
        [`${TEXTBOX_GROUPING_PREFIX}2`]: {
          textboxPositionX: 0,
          textboxPositionY: 58,
        },
      },
    },
    [CONTENT_TYPE.SECONDARY]: {
      text: {
        bold: true,
        fontColor: "#ffffff",
        font: "Ebrima",
        fontSize: 31,
        charSpacing: 0,
        align: HORIZONTAL_ALIGNMENT.CENTER,
      },
      glow: {
        hasGlow: false,
        glowSize: 7,
        glowColor: "#000000",
        glowOpacity: 0.4,
      },
      outline: {
        hasOutline: false,
        outlineWeight: 0,
        outlineColor: "#000000",
      },
      shadow: {
        hasShadow: true,
        shadowType: "outer",
        shadowColor: "#000000",
        shadowBlur: 3,
        shadowOffset: 3,
        shadowAngle: 45,
        shadowOpacity: 0.5,
      },
      textbox: {
        [`${TEXTBOX_GROUPING_PREFIX}1`]: {
          textboxPositionX: 0,
          textboxPositionY: 39,
        },
        [`${TEXTBOX_GROUPING_PREFIX}2`]: {
          textboxPositionX: 0,
          textboxPositionY: 69,
        },
      },
    },
  },
};

export const liveEnglishPreset: PptSettingsStateType = {
  [SETTING_CATEGORY.FILE]: {
    filenamePrefix: "",
    filenameSuffix: "(live)",
  },
  [SETTING_CATEGORY.GENERAL]: {
    mainBackgroundImage: `/images/background/greenScreenWithBlackCover_v2.png`,
    mainBackgroundColor: "#00FF00",
    separateSectionsToFiles: false,
    useBackgroundColorWhenEmpty: true,
    ignoreSubcontent: true,
    ignoreSubcontentWhenIdentical: true,
    sectionsAutoNumbering: true,
    textboxCountPerContentPerSlide: 1,
  },
  [SETTING_CATEGORY.COVER]: {
    [CONTENT_TYPE.MAIN]: {
      coverTitlePositionY: 87,
      coverTitleFont: "Segoe Print",
      coverTitleFontSize: 32,
      coverTitleFontColor: "#FFFFFF",
    },
    [CONTENT_TYPE.SECONDARY]: {
      coverTitlePositionY: 92,
      coverTitleFont: "Ebrima",
      coverTitleFontSize: 20,
      coverTitleFontColor: "#FFFFFF",
    },
  },
  [SETTING_CATEGORY.CONTENT]: {
    [CONTENT_TYPE.MAIN]: {
      text: {
        bold: true,
        fontColor: "#FFFFFF",
        font: "Ebrima",
        fontSize: 26,
        charSpacing: 0,
        align: HORIZONTAL_ALIGNMENT.CENTER,
      },
      glow: {
        hasGlow: false,
        glowSize: 7,
        glowColor: "#000000",
        glowOpacity: 0.4,
      },
      outline: {
        hasOutline: false,
        outlineWeight: 0,
        outlineColor: "#000000",
      },
      shadow: {
        hasShadow: true,
        shadowType: "outer",
        shadowColor: "#000000",
        shadowBlur: 3,
        shadowOffset: 3,
        shadowAngle: 45,
        shadowOpacity: 0.5,
      },
      textbox: {
        [`${TEXTBOX_GROUPING_PREFIX}1`]: {
          textboxPositionX: 0,
          textboxPositionY: 87,
        },
        [`${TEXTBOX_GROUPING_PREFIX}2`]: {
          textboxPositionX: 0,
          textboxPositionY: 0,
        },
      },
    },
    [CONTENT_TYPE.SECONDARY]: {
      text: {
        bold: true,
        fontColor: "#ffffff",
        font: "Ebrima",
        fontSize: 18,
        charSpacing: 0,
        align: HORIZONTAL_ALIGNMENT.CENTER,
      },
      glow: {
        hasGlow: false,
        glowSize: 7,
        glowColor: "#000000",
        glowOpacity: 0.4,
      },
      outline: {
        hasOutline: false,
        outlineWeight: 0,
        outlineColor: "#000000",
      },
      shadow: {
        hasShadow: true,
        shadowType: "outer",
        shadowColor: "#000000",
        shadowBlur: 3,
        shadowOffset: 3,
        shadowAngle: 45,
        shadowOpacity: 0.5,
      },
      textbox: {
        [`${TEXTBOX_GROUPING_PREFIX}1`]: {
          textboxPositionX: 0,
          textboxPositionY: 92,
        },
        [`${TEXTBOX_GROUPING_PREFIX}2`]: {
          textboxPositionX: 0,
          textboxPositionY: 65,
        },
      },
    },
  },
};
