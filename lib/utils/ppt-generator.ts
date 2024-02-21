import jszip from "jszip";
import pptxgenjs from "pptxgenjs";
import { ZodError, ZodSchema } from "zod";
import {
  deepMerge,
  extractNumber,
  getBase64,
  getBlobFromUrl,
  removeIdenticalWords,
  startsWithNumbering,
} from ".";
import {
  CONTENT_TYPE,
  DEFAULT_AUTHOR,
  DEFAULT_BASE_OPTION,
  DEFAULT_FILENAME,
  DEFAULT_GROUPING_NAME,
  DEFAULT_LINE_COUNT_PER_SLIDE,
  DEFAULT_PPT_LAYOUT,
  DEFAULT_SUBJECT,
  DEFAULT_TITLE,
  IMPORTED_SETTING_TYPE,
  LYRIC_SECTION,
  MAIN_SECTION_NAME,
  MASTER_SLIDE_BACKGROUND_COLOR,
  MASTER_SLIDE_BACKGROUND_IMAGE,
  PPT_GENERATION_CONTENT_SETTINGS,
  PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS,
  PPT_GENERATION_COVER_SETTINGS,
  PPT_GENERATION_GENERAL_SETTINGS,
  PPT_GENERATION_SETTINGS_META,
  SECTION_PREFIX,
  SETTING_CATEGORY,
  SETTING_FIELD_TYPE,
  TEXTBOX_GROUPING_PREFIX,
} from "../constant";
import { sectionSettingSchema, settingsSchema } from "../schemas";
import {
  BaseSettingMetaType,
  ContentSettingsType,
  ContentTextboxSettingsType,
  ImportedSettingType,
  InferTypeScriptTypeFromSettingFieldType,
  PptGenerationSettingMetaType,
  PptMainSectionInfo,
  PptSettingsStateType,
  SectionSettingsKeyType,
  SectionSettingsType,
  SettingsValueType,
} from "../types";

export const getInitialValueFromSettings = <T = { [key in string]: any }>({
  settingsMeta,
  hasGrouping = false,
}: {
  settingsMeta: BaseSettingMetaType;
  hasGrouping?: boolean;
}): T => {
  let resultValues: any = {};
  Object.entries(settingsMeta).forEach(([key, setting]) => {
    if (setting.isNotAvailable || setting.defaultValue === undefined) {
      return;
    }

    if (hasGrouping) {
      const grouping = setting.groupingName || DEFAULT_GROUPING_NAME;

      const originalGroupingObject = resultValues[grouping];
      resultValues[grouping] = {
        ...originalGroupingObject,
        [key]: setting.defaultValue,
      };
      return;
    }

    resultValues = {
      ...resultValues,
      [key]: setting.defaultValue,
    };

    return;
  });

  return resultValues;
};

export const getTextboxSettingsInitialValue = ({
  textboxSettings,
  textboxCount = DEFAULT_LINE_COUNT_PER_SLIDE,
}: {
  textboxSettings: BaseSettingMetaType;
  textboxCount: number;
}): ContentTextboxSettingsType => {
  const textBoxInitialState: ContentTextboxSettingsType = {};
  Array.from({ length: textboxCount }).forEach((_, index) => {
    textBoxInitialState[`${TEXTBOX_GROUPING_PREFIX}${index + 1}`] =
      getInitialValueFromSettings({
        settingsMeta: textboxSettings,
      });
  });
  return textBoxInitialState;
};

export const generatePptSettingsInitialState = (
  settings: PptGenerationSettingMetaType,
  textboxCount: number = DEFAULT_LINE_COUNT_PER_SLIDE,
): PptSettingsStateType => {
  const initialState: PptSettingsStateType = {
    [SETTING_CATEGORY.GENERAL]: {},
    [SETTING_CATEGORY.FILE]: {},
    [SETTING_CATEGORY.CONTENT]: {
      [CONTENT_TYPE.MAIN]: {},
      [CONTENT_TYPE.SECONDARY]: {},
    },
    [SETTING_CATEGORY.COVER]: {
      [CONTENT_TYPE.MAIN]: {},
      [CONTENT_TYPE.SECONDARY]: {},
    },
  };

  Object.entries(settings).forEach(([category, settingsMeta]) => {
    switch (category) {
      case SETTING_CATEGORY.GENERAL:
      case SETTING_CATEGORY.FILE:
        initialState[category] = getInitialValueFromSettings({
          settingsMeta,
        });
        break;
      case SETTING_CATEGORY.COVER:
        Object.values(CONTENT_TYPE).forEach((contentType) => {
          initialState[category][contentType] = getInitialValueFromSettings({
            settingsMeta,
          });
        });
        break;
      case SETTING_CATEGORY.CONTENT:
        Object.values(CONTENT_TYPE).forEach((contentType) => {
          initialState[category][contentType] = {
            ...getInitialValueFromSettings({
              settingsMeta,
              hasGrouping: true,
            }),
            ...getTextboxSettingsInitialValue({
              textboxSettings: settings.contentTextbox,
              textboxCount,
            }),
          };
        });
        break;
    }
  });

  return initialState;
};

