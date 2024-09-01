import {
  DEFAULT_AUTHOR,
  DEFAULT_BASE_OPTION,
  DEFAULT_LINE_COUNT_PER_TEXTBOX,
  DEFAULT_PPT_LAYOUT,
  DEFAULT_SUBJECT,
  DEFAULT_TEXTBOX_COUNT_PER_SLIDE,
  DEFAULT_TITLE,
  LYRIC_SECTION,
  MASTER_SLIDE_BACKGROUND_COLOR,
  MASTER_SLIDE_BACKGROUND_IMAGE,
  PPT_GENERATION_COMBINED_GENERAL_SETTINGS,
  PPT_GENERATION_CONTENT_SETTINGS,
  PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS,
  PPT_GENERATION_COVER_SETTINGS,
  PPT_GENERATION_SETTINGS_META,
  SECTION_PREFIX,
  SETTING_FIELD_TYPE,
  TEXTBOX_GROUPING_PREFIX,
} from "@/lib/constant";
import { BREAK_LINE } from "@/lib/constant/general";
import {
  BaseSettingItemMetaType,
  ContentSettingsType,
  ContentTextboxSettingsType,
  FieldTypeToTypeScriptType,
  PptMainSectionInfo,
  PptSettingsStateType,
  SectionSettingsType,
  SettingsValueType,
} from "@/lib/types";
import type { PptxGenJS as PptxGenJSType2 } from "@/lib/types/pptxgenjs";
import {
  extractNumber,
  getSectionSettingsInitialValue,
  removeIdenticalWords,
  startsWithNumbering,
} from "@/lib/utils";
import jszip from "jszip";
import pptxgenjs from "pptxgenjs";
import {
  getBase64FromImageField,
  getColorValue,
  getIsNormalLine,
  parsePptFilename,
} from "./settings-utils";

const getPptBackgroundProp = async ({
  backgroundColor,
  backgroundImage,
}: {
  backgroundColor: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.COLOR];
  backgroundImage: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.IMAGE];
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

/**
 * Get title of the master slide with background image for current section
 */
function getSectionImageSlideMasterTitle(sectionNumber: number) {
  return `${SECTION_PREFIX}${sectionNumber}_IMAGE`;
}

/**
 * Get title of the master slide with background color for current section
 */
function getSectionColorSlideMasterTitle(sectionNumber: number) {
  return `${SECTION_PREFIX}${sectionNumber}_COLOR`;
}

/**
 * Create a pptx instance
 */
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

/**
 * Get sections from pptx instance
 */
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

/**
 * A function to encapsulate the process of
 * 1. Get background prop for the presentation
 * 2. Create a new Presentation instance
 * 3. Create Slides in the Presentation
 */
export const createPptInstance = async ({
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
  } = await createPptInstance({
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
