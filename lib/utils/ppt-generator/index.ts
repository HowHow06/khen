import {
  CONTENT_TYPE,
  DEFAULT_AUTHOR,
  DEFAULT_BASE_OPTION,
  DEFAULT_FILENAME,
  DEFAULT_GROUPING_NAME,
  DEFAULT_LINE_COUNT_PER_TEXTBOX,
  DEFAULT_PPT_LAYOUT,
  DEFAULT_SUBJECT,
  DEFAULT_TEXTBOX_COUNT_PER_SLIDE,
  DEFAULT_TITLE,
  IMPORTED_SETTING_TYPE,
  LYRIC_SECTION,
  MAIN_SECTION_NAME,
  MASTER_SLIDE_BACKGROUND_COLOR,
  MASTER_SLIDE_BACKGROUND_IMAGE,
  PPT_GENERATION_COMBINED_GENERAL_SETTINGS,
  PPT_GENERATION_CONTENT_SETTINGS,
  PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS,
  PPT_GENERATION_COVER_SETTINGS,
  PPT_GENERATION_SETTINGS_META,
  PPT_GENERATION_SHARED_GENERAL_SETTINGS,
  SECTION_PREFIX,
  SETTING_CATEGORY,
  SETTING_FIELD_TYPE,
  TEXTBOX_GROUPING_PREFIX,
} from "@/lib/constant";
import { BREAK_LINE } from "@/lib/constant/general";
import {
  InternalPresentation,
  InternalText,
  InternalTextPartBaseStyle,
} from "@/lib/react-pptx-preview/normalizer";
import { sectionSettingSchema, settingsSchema } from "@/lib/schemas";
import {
  BaseSettingItemMetaType,
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
} from "@/lib/types";
import type { PptxGenJS as PptxGenJSType2 } from "@/lib/types/pptxgenjs";
import {
  DataOrPathProps,
  ObjectOptions,
} from "@/lib/types/pptxgenjs/core-interfaces";
import {
  deepCopy,
  deepMerge,
  extractNumber,
  getBase64,
  getBlobFromUrl,
  removeIdenticalWords,
  startsWithNumbering,
} from "@/lib/utils";
import jszip from "jszip";
import pptxgenjs from "pptxgenjs";
import { ZodError, ZodSchema } from "zod";

export const getInitialValuesFromSettings = <T = { [key in string]: any }>({
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
      if (resultValues[grouping] === undefined) {
        resultValues[grouping] = {};
      }
      resultValues[grouping][key] = setting.defaultValue;
      return;
    }

    resultValues[key] = setting.defaultValue;

    return;
  });

  return resultValues;
};

export const getTextboxSettingsInitialValues = ({
  textboxSettingsMeta,
  textboxCount = DEFAULT_TEXTBOX_COUNT_PER_SLIDE,
}: {
  textboxSettingsMeta: BaseSettingMetaType;
  textboxCount: number;
}): ContentTextboxSettingsType => {
  const textBoxInitialState: ContentTextboxSettingsType = {};
  Array.from({ length: textboxCount }).forEach((_, index) => {
    textBoxInitialState[`${TEXTBOX_GROUPING_PREFIX}${index + 1}`] =
      getInitialValuesFromSettings({
        settingsMeta: textboxSettingsMeta,
      });
  });
  return textBoxInitialState;
};