export const getSectionSettingsInitialValue = ({
  settings,
  textboxCount = DEFAULT_LINE_COUNT_PER_SLIDE,
}: {
  settings: PptGenerationSettingMetaType;
  textboxCount?: number;
}) => {
  const sectionInitialState: SectionSettingsType = {
    [SETTING_CATEGORY.GENERAL]: {},
    [SETTING_CATEGORY.COVER]: {
      [CONTENT_TYPE.MAIN]: {},
      [CONTENT_TYPE.SECONDARY]: {},
    },
    [SETTING_CATEGORY.CONTENT]: {
      [CONTENT_TYPE.MAIN]: {},
      [CONTENT_TYPE.SECONDARY]: {},
    },
  };
  const sectionGeneralSettings = settings.section;
  const coverSettings = settings.cover;
  const contentSettings = settings.content;
  const contentBoxSettings = settings.contentTextbox;

  sectionInitialState[SETTING_CATEGORY.GENERAL] = getInitialValueFromSettings({
    settingsMeta: sectionGeneralSettings,
  });

  Object.values(CONTENT_TYPE).forEach((contentType) => {
    sectionInitialState[SETTING_CATEGORY.COVER][contentType] =
      getInitialValueFromSettings({
        settingsMeta: coverSettings,
      });
    sectionInitialState[SETTING_CATEGORY.CONTENT][contentType] = {
      ...getInitialValueFromSettings({
        settingsMeta: contentSettings,
        hasGrouping: true,
      }),
      ...getTextboxSettingsInitialValue({
        textboxSettings: contentBoxSettings,
        textboxCount,
      }),
    };
  });

  return sectionInitialState;
};

export const getBase64FromImageField = async (
  imageValue: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.IMAGE
  >,
): Promise<string | null> => {
  if (!imageValue) {
    return null;
  }

  let image: string | File | Blob = imageValue;
  if (typeof image === "string") {
    try {
      image = await getBlobFromUrl(image);
    } catch (error) {
      return null;
    }
  }

  return await getBase64(image);
};

const getPptBackgroundProp = async ({
  backgroundColor,
  backgroundImage,
}: {
  backgroundColor: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.COLOR
  >;
  backgroundImage: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.IMAGE
  >;
}): Promise<PptxGenJS.default.BackgroundProps> => {
  const backgroundProp = {
    color: backgroundColor,
  };
  if (!backgroundImage) {
    return backgroundProp;
  }
  const imageBase64 = await getBase64FromImageField(backgroundImage);
  return {
    ...backgroundProp,
    data: imageBase64 as string,
  };
};

function getSectionImageSlideMasterTitle(sectionNumber: number) {
  return `${SECTION_PREFIX}${sectionNumber}_IMAGE`;
}

function getSectionColorSlideMasterTitle(sectionNumber: number) {
  return `${SECTION_PREFIX}${sectionNumber}_COLOR`;
}

function createPresentationInstance({
  author = DEFAULT_AUTHOR,
  subject = DEFAULT_SUBJECT,
  title = DEFAULT_TITLE,
  layout = DEFAULT_PPT_LAYOUT,
  backgroundProp,
  sectionsBackgroundProp,
}: {
  author?: string;
  subject?: string;
  title?: string;
  layout?: string;
  backgroundProp: PptxGenJS.default.BackgroundProps;
  sectionsBackgroundProp?: PptxGenJS.default.BackgroundProps[];
}) {
  let pres = new pptxgenjs();
  pres.author = author;
  pres.subject = subject;
  pres.title = title;
  pres.layout = layout;
  pres.defineSlideMaster({
    title: MASTER_SLIDE_BACKGROUND_IMAGE,
    background: backgroundProp,
  });
  pres.defineSlideMaster({
    title: MASTER_SLIDE_BACKGROUND_COLOR,
    background: { color: backgroundProp.color },
  });
  if (sectionsBackgroundProp) {
    sectionsBackgroundProp.forEach((prop, index) => {
      pres.defineSlideMaster({
        title: getSectionImageSlideMasterTitle(index + 1),
        background: prop,
      });
      pres.defineSlideMaster({
        title: getSectionColorSlideMasterTitle(index + 1),
        background: { color: prop.color },
      });
    });
  }

  return pres;
}

