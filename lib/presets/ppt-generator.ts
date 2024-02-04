import { CONTENT_TYPE, SETTING_CATEGORY } from "../constant";

export const onsiteChinesePreset = {
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
    // ignoreSubcontentWhenIdentical: true,
    sectionsAutoNumbering: true,
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
        align: "center",
      },
      glow: {
        hasGlow: false,
        glowSize: 0,
        glowColor: "#000000",
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
      textboxLine1: {
        textboxPositionX: 0,
        textboxPositionY: 26,
      },
      textboxLine2: {
        textboxPositionX: 0,
        textboxPositionY: 56,
      },
    },
    [CONTENT_TYPE.SECONDARY]: {
      text: {
        bold: true,
        fontColor: "#ffffff",
        font: "Ebrima",
        fontSize: 31,
        charSpacing: 0,
        align: "center",
      },
      glow: {
        hasGlow: false,
        glowSize: 0,
        glowColor: "#000000",
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
      textboxLine1: {
        textboxPositionX: 0,
        textboxPositionY: 39,
      },
      textboxLine2: {
        textboxPositionX: 0,
        textboxPositionY: 69,
      },
    },
  },
};