export const generatePptSettingsInitialState = (
  settings: PptGenerationSettingMetaType,
  textboxCount: number = DEFAULT_TEXTBOX_COUNT_PER_SLIDE,
): PptSettingsStateType => {
  const initialState: PptSettingsStateType = {
    [SETTING_CATEGORY.GENERAL]: {},
    [SETTING_CATEGORY.FILE]: {},
    [SETTING_CATEGORY.CONTENT]: {
      [CONTENT_TYPE.MAIN]: {
        textbox: {},
      },
      [CONTENT_TYPE.SECONDARY]: {
        textbox: {},
      },
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
        initialState[category] = getInitialValuesFromSettings({
          settingsMeta,
        });
        break;
      case SETTING_CATEGORY.COVER:
        Object.values(CONTENT_TYPE).forEach((contentType) => {
          initialState[category][contentType] = getInitialValuesFromSettings({
            settingsMeta,
          });
        });
        break;
      case SETTING_CATEGORY.CONTENT:
        Object.values(CONTENT_TYPE).forEach((contentType) => {
          initialState[category][contentType] = {
            ...getInitialValuesFromSettings({
              settingsMeta,
              hasGrouping: true,
            }),
            textbox: getTextboxSettingsInitialValues({
              textboxSettingsMeta: settings.contentTextbox,
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
  textboxCount = DEFAULT_TEXTBOX_COUNT_PER_SLIDE,
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
      [CONTENT_TYPE.MAIN]: {
        textbox: {},
      },
      [CONTENT_TYPE.SECONDARY]: {
        textbox: {},
      },
    },
  };
  const sectionGeneralSettings = settings.section;
  const coverSettings = settings.cover;
  const contentSettings = settings.content;
  const contentBoxSettings = settings.contentTextbox;

  sectionInitialState[SETTING_CATEGORY.GENERAL] = getInitialValuesFromSettings({
    settingsMeta: sectionGeneralSettings,
  });

  Object.values(CONTENT_TYPE).forEach((contentType) => {
    sectionInitialState[SETTING_CATEGORY.COVER][contentType] =
      getInitialValuesFromSettings({
        settingsMeta: coverSettings,
      });
    sectionInitialState[SETTING_CATEGORY.CONTENT][contentType] = {
      ...getInitialValuesFromSettings({
        settingsMeta: contentSettings,
        hasGrouping: true,
      }),
      textbox: getTextboxSettingsInitialValues({
        textboxSettingsMeta: contentBoxSettings,
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
  sectionsBackgroundProp?: (PptxGenJS.default.BackgroundProps | null)[];
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
      if (prop === null) {
        return;
      }
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

function getIsNormalLine(line: string): boolean {
  for (const key in LYRIC_SECTION) {
    const syntax = LYRIC_SECTION[key as keyof typeof LYRIC_SECTION];
    if (line.startsWith(syntax)) {
      return false;
    }
  }
  return true;
}

const getDerivedVariablesFromSettings = (
  settingValues: PptSettingsStateType,
) => {
  const {
    general: {
      useBackgroundColorWhenEmpty,
      textboxCountPerContentPerSlide,
      ignoreSubcontent,
      useDifferentSettingForEachSection,
      lineCountPerTextbox,
    },
    section,
  } = settingValues;
  const mainIsBackgroundColorWhenEmpty =
    useBackgroundColorWhenEmpty ??
    PPT_GENERATION_COMBINED_GENERAL_SETTINGS.useBackgroundColorWhenEmpty
      .defaultValue;
  const mainTextboxCountPerSlide =
    textboxCountPerContentPerSlide ?? DEFAULT_TEXTBOX_COUNT_PER_SLIDE;
  const mainLinePerTextbox =
    lineCountPerTextbox ?? DEFAULT_LINE_COUNT_PER_TEXTBOX;
  const mainHasSecondaryContent = !ignoreSubcontent;

  return {
    mainIsBackgroundColorWhenEmpty,
    mainTextboxCountPerSlide,
    mainLinePerTextbox,
    mainHasSecondaryContent,
    useDifferentSettingForEachSection,
    section,
  };
};

const getDerivedVariablesFromSectionSettings = ({
  settingValues,
  currentSectionSetting,
}: {
  settingValues: PptSettingsStateType;
  currentSectionSetting: SectionSettingsType;
}) => {
  const {
    mainIsBackgroundColorWhenEmpty,
    mainTextboxCountPerSlide,
    mainLinePerTextbox,
    mainHasSecondaryContent,
    useDifferentSettingForEachSection,
  } = getDerivedVariablesFromSettings(settingValues);

  const isUseSectionSettings =
    useDifferentSettingForEachSection === true &&
    !currentSectionSetting.general?.useMainSectionSettings;

  const isBackgroundColorWhenEmpty = isUseSectionSettings
    ? currentSectionSetting.general?.useBackgroundColorWhenEmpty ??
      PPT_GENERATION_COMBINED_GENERAL_SETTINGS.useBackgroundColorWhenEmpty
        .defaultValue
    : mainIsBackgroundColorWhenEmpty;
  const hasSecondaryContent = isUseSectionSettings
    ? !currentSectionSetting.general?.ignoreSubcontent
    : mainHasSecondaryContent;
  const linePerTextbox = isUseSectionSettings
    ? currentSectionSetting.general?.lineCountPerTextbox ??
      DEFAULT_LINE_COUNT_PER_TEXTBOX
    : mainLinePerTextbox;
  const textboxCountPerSlide = isUseSectionSettings
    ? currentSectionSetting.general?.textboxCountPerContentPerSlide ??
      DEFAULT_TEXTBOX_COUNT_PER_SLIDE
    : mainTextboxCountPerSlide;

  const isUseSectionColor =
    isUseSectionSettings &&
    !currentSectionSetting.general?.useMainBackgroundColor;
  const isUseSectionImage =
    isUseSectionSettings &&
    !currentSectionSetting.general?.useMainBackgroundImage;

  const mainContentOption = isUseSectionSettings
    ? currentSectionSetting.content.main
    : settingValues.content.main;
  const mainCoverOption = isUseSectionSettings
    ? currentSectionSetting.cover.main
    : settingValues.cover.main;

  const toRemoveIdenticalWords =
    hasSecondaryContent && isUseSectionSettings
      ? currentSectionSetting.general?.ignoreSubcontentWhenIdentical
      : settingValues.general.ignoreSubcontentWhenIdentical;

  const secondaryContentOption =
    hasSecondaryContent && isUseSectionSettings
      ? currentSectionSetting.content.secondary
      : settingValues.content.secondary;
  const secondaryCoverOption =
    hasSecondaryContent && isUseSectionSettings
      ? currentSectionSetting.cover.secondary
      : settingValues.cover.secondary;
  const totalLineCountPerSlide = linePerTextbox * textboxCountPerSlide;

  return {
    isBackgroundColorWhenEmpty,
    hasSecondaryContent,
    linePerTextbox,
    isUseSectionColor,
    isUseSectionImage,
    mainContentOption,
    mainCoverOption,
    toRemoveIdenticalWords,
    secondaryContentOption,
    secondaryCoverOption,
    totalLineCountPerSlide,
  };
};

const getPresSections = (pres: pptxgenjs) => {
  return (pres as unknown as PptxGenJSType2).sections;
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
  const { useDifferentSettingForEachSection, section } =
    getDerivedVariablesFromSettings(settingValues);

  let mainSectionDisplayNumber = 0;
  let mainSectionCount = 0;
  let subsectionCount = 0;

  let currentSectionCoverWeight = 0;
  let currentSectionPptSectionWeight = 0;
  let currentSectionEmptySlideWeight = 0;
  let currentSectionFillSlideWeight = 0;

  let currentMainSectionInfo: PptMainSectionInfo = {
    sectionName: "",
    startLineIndex: -1,
    endLineIndex: -1,
  };

  // to track the inserted index, for inserting secondary content
  const insertedIndex: number[] = [];
  const mainSectionsInfo: PptMainSectionInfo[] = [];

  primaryLinesArray.forEach((primaryLine, index, arr) => {
    if (insertedIndex.indexOf(index) !== -1) {
      // the line is inserted, skipping it
      return;
    }

    const isMainSection = primaryLine.startsWith(`${LYRIC_SECTION.SECTION} `);
    const isSubSection = primaryLine.startsWith(`${LYRIC_SECTION.SUBSECTION} `);

    if (isMainSection) {
      mainSectionCount++;
    }

    const currentlyHasNoMainSection = mainSectionCount === 0;
    // if is useDifferentSettingForEachSection and currently not in any main section
    // use default section settings (because the useMainSectionSettings is default true, will then use main settings)
    const currentSectionSetting =
      useDifferentSettingForEachSection && currentlyHasNoMainSection
        ? getSectionSettingsInitialValue({
            settings: PPT_GENERATION_SETTINGS_META,
          })
        : section?.[`${SECTION_PREFIX}${mainSectionCount}`]; // the main section count starting from 1

    if (
      useDifferentSettingForEachSection === true &&
      currentSectionSetting === undefined
    ) {
      throw new Error("undefined section settings");
    }

    const {
      isBackgroundColorWhenEmpty,
      hasSecondaryContent,
      linePerTextbox,
      isUseSectionColor,
      isUseSectionImage,
      mainContentOption,
      mainCoverOption,
      toRemoveIdenticalWords,
      secondaryContentOption,
      secondaryCoverOption,
      totalLineCountPerSlide,
    } = getDerivedVariablesFromSectionSettings({
      settingValues,
      currentSectionSetting: currentSectionSetting!,
    });

    // Get the current index before manipulating the cover count and other weights
    // current index is the index of each line (of the current section),
    // excluding inserted cover, section
    // plus weight of fill slide and empty slide
    // EXAMPLE: if the linePerTextbox is 1 and textboxCountPerSlide is 2, then totalLineCountPerSlide will be 2
    // therefore the currenIndex of first slide should be 0 & 1; second slide should be 2 & 3 etc.
    let currentIndex =
      index -
      (mainSectionsInfo.length > 0 // has last section
        ? mainSectionsInfo[mainSectionsInfo.length - 1].endLineIndex + 1
        : 0) +
      currentSectionCoverWeight + // TO VERIFY IF currentSectionCoverCount WORKS
      currentSectionPptSectionWeight +
      currentSectionEmptySlideWeight +
      currentSectionFillSlideWeight;
    // if is new main section, recalculate the currentIndex to match the latest totalLineCountPerSlide
    // slideCount * totalLineCountPerSlide
    if (isMainSection) {
      const existingSlideCount =
        (pres as unknown as PptxGenJSType2).slides.length || 0;
      currentIndex = existingSlideCount * totalLineCountPerSlide;
    }

    // the number of line(s) to be inserted in the current slide
    const remainingLineCountBeforeInsert =
      totalLineCountPerSlide - (currentIndex % totalLineCountPerSlide);
    const indexInCurrentSlide = currentIndex % totalLineCountPerSlide;
    const textboxNumber = Math.floor(indexInCurrentSlide / linePerTextbox) + 1;

    // 1. check if is main or sub section, just add the section to presentation instance
    if (isMainSection || isSubSection) {
      subsectionCount = isSubSection ? subsectionCount + 1 : 0;
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

      if (isMainSection) {
        const isLastSectionDefault = currentMainSectionInfo.sectionName === "";
        if (!isLastSectionDefault) {
          // since this is now a new section
          // calculate the endLineIndex for previous section
          // and save the previousSectionInfo into mainSectionsInfo
          const previousMainSectionInfo = {
            ...currentMainSectionInfo,
            endLineIndex: index - 1,
          };
          mainSectionsInfo.push(previousMainSectionInfo);
        }

        currentMainSectionInfo = {
          sectionName,
          startLineIndex: index,
          endLineIndex: -1,
        };
        currentSectionPptSectionWeight = 0;
        currentSectionCoverWeight = 0;
        currentSectionEmptySlideWeight = 0;
        currentSectionFillSlideWeight = 0;
      }

      pres.addSection({ title: currentMainSectionInfo.sectionName });

      const isFirstPptSection = getPresSections(pres).length <= 1;
      // if is first ppt section, the behvaior is to not to add any slide, therefore the count should be -1
      // if it is not the first ppt section, the behavior is similar to a fillSlide (adding a new slide)
      // then weightage of each section should be equal to
      // remainder from previous insertion - 1
      // (the -1 is the default increment of index, this value is only used in next iteration)
      currentSectionPptSectionWeight += isFirstPptSection
        ? -1
        : remainingLineCountBeforeInsert - 1;
      return;
    }

    let currentLine = primaryLine.trim();

    // 2. check if is cover, update current line
    const isCover = primaryLine.startsWith(`${LYRIC_SECTION.MAIN_TITLE} `);
    if (isCover) {
      const isFirstPptSection = getPresSections(pres).length <= 1;
      currentSectionCoverWeight += isFirstPptSection
        ? -1
        : remainingLineCountBeforeInsert - 1;
      const regex = /^#[^#]*/;
      const mainTitle = currentLine
        .match(regex)?.[0]
        .replace(`${LYRIC_SECTION.MAIN_TITLE}`, "")
        .trim();
      currentLine = mainTitle || currentLine;
    }

    const isEmptySlide = primaryLine.startsWith(`${LYRIC_SECTION.EMPTY_SLIDE}`);
    if (isEmptySlide) {
      currentSectionEmptySlideWeight +=
        totalLineCountPerSlide + remainingLineCountBeforeInsert - 1;
      // weightage of each empty slide should be equal to
      // line per slide + remainder from previous slide - 1 (the 1 is the default increment of index)
      createNewSlide({
        pres,
        isEmptyLine: true,
        isBackgroundColorWhenEmpty,
        isUseSectionColor,
        isUseSectionImage,
        currentSectionNumber: mainSectionCount,
        sectionName: currentMainSectionInfo.sectionName,
      });
      return;
    }

    const isFillSlide =
      primaryLine.startsWith(`${LYRIC_SECTION.FILL_SLIDE}`) && !isEmptySlide;
    if (isFillSlide) {
      // weightage of each fill slide should be equal to
      // remainder from previous slide - 1 (the 1 is the default increment of index)
      currentSectionFillSlideWeight += remainingLineCountBeforeInsert - 1;
      return;
    }

    let slide = getWorkingSlide({
      pres,
      indexInCurrentSlide,
      isEmptyLine: currentLine.trim().length === 0,
      isBackgroundColorWhenEmpty,
      sectionName: currentMainSectionInfo.sectionName,
      isUseSectionColor,
      isUseSectionImage,
      currentSectionNumber: mainSectionCount,
      isCover,
    });

    // empty the array
    insertedIndex.length = 0;
    insertedIndex.push(index);
    const textToInsert = [currentLine];
    // might need to insert multiple lines if it is not cover
    if (!isCover) {
      for (let i = 1; i < linePerTextbox; i++) {
        // i = 1 to skip the current line
        const targetIndex = index + i;
        if (targetIndex >= arr.length) {
          break;
        }
        const tempText = arr[targetIndex];
        if (!getIsNormalLine(tempText)) {
          break;
        }
        textToInsert.push(tempText.trim());
        insertedIndex.push(targetIndex);
      }
    }

    // add primary content OR can be title
    addTextLineToSlide({
      slide,
      text: textToInsert,
      contentOption: mainContentOption,
      coverOption: isCover ? mainCoverOption : undefined,
      textboxKey: `${TEXTBOX_GROUPING_PREFIX}${textboxNumber}`,
      settingValues,
    });

    if (hasSecondaryContent) {
      const textToInsert: string[] = [];
      insertedIndex.forEach((i) => {
        let tempLine = secondaryLinesArray[i]?.trim() ?? "";

        if (isCover) {
          // if the inserted line is a cover, and the insertedIndex must be length of 1
          const subCoverLineIndex = tempLine.indexOf(
            `${LYRIC_SECTION.SECONDARY_TITLE} `,
          );
          const hasSecondaryTitle = subCoverLineIndex !== -1;

          tempLine = hasSecondaryTitle
            ? tempLine.substring(subCoverLineIndex + 3)
            : tempLine.replace(`${LYRIC_SECTION.MAIN_TITLE} `, ""); // use the pinyin if no secondary title
        }

        if (toRemoveIdenticalWords) {
          tempLine = removeIdenticalWords(
            tempLine,
            primaryLinesArray[i].trim(),
          );
        }
        textToInsert.push(tempLine);
      });

      // add secondary content
      addTextLineToSlide({
        slide,
        text: textToInsert,
        contentOption: secondaryContentOption,
        coverOption: isCover ? secondaryCoverOption : undefined,
        textboxKey: `${TEXTBOX_GROUPING_PREFIX}${textboxNumber}`,
        settingValues,
      });
    }

    const isLastLine = index === primaryLinesArray.length - 1;
    if (isLastLine) {
      const lastMainSectionInfo = {
        ...currentMainSectionInfo,
        endLineIndex: index,
      };
      mainSectionsInfo.push(lastMainSectionInfo);
    }
  });

  return {
    sectionsInfo: mainSectionsInfo,
  };
}

function createNewSlide({
  pres,
  isEmptyLine,
  isBackgroundColorWhenEmpty,
  isUseSectionColor,
  isUseSectionImage,
  currentSectionNumber,
  sectionName,
}: {
  pres: pptxgenjs;
  sectionName: string;
  isEmptyLine: boolean;
  isBackgroundColorWhenEmpty: boolean;
  isUseSectionColor: boolean;
  isUseSectionImage: boolean;
  currentSectionNumber: number;
}): PptxGenJS.default.Slide {
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

function getWorkingSlide({
  pres,
  indexInCurrentSlide,
  isCover,
  sectionName,
  isEmptyLine,
  isBackgroundColorWhenEmpty,
  isUseSectionColor,
  isUseSectionImage,
  currentSectionNumber,
}: {
  pres: pptxgenjs;
  indexInCurrentSlide: number;
  isCover: boolean;
  sectionName: string;
  isEmptyLine: boolean;
  isBackgroundColorWhenEmpty: boolean;
  isUseSectionColor: boolean;
  isUseSectionImage: boolean;
  currentSectionNumber: number;
}): PptxGenJS.default.Slide {
  const slides = (pres as unknown as PptxGenJSType2).slides;
  const currentPresSlide =
    slides.length > 0 ? slides[slides.length - 1] : undefined;
  const isToCreateSlide =
    currentPresSlide === undefined || indexInCurrentSlide === 0 || isCover;

  if (isToCreateSlide) {
    return createNewSlide({
      pres,
      isEmptyLine,
      isBackgroundColorWhenEmpty,
      isUseSectionColor,
      isUseSectionImage,
      currentSectionNumber,
      sectionName,
    });
  }

  return currentPresSlide as unknown as PptxGenJS.default.Slide;
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
  const { text, glow, outline, shadow, textbox } = contentOption;
  const { [textboxKey]: targetTextbox } = textbox;
  const defaultContent = PPT_GENERATION_CONTENT_SETTINGS;
  const defaultTextbox = PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS;

  if (targetTextbox === undefined) {
    throw new Error(`undefiend target textbox settings: ${textboxKey}`);
  }

  // NOTE: targetTextbox might be undefined because
  // the hook update in usePptSettingsDynamicTextboxCount is debounced
  let customOption: PptxGenJS.default.TextPropsOptions = {
    x: `${targetTextbox.textboxPositionX || defaultTextbox.textboxPositionX.defaultValue}%`,
    y: `${targetTextbox.textboxPositionY || defaultTextbox.textboxPositionY.defaultValue}%`,
    bold: text?.bold,
    color:
      getColorValue(text?.fontColor) ??
      getColorValue(defaultContent.fontColor.defaultValue),
    fontFace: text?.font ?? defaultContent.font.defaultValue,
    fontSize: text?.fontSize ?? defaultContent.fontSize.defaultValue,
    charSpacing: text?.charSpacing ?? defaultContent.charSpacing.defaultValue,
    align: text?.align ?? defaultContent.align.defaultValue,
  };

  Object.entries(
    PPT_GENERATION_CONTENT_SETTINGS as Record<string, BaseSettingItemMetaType>,
  ).forEach(([settingKey, settingMeta]) => {
    if (settingMeta.pptxgenName) {
      const settingValue =
        text?.[settingKey as keyof typeof text] ?? settingMeta.defaultValue;
      customOption = {
        ...customOption,
        [settingMeta.pptxgenName]: settingValue,
      };
    }
  });

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
  text,
  contentOption,
  coverOption,
  textboxKey,
  settingValues,
}: {
  slide: PptxGenJS.default.Slide;
  text: string[];
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

  const textObjects: PptxGenJS.default.TextProps[] = [];
  text.forEach((line) => {
    if (line.indexOf(BREAK_LINE) !== -1) {
      const tempTextObjects = line.split(BREAK_LINE).map((txt: string) => {
        return {
          text: txt,
          options: { breakLine: true },
        };
      });
      textObjects.push(...tempTextObjects);
      return;
    }

    textObjects.push({
      text: line,
      options: { breakLine: true },
    });
  });

  slide.addText(textObjects, finalOption);
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

const getPreviewImageSrcFromPresImage = (prop: DataOrPathProps) => {
  if (prop.data) {
    return {
      kind: "data",
      data: prop.data,
    };
  }
  if (prop.path) {
    return {
      kind: "path",
      data: prop.path,
    };
  }

  return null;
};

const getPreviewTextObjectStyle = (
  presObjectOptions?: ObjectOptions,
): InternalText["style"] => {
  // NOTE: meaning shadow, glow, outline won't work
  return {
    ...presObjectOptions,
    verticalAlign: presObjectOptions?.valign ?? "middle", // default set to middle
    h: presObjectOptions?.h ?? 0,
    x: presObjectOptions?.x!,
    y: presObjectOptions?.y!,
    w: presObjectOptions?.w!,
    color: presObjectOptions?.color ?? null,
    fontFace: presObjectOptions?.fontFace,
    align:
      presObjectOptions?.align === "justify"
        ? undefined
        : presObjectOptions?.align,
    fontSize: presObjectOptions?.fontSize,
    // backgroundColor: presObjectOptions, // no such option on pres
    bold: presObjectOptions?.bold,
    charSpacing: presObjectOptions?.charSpacing,
    italic: presObjectOptions?.italic,
    lineSpacing: presObjectOptions?.lineSpacing,
    margin: presObjectOptions?.margin,
    paraSpaceAfter: presObjectOptions?.paraSpaceAfter,
    paraSpaceBefore: presObjectOptions?.paraSpaceBefore,
    rotate: presObjectOptions?.rotate,
    strike: presObjectOptions?.strike,
    subscript: presObjectOptions?.subscript,
    superscript: presObjectOptions?.superscript,
    underline: presObjectOptions?.underline,
  };
};

export const generatePreviewConfig = async ({
  settingValues,
  primaryLyric,
  secondaryLyric,
}: {
  settingValues: PptSettingsStateType;
  primaryLyric: string;
  secondaryLyric: string;
}): Promise<InternalPresentation> => {
  // 1. Get background prop for the presentation
  // 2. Create a new Presentation instance
  // 3. Create Slides in the Presentation
  const { pres } = await createMainPresInstance({
    settingValues,
    primaryLyric,
    secondaryLyric,
  });

  // 3.1 Convert to the real PptxGenJS type
  const presV2 = pres as unknown as PptxGenJSType2;
  const masterSlides = presV2.slideLayouts;
  const slides = presV2.slides;
  const layout = presV2.layout.replace("LAYOUT_", "");

  const masterSlidesConfig = masterSlides.reduce(
    (acc, masterSlide) => ({
      ...acc,
      [masterSlide._name!]: {
        name: masterSlide._name,
        objects: masterSlide._slideObjects,
        backgroundColor: masterSlide.background?.color,
        backgroundImage: masterSlide.background
          ? getPreviewImageSrcFromPresImage(masterSlide.background)
          : null,
      },
    }),
    {},
  );

  const slidesConfig = slides.map((slide) => ({
    masterName: slide._slideLayout._name || null,
    backgroundColor: slide.background?.color,
    backgroundImage: slide.background?.data,
    hidden: slide.hidden,
    objects: slide._slideObjects?.map((object) => ({
      kind: "text", // supposedly use `object._type` instead, but now only text type is supported. TODO: see if need to support other types
      text:
        object.text?.map((txt) => ({
          text: txt.text || "",
          style: {
            ...txt.options,
          } as Partial<InternalTextPartBaseStyle>, // TODO: convert option to style properly based on the properties
        })) || [],
      style: getPreviewTextObjectStyle(object.options),
    })),
  })) as unknown as InternalPresentation["slides"];

  const reactPptxConfig: InternalPresentation = {
    layout: layout as InternalPresentation["layout"],
    masterSlides: masterSlidesConfig,
    slides: slidesConfig,
  };

  console.log({
    presV2,
    slidesConfig,
  });
  return reactPptxConfig;
};

const createMainPresInstance = async ({
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
    PPT_GENERATION_COMBINED_GENERAL_SETTINGS.mainBackgroundColor.defaultValue;
  const mainBackgroundImageToUse =
    mainBackgroundImage ??
    PPT_GENERATION_COMBINED_GENERAL_SETTINGS.mainBackgroundImage.defaultValue;
  // 1. Get background prop for the presentation
  const mainBackgroundProp = await getPptBackgroundProp({
    backgroundColor: mainBackgroundColorToUse,
    backgroundImage: mainBackgroundImageToUse,
  });

  // 1.1 Get background props for all sections
  const sectionsBackgroundProp: (PptxGenJS.default.BackgroundProps | null)[] =
    [];
  if (useDifferentSettingForEachSection === true && section) {
    for (const [sectionName, sectionSetting] of Object.entries(section)) {
      if (
        sectionSetting.general?.useMainSectionSettings ||
        (sectionSetting.general?.useMainBackgroundColor &&
          sectionSetting.general?.useMainBackgroundImage)
      ) {
        sectionsBackgroundProp.push(null);
        // no point to create master slides for this section
        continue;
      }
      const sectionBackgroundColor =
        sectionSetting.general?.sectionBackgroundColor ??
        PPT_GENERATION_COMBINED_GENERAL_SETTINGS.mainBackgroundColor
          .defaultValue;
      const sectionBackgroundImage =
        sectionSetting.general?.sectionBackgroundImage ??
        PPT_GENERATION_COMBINED_GENERAL_SETTINGS.mainBackgroundImage
          .defaultValue;

      const backgroundProp = await getPptBackgroundProp({
        backgroundColor: sectionSetting.general?.useMainBackgroundColor
          ? mainBackgroundColorToUse
          : sectionBackgroundColor,
        backgroundImage: sectionSetting.general?.useMainBackgroundImage
          ? null // no need to recreate the main image, the image wont be used, and will increase the file size
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

  return {
    pres,
    sectionsInfo,
    mainBackgroundProp,
    sectionsBackgroundProp,
    primaryLinesArray,
    secondaryLinesArray,
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
    general: { separateSectionsToFiles },
  } = settingValues;

  // 1. Get background prop for the presentation
  // 2. Create a new Presentation instance
  // 3. Create Slides in the Presentation
  const {
    pres,
    sectionsInfo,
    mainBackgroundProp,
    sectionsBackgroundProp,
    primaryLinesArray,
    secondaryLinesArray,
  } = await createMainPresInstance({
    settingValues,
    primaryLyric,
    secondaryLyric,
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
    return pptPresets[presetName];
  }
  return undefined;
};

export const generateSectionSettingsFromFullSettings = (
  settings: PptSettingsStateType,
): SectionSettingsType => {
  const presetGeneralSetting = settings[SETTING_CATEGORY.GENERAL];
  const sectionValues: SectionSettingsType = {
    [SETTING_CATEGORY.GENERAL]: {
      useMainSectionSettings: false,
      useMainBackgroundImage: false,
      sectionBackgroundImage: presetGeneralSetting.mainBackgroundImage,
      useMainBackgroundColor: false,
      sectionBackgroundColor: presetGeneralSetting.mainBackgroundColor,
    },
    [SETTING_CATEGORY.COVER]: settings.cover,
    [SETTING_CATEGORY.CONTENT]: settings.content,
  };

  Object.entries(PPT_GENERATION_SHARED_GENERAL_SETTINGS).forEach(
    ([settingKey, meta]) => {
      const key = settingKey as keyof SettingsValueType<
        typeof PPT_GENERATION_SHARED_GENERAL_SETTINGS
      >;
      const originalSetting = presetGeneralSetting[key];
      sectionValues.general = {
        ...sectionValues.general,
        [key]: originalSetting,
      };
    },
  );

  return sectionValues;
};

export const generateFullSettingsForSectionApplication = ({
  newSettings,
  originalSettings,
  targetSectionName,
}: {
  newSettings: PptSettingsStateType;
  originalSettings: PptSettingsStateType;
  targetSectionName: SectionSettingsKeyType;
}) => {
  const sectionSettings = generateSectionSettingsFromFullSettings(newSettings);

  const outputSettings = originalSettings;
  outputSettings[SETTING_CATEGORY.SECTION] = {
    ...originalSettings[SETTING_CATEGORY.SECTION],
    [targetSectionName as SectionSettingsKeyType]: sectionSettings,
  };

  return outputSettings;
};

export const generateFullSettingsForMainApplication = ({
  newSettings,
  originalSettings,
  isPreserveUseDifferentSetting = false,
  isPreserveExistingSectionSetting = true,
}: {
  newSettings: PptSettingsStateType;
  originalSettings: PptSettingsStateType;
  isPreserveUseDifferentSetting: boolean;
  isPreserveExistingSectionSetting: boolean;
}) => {
  let settingsToUse = newSettings;
  // 1. Preserve filename
  settingsToUse[SETTING_CATEGORY.FILE].filename =
    originalSettings.file.filename;

  // 2. Preserve / Reset section settings
  if (isPreserveExistingSectionSetting) {
    // preserve section values
    settingsToUse[SETTING_CATEGORY.SECTION] = {
      ...originalSettings[SETTING_CATEGORY.SECTION],
    };
  }

  if (
    !isPreserveExistingSectionSetting &&
    originalSettings[SETTING_CATEGORY.SECTION] !== undefined
  ) {
    // reset section values if section settings exist
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

  // 3. Preserve use different setting
  if (isPreserveUseDifferentSetting) {
    settingsToUse[SETTING_CATEGORY.GENERAL].useDifferentSettingForEachSection =
      originalSettings.general.useDifferentSettingForEachSection;
  }

  return settingsToUse;
};

export const generateFullSettings = ({
  newSettings,
  originalSettings,
  isApplyToSection = false,
  isPreserveUseDifferentSetting = false,
  isPreserveExistingSectionSetting = true,
  targetSectionName,
}: {
  newSettings: PptSettingsStateType;
  originalSettings: PptSettingsStateType;
  isApplyToSection: boolean;
  isPreserveUseDifferentSetting: boolean;
  isPreserveExistingSectionSetting: boolean;
  targetSectionName: string;
}): PptSettingsStateType => {
  const originalSettingsCopy = deepCopy(originalSettings);
  if (isApplyToSection && targetSectionName !== MAIN_SECTION_NAME) {
    const resultSettings = generateFullSettingsForSectionApplication({
      newSettings,
      originalSettings: originalSettingsCopy,
      targetSectionName: targetSectionName as SectionSettingsKeyType,
    });
    return resultSettings;
  }

  const settingsToUse = generateFullSettingsForMainApplication({
    newSettings,
    originalSettings: originalSettingsCopy,
    isPreserveExistingSectionSetting,
    isPreserveUseDifferentSetting,
  });

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

export const getSettingTypeFromJSON = ({
  json,
}: {
  json: JSON;
}): ImportedSettingType | null => {
  if (getIsValidToSchema(json, settingsSchema)) {
    return IMPORTED_SETTING_TYPE.FULL_SETTING;
  }

  if (getIsValidToSchema(json, sectionSettingSchema)) {
    return IMPORTED_SETTING_TYPE.SECTION;
  }
  return null;
};

export const combineWithDefaultSettings = (
  settingsValue: PptSettingsStateType,
): PptSettingsStateType => {
  const defaultInitialState = generatePptSettingsInitialState(
    PPT_GENERATION_SETTINGS_META,
  );
  const result = deepMerge(
    defaultInitialState,
    settingsValue,
  ) as PptSettingsStateType;
  return result;
};

export const exportObjectToJsonFile = ({
  obj,
  document,
  fileName,
}: {
  obj: any;
  document: Document;
  fileName: string;
}) => {
  // Convert the settings to a JSON string
  const settingsJson = JSON.stringify(obj, null, 2); // Pretty print JSON

  // Create a Blob from the JSON string
  const blob = new Blob([settingsJson], { type: "application/json" });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element and trigger the download
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName; // Filename for the downloaded file
  document.body.appendChild(a); // Append to body to ensure it can be clicked
  a.click(); // Trigger click to download

  // Clean up by revoking the Blob URL and removing the anchor element
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const exportFullSettings = ({
  settingsValue,
  isIncludeSectionSettings,
}: {
  settingsValue: PptSettingsStateType;
  isIncludeSectionSettings: boolean;
}) => {
  const settingsCopy = deepCopy(settingsValue);
  if (!isIncludeSectionSettings && settingsCopy[SETTING_CATEGORY.SECTION]) {
    delete settingsCopy[SETTING_CATEGORY.SECTION];
  }

  // remove background image
  settingsCopy[SETTING_CATEGORY.GENERAL].mainBackgroundImage = null;

  if (isIncludeSectionSettings && settingsCopy[SETTING_CATEGORY.SECTION]) {
    const sectionSettings = {
      ...settingsCopy[SETTING_CATEGORY.SECTION],
    };

    // remove background image in sections
    Object.entries(sectionSettings).forEach(
      ([sectionKey, sectionSettingValue]) => {
        sectionSettingValue[SETTING_CATEGORY.GENERAL].sectionBackgroundImage =
          null;

        // added ! to tell typescript that the settingsCopy[SETTING_CATEGORY.SECTION] will not be undefined
        settingsCopy[SETTING_CATEGORY.SECTION]![
          sectionKey as SectionSettingsKeyType
        ] = sectionSettingValue;
      },
    );
  }

  exportObjectToJsonFile({
    obj: settingsCopy,
    document: document,
    fileName: `KhenPptGeneratorSettings_${new Date().getTime()}.json`,
  });
};

export const exportSectionSettings = ({
  settingsValue,
  targetSectionName,
}: {
  settingsValue: PptSettingsStateType;
  targetSectionName: SectionSettingsKeyType;
}) => {
  const originalTargetSectionValues = deepCopy(
    settingsValue[SETTING_CATEGORY.SECTION]?.[targetSectionName],
  );

  if (!originalTargetSectionValues) {
    return;
  }

  // remove background image in section
  originalTargetSectionValues[SETTING_CATEGORY.GENERAL].sectionBackgroundImage =
    null;

  exportObjectToJsonFile({
    obj: originalTargetSectionValues,
    document: document,
    fileName: `KhenPptGeneratorSectionSettings_${new Date().getTime()}.json`,
  });
};

export function getInitialTextboxSettings(): SettingsValueType<
  typeof PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS
> {
  return {
    textboxPositionX:
      PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS.textboxPositionX.defaultValue,
    textboxPositionY:
      PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS.textboxPositionY.defaultValue,
  };
}