const getIsNewSection = ({
  latestMainSectionInfo,
  sectionName,
}: {
  latestMainSectionInfo: PptMainSectionInfo;
  sectionName: string;
}): boolean => {
  return (
    !!latestMainSectionInfo.sectionName &&
    latestMainSectionInfo.sectionName !== sectionName
  );
};

function createSlidesFromLyrics({
  pres,
  primaryLinesArray,
  secondaryLinesArray,
  settingValues,
}: {
  pres: pptxgenjs;
  primaryLinesArray: string[];
  secondaryLinesArray: string[];
  settingValues: PptSettingsStateType;
}) {
  const {
    general: {
      useBackgroundColorWhenEmpty,
      singleLineMode,
      ignoreSubcontent,
      useDifferentSettingForEachSection,
    },
    section,
  } = settingValues;
  const mainIsBackgroundColorWhenEmpty =
    useBackgroundColorWhenEmpty ??
    PPT_GENERATION_GENERAL_SETTINGS.useBackgroundColorWhenEmpty.defaultValue;
  const mainLinePerSlide = singleLineMode ? 1 : DEFAULT_LINE_COUNT_PER_SLIDE;
  const mainHasSecondaryContent = !ignoreSubcontent;

  let coverCount = 0;
  let pptSectionCount = 0;
  let mainSectionDisplayNumber = 0;
  let mainSectionCount = 0;
  let subsectionCount = 0;
  let currentPptSectionName = "";

  let currentMainSectionInfo: PptMainSectionInfo = {
    sectionName: "",
    startLineIndex: -1,
    endLineIndex: -1,
  };

  const mainSectionsInfo: PptMainSectionInfo[] = [];
  let currentSlide: PptxGenJS.default.Slide | undefined = undefined;

  let currentSectionCoverCount = 0;
  let currentSectionPptSectionCount = 0;
  let currentSectionEmptySlideWeight = 0;
  let currentSectionFillSlideWeight = 0;

  primaryLinesArray.forEach((primaryLine, index) => {
    // 1. check if is main or sub section, just add the section to presentation instance
    const isMainSection = primaryLine.startsWith(`${LYRIC_SECTION.SECTION} `);
    const isSubSection = primaryLine.startsWith(`${LYRIC_SECTION.SUBSECTION} `);
    if (isMainSection || isSubSection) {
      pptSectionCount++;
      subsectionCount = isMainSection ? 0 : subsectionCount + 1;
      const identifier = isMainSection
        ? LYRIC_SECTION.SECTION
        : LYRIC_SECTION.SUBSECTION;
      let sectionName = primaryLine.replace(`${identifier} `, "");
      const hasNumbering = startsWithNumbering(sectionName);

      if (hasNumbering) {
        mainSectionDisplayNumber = extractNumber(sectionName);
      }

      if (!hasNumbering && isMainSection) {
        mainSectionDisplayNumber++;
        sectionName = `${mainSectionDisplayNumber}. ${sectionName}`;
      }

      if (!hasNumbering && isSubSection) {
        sectionName = `${mainSectionDisplayNumber}.${subsectionCount} ${sectionName}`;
      }

      if (
        isMainSection &&
        getIsNewSection({
          latestMainSectionInfo: currentMainSectionInfo,
          sectionName,
        })
      ) {
        currentMainSectionInfo = {
          ...currentMainSectionInfo,
          endLineIndex: index - 1,
        };
        mainSectionsInfo.push(currentMainSectionInfo);
      }

      if (isMainSection) {
        currentMainSectionInfo = {
          sectionName,
          startLineIndex: index,
          endLineIndex: -1,
        };
        mainSectionCount++;
        currentSectionPptSectionCount = 0;
        currentSectionCoverCount = 0;
        currentSectionEmptySlideWeight = 0;
        currentSectionFillSlideWeight = 0;
      }

      currentSectionPptSectionCount++;
      currentPptSectionName = sectionName;
      pres.addSection({ title: sectionName });
      return;
    }

    const currentSectionSetting =
      section?.[`${SECTION_PREFIX}${mainSectionCount}`]; // the main section count starting from 1
    const isUseSectionSettings =
      useDifferentSettingForEachSection &&
      currentSectionSetting &&
      !currentSectionSetting.general?.useMainSectionSettings;

    const isBackgroundColorWhenEmpty = isUseSectionSettings
      ? currentSectionSetting.general?.sectionUseBackgroundColorWhenEmpty ??
        PPT_GENERATION_GENERAL_SETTINGS.useBackgroundColorWhenEmpty.defaultValue
      : mainIsBackgroundColorWhenEmpty;
    const linePerSlide = isUseSectionSettings
      ? currentSectionSetting.general?.sectionSingleLineMode
        ? 1
        : DEFAULT_LINE_COUNT_PER_SLIDE
      : mainLinePerSlide;
    const hasSecondaryContent = isUseSectionSettings
      ? !currentSectionSetting.general?.sectionIgnoreSubcontent
      : mainHasSecondaryContent;

    // Get the current index before manipulating the cover count
    const currentIndex =
      index -
      currentSectionCoverCount -
      currentSectionPptSectionCount -
      (mainSectionsInfo.length > 0
        ? mainSectionsInfo[mainSectionsInfo.length - 1].endLineIndex + 1 // +1 because index starts from 0
        : 0) +
      currentSectionEmptySlideWeight +
      currentSectionFillSlideWeight;
    let currentLine = primaryLine.trim();
    // console.log({
    //   currentIndex,
    //   linePerSlide,
    //   currentLine,
    //   currentSectionEmptySlideWeight,
    //   currentSectionFillSlideWeight,
    // });

    // 2. check if is cover, update current line
    const isCover = primaryLine.startsWith(`${LYRIC_SECTION.MAINTITLE} `);
    if (isCover) {
      coverCount++;
      currentSectionCoverCount++;
      const regex = /^#[^#]*/;
      const mainTitle = currentLine
        .match(regex)?.[0]
        .replace(`${LYRIC_SECTION.MAINTITLE}`, "")
        .trim();
      currentLine = mainTitle || currentLine;
    }
    const isEmptySlide = primaryLine.startsWith(`${LYRIC_SECTION.EMPTYSLIDE}`);
    if (isEmptySlide) {
      const remainder = currentIndex % linePerSlide;
      currentSectionEmptySlideWeight =
        currentSectionEmptySlideWeight + linePerSlide + remainder - 1;
      // weightage of each empty slide should be equal to line per slide + remainder from previous slide - 1 (the 1 is the default increment of index)
      currentLine = "";
    }

    const isFillSlide =
      primaryLine.startsWith(`${LYRIC_SECTION.FILL_SLIDE}`) && !isEmptySlide;
    if (isFillSlide) {
      const remainder = currentIndex % linePerSlide;
      currentSectionFillSlideWeight =
        currentSectionFillSlideWeight + remainder - 1;
      // weightage of each fill slide should be equal to remainder from previous slide - 1 (the 1 is the default increment of index)
      currentLine = "";
    }

    let slide = getWorkingSlide({
      pres,
      currentIndex,
      linePerSlide,
      isCover,
      isEmptyLine: currentLine.trim().length === 0,
      isBackgroundColorWhenEmpty,
      sectionName: currentPptSectionName,
      currentPresSlide: currentSlide,
      isUseSectionColor:
        !!isUseSectionSettings &&
        !currentSectionSetting.general?.useMainBackgroundColor,
      isUseSectionImage:
        !!isUseSectionSettings &&
        !currentSectionSetting.general?.useMainBackgroundImage,
      currentSectionNumber: mainSectionCount,
      isEmptySlideNotation: isEmptySlide,
      isFillSlideNotation: isFillSlide,
    });
    currentSlide = slide; // update current slide

    const textboxNumber = (currentIndex % linePerSlide) + 1;
    const mainContentOption = isUseSectionSettings
      ? currentSectionSetting.content.main
      : settingValues.content.main;
    const mainCoverOption = isUseSectionSettings
      ? currentSectionSetting.cover.main
      : settingValues.cover.main;
    // add primary content
    addTextLineToSlide({
      slide,
      line: currentLine,
      contentOption: mainContentOption,
      coverOption: isCover ? mainCoverOption : undefined,
      textboxKey: `textboxLine${textboxNumber}`,
      settingValues,
    });

    if (hasSecondaryContent) {
      let secondaryLine = secondaryLinesArray[index]?.trim() ?? "";
      const toRemoveIdenticalWords = isUseSectionSettings
        ? currentSectionSetting.general?.sectionIgnoreSubcontentWhenIdentical
        : settingValues.general.ignoreSubcontentWhenIdentical;
      if (toRemoveIdenticalWords) {
        secondaryLine = removeIdenticalWords(secondaryLine, primaryLine);
      }
      if (isCover) {
        const subCoverLineIndex = secondaryLine.indexOf(
          `${LYRIC_SECTION.SECONDARYTITLE} `,
        );
        const hasSecondaryTitle = subCoverLineIndex !== -1;

        secondaryLine = hasSecondaryTitle
          ? secondaryLine.substring(subCoverLineIndex + 3)
          : secondaryLine.replace(`${LYRIC_SECTION.MAINTITLE} `, ""); // use the pinyin if no secondary title
      }
      const secondaryContentOption = isUseSectionSettings
        ? currentSectionSetting.content.secondary
        : settingValues.content.secondary;
      const secondaryCoverOption = isUseSectionSettings
        ? currentSectionSetting.cover.secondary
        : settingValues.cover.secondary;
      addTextLineToSlide({
        slide,
        line: secondaryLine,
        contentOption: secondaryContentOption,
        coverOption: isCover ? secondaryCoverOption : undefined,
        textboxKey: `textboxLine${textboxNumber}`,
        settingValues,
      });
    }

    const isLastLine = index === primaryLinesArray.length - 1;
    if (isLastLine) {
      currentMainSectionInfo = {
        ...currentMainSectionInfo,
        endLineIndex: index,
      };
      mainSectionsInfo.push(currentMainSectionInfo);
    }
  });

  return {
    sectionsInfo: mainSectionsInfo,
  };
}

function getWorkingSlide({
  pres,
  currentIndex,
  linePerSlide,
  isCover,
  sectionName,
  isEmptyLine,
  isBackgroundColorWhenEmpty,
  currentPresSlide,
  isUseSectionColor,
  isUseSectionImage,
  currentSectionNumber,
  isEmptySlideNotation = false,
  isFillSlideNotation = false,
}: {
  pres: pptxgenjs;
  currentIndex: number;
  linePerSlide: number;
  isCover: boolean;
  sectionName: string;
  isEmptyLine: boolean;
  isBackgroundColorWhenEmpty: boolean;
  currentPresSlide?: PptxGenJS.default.Slide;
  isUseSectionColor: boolean;
  isUseSectionImage: boolean;
  currentSectionNumber: number;
  isEmptySlideNotation?: boolean;
  isFillSlideNotation?: boolean;
}): PptxGenJS.default.Slide {
  const isToCreateSlide =
    getIsToCreateNewSlide({
      currentIndex,
      linePerSlide,
      isCover,
    }) ||
    currentPresSlide === undefined ||
    isEmptySlideNotation;

  if (
    isToCreateSlide &&
    isFillSlideNotation &&
    currentPresSlide !== undefined
  ) {
    // When it is fill slide, but naturally it should create a new slide
    // as result, do not create new slide
    return currentPresSlide;
  }

  if (isToCreateSlide) {
    const isUseBackgroundColor = isEmptyLine && isBackgroundColorWhenEmpty;
    const colorMasterSlideToUse = isUseSectionColor
      ? getSectionColorSlideMasterTitle(currentSectionNumber)
      : MASTER_SLIDE_BACKGROUND_COLOR;
    const imageMasterSlideToUse = isUseSectionImage
      ? getSectionImageSlideMasterTitle(currentSectionNumber)
      : MASTER_SLIDE_BACKGROUND_IMAGE;

    const newSlide = pres.addSlide({
      masterName: isUseBackgroundColor
        ? colorMasterSlideToUse
        : imageMasterSlideToUse,
      ...(sectionName && { sectionTitle: sectionName }),
    });
    return newSlide;
  }

  return currentPresSlide;
}

// Function overload signatures, to tell typescript that when hexColor is not undefined, the output must be string
function getColorValue(
  hexColor: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.COLOR
  >,
): string;
function getColorValue(
  hexColor:
    | InferTypeScriptTypeFromSettingFieldType<typeof SETTING_FIELD_TYPE.COLOR>
    | undefined,
): string | undefined;
function getColorValue(
  hexColor:
    | InferTypeScriptTypeFromSettingFieldType<typeof SETTING_FIELD_TYPE.COLOR>
    | undefined,
): string | undefined {
  if (hexColor === undefined) return hexColor;
  return hexColor.replace("#", "");
}

function getTextOptionFromContentSettings({
  contentOption,
  textboxKey,
}: {
  contentOption: ContentSettingsType;
  textboxKey: keyof ContentTextboxSettingsType;
}): PptxGenJS.default.TextPropsOptions {
  const { text, glow, outline, shadow, [textboxKey]: textbox } = contentOption;
  const defaultContent = PPT_GENERATION_CONTENT_SETTINGS;
  const defaultTextbox = PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS;

  let customOption: PptxGenJS.default.TextPropsOptions = {
    x: `${textbox.textboxPositionX || defaultTextbox.textboxPositionX.defaultValue}%`,
    y: `${textbox.textboxPositionY || defaultTextbox.textboxPositionY.defaultValue}%`,
    bold: text?.bold,
    color:
      getColorValue(text?.fontColor) ??
      getColorValue(defaultContent.fontColor.defaultValue),
    fontFace: text?.font ?? defaultContent.font.defaultValue,
    fontSize: text?.fontSize ?? defaultContent.fontSize.defaultValue,
    charSpacing: text?.charSpacing ?? defaultContent.charSpacing.defaultValue,
    align: text?.align ?? defaultContent.align.defaultValue,
  };

  if (glow?.hasGlow) {
    customOption = {
      ...customOption,
      glow: {
        size: glow.glowSize ?? defaultContent.glowSize.defaultValue,
        color:
          getColorValue(glow.glowColor) ??
          getColorValue(defaultContent.glowColor.defaultValue),
        opacity: glow.glowOpacity ?? 0.25,
      },
    };
  }
  if (outline?.hasOutline) {
    customOption = {
      ...customOption,
      outline: {
        size: outline.outlineWeight ?? 1,
        color:
          getColorValue(outline.outlineColor) ??
          getColorValue(defaultContent.outlineColor.defaultValue),
      },
    };
  }

  if (shadow?.hasShadow) {
    customOption = {
      ...customOption,
      shadow: {
        type: shadow.shadowType ?? "outer",
        color:
          getColorValue(shadow.shadowColor) ??
          getColorValue(defaultContent.shadowColor.defaultValue),
        blur: shadow.shadowBlur ?? 3,
        offset: shadow.shadowOffset ?? 3,
        angle: shadow.shadowAngle ?? 45,
        opacity: shadow.shadowOpacity ?? 0.5,
      },
    };
  }
  return customOption;
}

function addTextLineToSlide({
  slide,
  line,
  contentOption,
  coverOption,
  textboxKey,
  settingValues,
}: {
  slide: PptxGenJS.default.Slide;
  line: string;
  contentOption: ContentSettingsType;
  coverOption?: SettingsValueType<typeof PPT_GENERATION_COVER_SETTINGS>;
  textboxKey: keyof ContentTextboxSettingsType;
  settingValues: PptSettingsStateType;
}) {
  let textOption = getTextOptionFromContentSettings({
    contentOption,
    textboxKey,
  });

  if (coverOption) {
    textOption = {
      ...textOption,
      ...{
        y: `${coverOption.coverTitlePositionY || 0}%`,
        fontSize: coverOption.coverTitleFontSize,
        fontFace: coverOption.coverTitleFont,
        color: coverOption.coverTitleFontColor,
      },
    };
  }

  let finalOption: PptxGenJS.default.TextPropsOptions = {
    ...DEFAULT_BASE_OPTION,
    ...textOption,
  };

  slide.addText(line, finalOption);
}

function getIsToCreateNewSlide({
  currentIndex,
  linePerSlide,
  isCover = false,
}: {
  currentIndex: number;
  linePerSlide: number;
  isCover: boolean;
}) {
  const remainder = currentIndex % linePerSlide; //create new slide if remainder is 0
  const isToCreateSlide = remainder === 0;
  return isToCreateSlide || isCover;
}

const parsePptFilename = ({
  filename,
  suffix,
  prefix,
}: {
  filename: string | undefined;
  suffix: string | undefined;
  prefix: string | undefined;
}) => {
  const fileName = filename || DEFAULT_FILENAME;
  const cleanFileName = fileName
    .toString()
    .replace(/\.pptx$/i, "")
    .trim();
  const fileNameSuffix = suffix ? suffix.trim() : "";
  const fileNamePrefix = prefix ? prefix.trim() : "";

  return {
    fileName: fileNamePrefix + cleanFileName + fileNameSuffix + ".pptx",
    cleanFileName,
    fileNamePrefix,
    fileNameSuffix,
  };
};

export const generatePpt = async ({
  settingValues,
  primaryLyric,
  secondaryLyric,
}: {
  settingValues: PptSettingsStateType;
  primaryLyric: string;
  secondaryLyric: string;
}) => {
  const {
    general: {
      separateSectionsToFiles,
      mainBackgroundColor,
      mainBackgroundImage,
      useDifferentSettingForEachSection,
    },
    section,
  } = settingValues;
  const primaryLinesArray = primaryLyric.split("\n");
  const secondaryLinesArray = secondaryLyric.split("\n");

  const mainBackgroundColorToUse =
    mainBackgroundColor ??
    PPT_GENERATION_GENERAL_SETTINGS.mainBackgroundColor.defaultValue;
  const mainBackgroundImageToUse =
    mainBackgroundImage ??
    PPT_GENERATION_GENERAL_SETTINGS.mainBackgroundImage.defaultValue;
  // 1. Get background prop for the presentation
  const mainBackgroundProp = await getPptBackgroundProp({
    backgroundColor: mainBackgroundColorToUse,
    backgroundImage: mainBackgroundImageToUse,
  });

  // 1.1 Get background props for all sections
  const sectionsBackgroundProp: PptxGenJS.default.BackgroundProps[] = [];
  if (useDifferentSettingForEachSection && section) {
    for (const [sectionName, sectionSetting] of Object.entries(section)) {
      const sectionBackgroundColor =
        sectionSetting.general?.sectionBackgroundColor ??
        PPT_GENERATION_GENERAL_SETTINGS.mainBackgroundColor.defaultValue;
      const sectionBackgroundImage =
        sectionSetting.general?.sectionBackgroundImage ??
        PPT_GENERATION_GENERAL_SETTINGS.mainBackgroundImage.defaultValue;

      const backgroundProp = await getPptBackgroundProp({
        backgroundColor: sectionSetting.general?.useMainBackgroundColor
          ? mainBackgroundColorToUse
          : sectionBackgroundColor,
        backgroundImage: sectionSetting.general?.useMainBackgroundImage
          ? mainBackgroundImageToUse
          : sectionBackgroundImage,
      });
      sectionsBackgroundProp.push(backgroundProp);
    }
  }

  // 2. Create a new Presentation instance
  const pres = createPresentationInstance({
    backgroundProp: mainBackgroundProp,
    sectionsBackgroundProp: sectionsBackgroundProp,
  });

  // 3. Create Slides in the Presentation
  const { sectionsInfo } = createSlidesFromLyrics({
    pres,
    primaryLinesArray,
    secondaryLinesArray,
    settingValues,
  });

  // 4. Save the Presentation
  const { fileName, cleanFileName, fileNamePrefix, fileNameSuffix } =
    parsePptFilename({
      filename: settingValues.file.filename,
      prefix: settingValues.file.filenamePrefix,
      suffix: settingValues.file.filenameSuffix,
    });
  if (!separateSectionsToFiles) {
    pres.writeFile({ fileName: fileName });
  }

  // 5. If need to separate ppt by section, recreate each ppt and put into zip
  if (separateSectionsToFiles) {
    var zip = new jszip();
    const fileContent = await pres.write();
    zip.file(fileName, fileContent);

    for (const sectionInfo of sectionsInfo) {
      let tempPres = createPresentationInstance({
        backgroundProp: mainBackgroundProp,
        sectionsBackgroundProp: sectionsBackgroundProp,
      }); // for saving into zip file
      const { sectionName, startLineIndex, endLineIndex } = sectionInfo;
      const tempPrimaryLinesArray = primaryLinesArray.filter(
        (line, index) => index >= startLineIndex && index <= endLineIndex,
      );
      const tempSecondaryLinesArray = secondaryLinesArray.filter(
        (line, index) => index >= startLineIndex && index <= endLineIndex,
      );

      createSlidesFromLyrics({
        pres: tempPres,
        primaryLinesArray: tempPrimaryLinesArray,
        secondaryLinesArray: tempSecondaryLinesArray,
        settingValues,
      });

      const fileContent = await tempPres.write();
      const cleanSectionName =
        sectionName?.replace(/^\d+\.\s+/, "") || "Section"; // remove the numbering in front
      zip.file(
        `${fileNamePrefix}${cleanSectionName}${fileNameSuffix}.pptx`,
        fileContent,
      );
    }

    zip.generateAsync({ type: "blob" }).then(function (content) {
      var link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = cleanFileName + "_files.zip";
      link.click();
    });
  }
};

export const getPreset = (
  presetName: string,
  pptPresets: { [key in string]: PptSettingsStateType },
): PptSettingsStateType | undefined => {
  if (presetName in pptPresets) {
    const defaultInitialState = generatePptSettingsInitialState(
      PPT_GENERATION_SETTINGS_META,
    );
    const resultPreset = deepMerge(defaultInitialState, pptPresets[presetName]);
    return resultPreset;
  }
  return undefined;
};

export const getSectionSettingsFromSettings = (
  preset: PptSettingsStateType,
): SectionSettingsType => {
  const presetGeneralSetting = preset[SETTING_CATEGORY.GENERAL];
  const sectionValues: SectionSettingsType = {
    [SETTING_CATEGORY.GENERAL]: {
      useMainSectionSettings: false,
      useMainBackgroundImage: false,
      sectionBackgroundImage: presetGeneralSetting.mainBackgroundImage,
      useMainBackgroundColor: false,
      sectionBackgroundColor: presetGeneralSetting.mainBackgroundColor,
      sectionUseBackgroundColorWhenEmpty:
        presetGeneralSetting.useBackgroundColorWhenEmpty,
      sectionIgnoreSubcontent: presetGeneralSetting.ignoreSubcontent,
      sectionIgnoreSubcontentWhenIdentical:
        presetGeneralSetting.ignoreSubcontentWhenIdentical,
      sectionSingleLineMode: presetGeneralSetting.singleLineMode,
    },
    [SETTING_CATEGORY.COVER]: preset.cover,
    [SETTING_CATEGORY.CONTENT]: preset.content,
  };

  return sectionValues;
};

export const getSettingValueToApply = ({
  newSettings,
  originalSettings,
  isApplyToSection = false,
  isPreserveUseDifferentSetting = false,
  isToPreserveExistingSectionSetting = true,
  currentSectionName,
}: {
  newSettings: PptSettingsStateType;
  originalSettings: PptSettingsStateType;
  isApplyToSection: boolean;
  isPreserveUseDifferentSetting: boolean;
  isToPreserveExistingSectionSetting: boolean;
  currentSectionName: string;
}) => {
  let settingsToUse = newSettings;
  settingsToUse[SETTING_CATEGORY.FILE] = {
    ...settingsToUse[SETTING_CATEGORY.FILE],
    filename: originalSettings.file.filename,
  };

  if (!isApplyToSection && isToPreserveExistingSectionSetting) {
    // preserve section values
    settingsToUse[SETTING_CATEGORY.SECTION] = {
      ...originalSettings[SETTING_CATEGORY.SECTION],
    };
  } else if (originalSettings[SETTING_CATEGORY.SECTION] !== undefined) {
    // reset section values
    const sectionInitialValue = getSectionSettingsInitialValue({
      settings: PPT_GENERATION_SETTINGS_META,
    });
    const sectionSettings = originalSettings[SETTING_CATEGORY.SECTION] as {
      [key in SectionSettingsKeyType]: SectionSettingsType;
    };
    Object.entries(sectionSettings).forEach(([key, value]) => {
      settingsToUse[SETTING_CATEGORY.SECTION] = {
        ...settingsToUse[SETTING_CATEGORY.SECTION],
        [key]: sectionInitialValue,
      };
    });
  }

  if (!isApplyToSection && isPreserveUseDifferentSetting) {
    settingsToUse[SETTING_CATEGORY.GENERAL] = {
      ...settingsToUse[SETTING_CATEGORY.GENERAL],
      useDifferentSettingForEachSection:
        originalSettings.general.useDifferentSettingForEachSection,
    };
  }

  if (isApplyToSection && currentSectionName !== MAIN_SECTION_NAME) {
    const sectionSettings = getSectionSettingsFromSettings(newSettings);
    const currentSectionValues = originalSettings[SETTING_CATEGORY.SECTION];

    settingsToUse = {
      ...originalSettings,
      [SETTING_CATEGORY.SECTION]: {
        ...currentSectionValues,
        [currentSectionName as SectionSettingsKeyType]: sectionSettings,
      },
    } as PptSettingsStateType;
  }

  return settingsToUse;
};

export const getIsValidToSchema = (json: JSON, schema: ZodSchema): boolean => {
  try {
    schema.parse(json);
    return true;
  } catch (error) {
    if (error instanceof ZodError) {
      return false;
    }
  }
  return false;
};

export const getImportedSettingTypeFromJSON = ({
  json,
}: {
  json: JSON;
}): Promise<ImportedSettingType | null> => {
  return new Promise((resolve, reject) => {
    if (getIsValidToSchema(json, settingsSchema)) {
      resolve(IMPORTED_SETTING_TYPE.FULL_SETTING);
    } else if (getIsValidToSchema(json, sectionSettingSchema)) {
      resolve(IMPORTED_SETTING_TYPE.SECTION);
    }
    resolve(null);
  });
};
