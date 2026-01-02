import {
  DEFAULT_BASE_OPTION,
  LYRIC_SECTION,
  MASTER_SLIDE_BACKGROUND_COLOR,
  MASTER_SLIDE_BACKGROUND_IMAGE,
  PPT_GENERATION_CONTENT_SETTINGS,
  PPT_GENERATION_CONTENT_TEXTBOX_SETTINGS,
  PPT_GENERATION_COVER_SETTINGS,
  PPT_GENERATION_SETTINGS_META,
  SECTION_PREFIX,
  TEXTBOX_GROUPING_PREFIX,
} from "@/lib/constant";
import { BREAK_LINE } from "@/lib/constant/general";
import {
  BaseSettingItemMetaType,
  ContentSettingsType,
  ContentTextboxSettingsType,
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
import pptxgenjs from "pptxgenjs";
import { LineToSlideMapper, LineType } from "./line-to-slide-mapper";
import {
  DerivedPptConfig,
  MainPptConfig,
  PptConfigurationBuilder,
} from "./ppt-configuration-builder";
import { ProcessingContext } from "./processing-context";
import {
  getColorValue,
  getIsNormalLine,
  getSectionColorSlideMasterTitle,
  getSectionImageSlideMasterTitle,
} from "./settings-utils";

/**
 * Line classification enum for better readability
 */
export enum LineClassification {
  MAIN_SECTION = "MAIN_SECTION",
  SUB_SECTION = "SUB_SECTION",
  COVER = "COVER",
  EMPTY_SLIDE = "EMPTY_SLIDE",
  FILL_SLIDE = "FILL_SLIDE",
  NORMAL = "NORMAL",
  METADATA = "METADATA",
}

/**
 * Processed line information
 */
export interface LineInfo {
  classification: LineClassification;
  processedText: string;
  isCover: boolean;
}

/**
 * Slide position calculation result
 */
export type SlidePosition = {
  currentIndexInSection: number;
  indexInCurrentSlide: number;
  textboxNumber: number;
  remainingLineCountBeforeInsert: number;
};

/**
 * Refactored version of createSlidesFromLyrics with improved readability and maintainability.
 * This version breaks down the complex logic into focused, reusable functions.
 */
export function createSlidesFromLyricsRefactored({
  pres,
  primaryLinesArray,
  secondaryLinesArray,
  settingValues,
  lineMapper,
}: {
  pres: pptxgenjs;
  primaryLinesArray: string[];
  secondaryLinesArray: string[];
  settingValues: PptSettingsStateType;
  lineMapper?: LineToSlideMapper;
}) {
  // Initialize configuration and context
  const configBuilder = new PptConfigurationBuilder();
  const mainConfig = configBuilder.buildMainConfig(settingValues);
  const context = new ProcessingContext();

  // Process each line
  primaryLinesArray.forEach((primaryLine, index, arr) => {
    // Skip if line was already processed (merged into previous slide)
    if (context.hasInsertedIndex(index)) {
      return;
    }

    // Classify the current line
    const lineInfo = classifyLine(primaryLine);

    // Get current section configuration
    const currentSectionSetting = getCurrentSectionSetting(mainConfig, context);

    if (
      shouldThrowForMissingSectionSettings(mainConfig, currentSectionSetting)
    ) {
      throw new Error("undefined section settings");
    }

    // Build configuration for current section/line
    const currentRelevantConfig = configBuilder.buildSectionConfig(
      currentSectionSetting!,
      mainConfig,
    );

    // Calculate slide position
    const position = calculateSlidePosition(
      index,
      lineInfo.classification,
      context,
      currentRelevantConfig,
      pres,
    );

    // Handle sections first
    if (isSection(lineInfo.classification)) {
      processSectionLine(
        lineInfo,
        index,
        context,
        pres,
        settingValues,
        position,
        lineMapper,
      );
      return;
    }

    // Handle special slides (empty, fill, metadata)
    if (isSpecialSlide(lineInfo.classification)) {
      processSpecialSlide(
        lineInfo,
        index,
        position,
        currentRelevantConfig,
        context,
        pres,
        lineMapper,
      );
      return;
    }

    // Handle normal content and covers
    processContentLine({
      lineInfo,
      index,
      primaryLinesArray: arr,
      secondaryLinesArray,
      position,
      config: currentRelevantConfig,
      context,
      pres,
      settingValues,
      lineMapper,
    });
  });

  // Finalize the last section
  finalizeLastSection(context, primaryLinesArray.length - 1);

  return {
    sectionsInfo: context.mainSectionsInfo,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Classifies a line and returns its type and processed text
 */
function classifyLine(line: string): LineInfo {
  const trimmedLine = line.trim();

  if (line.startsWith(`${LYRIC_SECTION.SECTION} `)) {
    return {
      classification: LineClassification.MAIN_SECTION,
      processedText: line.replace(`${LYRIC_SECTION.SECTION} `, ""),
      isCover: false,
    };
  }

  if (line.startsWith(`${LYRIC_SECTION.SUBSECTION} `)) {
    return {
      classification: LineClassification.SUB_SECTION,
      processedText: line.replace(`${LYRIC_SECTION.SUBSECTION} `, ""),
      isCover: false,
    };
  }

  if (line.startsWith(`${LYRIC_SECTION.MAIN_TITLE} `)) {
    const mainTitleRegex = /^#[^#]*/;
    const mainTitle = line
      .match(mainTitleRegex)?.[0]
      .replace(`${LYRIC_SECTION.MAIN_TITLE}`, "")
      .trim();
    return {
      classification: LineClassification.COVER,
      processedText: mainTitle || trimmedLine,
      isCover: true,
    };
  }

  if (line.startsWith(`${LYRIC_SECTION.EMPTY_SLIDE}`)) {
    return {
      classification: LineClassification.EMPTY_SLIDE,
      processedText: trimmedLine,
      isCover: false,
    };
  }

  if (
    line.startsWith(`${LYRIC_SECTION.FILL_SLIDE}`) &&
    !line.startsWith(`${LYRIC_SECTION.EMPTY_SLIDE}`)
  ) {
    return {
      classification: LineClassification.FILL_SLIDE,
      processedText: trimmedLine,
      isCover: false,
    };
  }

  if (line.startsWith(`${LYRIC_SECTION.METADATA}`)) {
    return {
      classification: LineClassification.METADATA,
      // process text to remove the entire line of metadata
      processedText: "",
      isCover: false,
    };
  }

  return {
    classification: LineClassification.NORMAL,
    processedText: trimmedLine,
    isCover: false,
  };
}

/**
 * Type guards for line classifications
 */
function isSection(classification: LineClassification): boolean {
  return (
    classification === LineClassification.MAIN_SECTION ||
    classification === LineClassification.SUB_SECTION
  );
}

function isSpecialSlide(classification: LineClassification): boolean {
  return (
    classification === LineClassification.EMPTY_SLIDE ||
    classification === LineClassification.FILL_SLIDE ||
    classification === LineClassification.METADATA
  );
}

/**
 * Gets sections from pptx instance
 */
function getPresSections(pres: pptxgenjs) {
  return (pres as unknown as PptxGenJSType2).sections;
}

/**
 * Gets last section from pptx instance
 */
function getLastPresSection(pres: pptxgenjs) {
  const sections = (pres as unknown as PptxGenJSType2).sections;
  return sections.length ? sections[sections.length - 1] : undefined;
}

/**
 * Processes section lines (main section or subsection)
 */
function processSectionLine(
  lineInfo: LineInfo,
  index: number,
  context: ProcessingContext,
  pres: pptxgenjs,
  settingValues: PptSettingsStateType,
  position: SlidePosition,
  lineMapper?: LineToSlideMapper,
): void {
  const isMainSection =
    lineInfo.classification === LineClassification.MAIN_SECTION;
  const isSubSection =
    lineInfo.classification === LineClassification.SUB_SECTION;

  if (isMainSection) {
    context.incrementMainSectionCount();
  }

  // Update subsection count
  if (isSubSection) {
    context.incrementSubsectionDisplayNumber();
  } else {
    context.setSubsectionDisplayNumber(0);
  }

  // Process section name
  let sectionName = lineInfo.processedText;
  const hasNumbering = startsWithNumbering(sectionName);

  if (hasNumbering) {
    context.setMainSectionDisplayNumber(extractNumber(sectionName));
  }

  // Add auto-numbering if needed
  if (!hasNumbering && settingValues.general.sectionsAutoNumbering) {
    if (isMainSection) {
      context.incrementMainSectionDisplayNumber();
      sectionName = `${context.mainSectionDisplayNumber}. ${sectionName}`;
    } else {
      sectionName = `${context.mainSectionDisplayNumber}.${context.subsectionDisplayNumber} ${sectionName}`;
    }
  }

  context.setCurrentSectionName(sectionName);

  // Handle main section finalization
  if (isMainSection) {
    const isPreviousSectionDefault = context.isCurrentMainSectionDefault();
    if (!isPreviousSectionDefault) {
      // since this is now a new section
      // calculate the endLineIndex for previous section
      // and save the previousSectionInfo into mainSectionsInfo
      const previousMainSectionInfo = {
        ...context.currentMainSectionInfo,
        endLineIndex: index - 1,
      };
      context.addToMainSectionsInfo(previousMainSectionInfo);
    }

    context.setCurrentMainSectionInfo({
      sectionName,
      startLineIndex: index,
      endLineIndex: -1,
    });

    // Reset section weights when there is a new main section
    context.resetSectionWeights();
  }

  // Add section to presentation
  pres.addSection({ title: sectionName });

  // Track section line mapping
  if (lineMapper) {
    const lineType = isMainSection ? LineType.SECTION : LineType.SUBSECTION;
    lineMapper.addMapping(
      index,
      lineMapper.currentSlideIndex,
      lineType,
      sectionName,
    );
  }

  // Update section weights
  const isFirstPptSection = getPresSections(pres).length <= 1;
  // if is first ppt section, the behvaior is to not to add any slide, therefore the count should be -1
  // if it is not the first ppt section, the behavior is similar to a fillSlide (adding a new slide)
  // then weightage of each section should be equal to
  // remainder from previous insertion - 1
  // (the -1 is the default increment of index, this value is only used in next iteration)
  const weightValue = isFirstPptSection
    ? -1
    : position.remainingLineCountBeforeInsert - 1; // Will be updated in position calculation
  context.addToCurrentSectionPptSectionWeight(weightValue);
}

/**
 * Calculates slide position based on current context and configuration
 */
function calculateSlidePosition(
  index: number,
  classification: LineClassification,
  context: ProcessingContext,
  config: DerivedPptConfig,
  pres: pptxgenjs,
): SlidePosition {
  // Get the current index before manipulating the cover count and other weights
  // currentIndexInSection is the index of each line (of the current section),
  // excluding inserted cover, section
  // plus weight of fill slide and empty slide
  // EXAMPLE: if the linePerTextbox is 1 and textboxCountPerSlide is 2, then totalLineCountPerSlide will be 2
  // therefore the currenIndex of first slide should be 0 & 1; second slide should be 2 & 3 etc.
  let currentIndexInSection =
    index -
    (context.hasMainSections() ? context.getLastMainSectionEndIndex() + 1 : 0) +
    context.currentSectionCoverWeight +
    context.currentSectionPptSectionWeight +
    context.currentSectionEmptySlideWeight +
    context.currentSectionFillSlideWeight +
    context.currentSectionMetadataWeight;

  // if is new main section, recalculate the currentIndexInSection to match the latest totalLineCountPerSlide using the formula:
  // slideCount * totalLineCountPerSlide (of the current section)
  if (classification === LineClassification.MAIN_SECTION) {
    const existingSlideCount =
      (pres as unknown as PptxGenJSType2).slides?.length || 0;
    currentIndexInSection = existingSlideCount * config.totalLineCountPerSlide;
  }

  // the number of line(s) to be inserted in the current slide
  const remainingLineCountBeforeInsert =
    config.totalLineCountPerSlide -
    (currentIndexInSection % config.totalLineCountPerSlide);
  const indexInCurrentSlide =
    currentIndexInSection % config.totalLineCountPerSlide;
  const textboxNumber =
    Math.floor(indexInCurrentSlide / config.linePerTextbox) + 1;

  return {
    currentIndexInSection,
    indexInCurrentSlide,
    textboxNumber,
    remainingLineCountBeforeInsert,
  };
}

/**
 * Get the current section setting
 */
function getCurrentSectionSetting(
  mainConfig: MainPptConfig,
  context: ProcessingContext,
): SectionSettingsType | undefined {
  const currentlyHasNoMainSection = context.hasNoMainSection();
  // if is useDifferentSettingForEachSection and currently not in any main section
  // use default section settings
  // (because the useMainSectionSettings is default true, will then use main settings, so sectionSetting doesn't matter here)
  if (
    mainConfig.useDifferentSettingForEachSection &&
    currentlyHasNoMainSection
  ) {
    return getSectionSettingsInitialValue({
      settings: PPT_GENERATION_SETTINGS_META,
    });
  }

  return mainConfig.section?.[`${SECTION_PREFIX}${context.mainSectionCount}`];
}

/**
 * Check if we should throw an error for missing section settings
 */
function shouldThrowForMissingSectionSettings(
  mainConfig: MainPptConfig,
  currentSectionSetting: SectionSettingsType | undefined,
): boolean {
  return (
    mainConfig.useDifferentSettingForEachSection === true &&
    currentSectionSetting === undefined
  );
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

/**
 * Processes special slides (empty, fill, and metadata slides)
 */
function processSpecialSlide(
  lineInfo: LineInfo,
  index: number,
  position: SlidePosition,
  config: DerivedPptConfig,
  context: ProcessingContext,
  pres: pptxgenjs,
  lineMapper?: LineToSlideMapper,
): void {
  if (lineInfo.classification === LineClassification.EMPTY_SLIDE) {
    context.addToCurrentSectionEmptySlideWeight(
      config.totalLineCountPerSlide +
        position.remainingLineCountBeforeInsert -
        1,
    );

    // weightage of each empty slide should be equal to
    // line per slide + remainder from previous slide - 1 (the 1 is the default increment of index)
    createNewSlide({
      pres,
      isEmptyLine: true,
      isBackgroundColorWhenEmpty: config.isBackgroundColorWhenEmpty,
      isUseSectionColor: config.isUseSectionColor,
      isUseSectionImage: config.isUseSectionImage,
      currentSectionNumber: context.mainSectionCount,
      sectionName: getLastPresSection(pres)?.title || "",
    });

    if (lineMapper) {
      lineMapper.addMapping(
        index,
        lineMapper.currentSlideIndex,
        LineType.EMPTY_SLIDE,
        context.currentSectionName,
      );
      lineMapper.incrementSlideIndex();
    }
    return;
  }

  if (lineInfo.classification === LineClassification.FILL_SLIDE) {
    // weightage of each fill slide should be equal to
    // remainder from previous slide - 1 (the 1 is the default increment of index)
    context.addToCurrentSectionFillSlideWeight(
      position.remainingLineCountBeforeInsert - 1,
    );

    if (lineMapper) {
      lineMapper.addMapping(
        index,
        lineMapper.currentSlideIndex,
        LineType.FILL_SLIDE,
        context.currentSectionName,
      );
    }
    return;
  }

  if (lineInfo.classification === LineClassification.METADATA) {
    // -1 is the default increment of index
    context.addToCurrentSectionMetadataWeight(-1);

    if (lineMapper) {
      lineMapper.addMapping(
        index,
        lineMapper.currentSlideIndex,
        LineType.METADATA,
        context.currentSectionName,
      );
    }
    return;
  }
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
}): { slide: PptxGenJS.default.Slide; isNewSlide: boolean } {
  const slides = (pres as unknown as PptxGenJSType2).slides;
  const currentPresSlide =
    slides.length > 0 ? slides[slides.length - 1] : undefined;
  const isToCreateSlide =
    currentPresSlide === undefined || indexInCurrentSlide === 0 || isCover;

  if (isToCreateSlide) {
    return {
      slide: createNewSlide({
        pres,
        isEmptyLine,
        isBackgroundColorWhenEmpty,
        isUseSectionColor,
        isUseSectionImage,
        currentSectionNumber,
        sectionName,
      }),
      isNewSlide: true,
    };
  }

  return {
    slide: currentPresSlide as unknown as PptxGenJS.default.Slide,
    isNewSlide: false,
  };
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
    throw new Error(`undefined target textbox settings: ${String(textboxKey)}`);
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
 * Processes content lines (normal content and covers)
 */
function processContentLine({
  lineInfo,
  index,
  primaryLinesArray,
  secondaryLinesArray,
  position,
  config,
  context,
  pres,
  settingValues,
  lineMapper,
}: {
  lineInfo: LineInfo;
  index: number;
  primaryLinesArray: string[];
  secondaryLinesArray: string[];
  position: SlidePosition;
  config: DerivedPptConfig;
  context: ProcessingContext;
  pres: pptxgenjs;
  settingValues: PptSettingsStateType;
  lineMapper?: LineToSlideMapper;
}): void {
  const isCover = lineInfo.isCover;

  // Handle cover weight update
  if (isCover) {
    const isFirstPptSection = getPresSections(pres).length <= 1;
    context.addToCurrentSectionCoverWeight(
      isFirstPptSection ? -1 : position.remainingLineCountBeforeInsert - 1,
    );
  }

  // Get or create slide - you would need to implement or import this function
  const { slide, isNewSlide } = getWorkingSlide({
    pres,
    indexInCurrentSlide: position.indexInCurrentSlide,
    isEmptyLine: lineInfo.processedText.length === 0,
    isBackgroundColorWhenEmpty: config.isBackgroundColorWhenEmpty,
    sectionName: getLastPresSection(pres)?.title || "",
    isUseSectionColor: config.isUseSectionColor,
    isUseSectionImage: config.isUseSectionImage,
    currentSectionNumber: context.mainSectionCount,
    isCover,
  });

  if (lineMapper && isNewSlide) {
    lineMapper.incrementSlideIndex();
  }

  // Track line mapping
  if (lineMapper) {
    const lineType = isCover ? LineType.COVER : LineType.NORMAL;
    lineMapper.addMapping(
      index,
      lineMapper.currentSlideIndex,
      lineType,
      context.currentSectionName,
    );
  }

  // Prepare text content
  context.clearInsertedIndex();
  context.addToInsertedIndex(index);
  const textToInsert = [lineInfo.processedText];

  // Collect additional lines if not cover
  if (!isCover) {
    // TODO: follow best practice, avoid mutate parameter
    collectAdditionalLines(
      primaryLinesArray,
      index,
      config.linePerTextbox,
      textToInsert,
      context,
    );

    // Track skipped lines
    if (lineMapper && context.insertedIndex.length > 1) {
      const skippedLines = context.insertedIndex.slice(1);
      lineMapper.addSkippedLines(skippedLines, context.currentSectionName);
    }
  }

  // add primary content OR can be title (cover)
  addTextLineToSlide({
    slide,
    text: textToInsert,
    contentOption: config.mainContentOption,
    coverOption: isCover ? config.mainCoverOption : undefined,
    textboxKey: `${TEXTBOX_GROUPING_PREFIX}${position.textboxNumber}`,
    settingValues,
  });

  // Add secondary content if needed
  if (config.hasSecondaryContent) {
    const secondaryTextToInsert = processSecondaryContent(
      secondaryLinesArray,
      primaryLinesArray,
      context.insertedIndex,
      isCover,
      config.toRemoveIdenticalWords,
    );

    // add secondary content
    addTextLineToSlide({
      slide,
      text: secondaryTextToInsert,
      contentOption: config.secondaryContentOption,
      coverOption: isCover ? config.secondaryCoverOption : undefined,
      textboxKey: `${TEXTBOX_GROUPING_PREFIX}${position.textboxNumber}`,
      settingValues,
    });
  }
}

/**
 * Collects additional lines for multi-line textboxes
 */
function collectAdditionalLines(
  primaryLinesArray: string[],
  startIndex: number,
  linePerTextbox: number,
  textToInsert: string[],
  context: ProcessingContext,
): void {
  for (let i = 1; i < linePerTextbox; i++) {
    const targetIndex = startIndex + i;
    if (targetIndex >= primaryLinesArray.length) {
      break;
    }

    const tempText = primaryLinesArray[targetIndex];
    if (!getIsNormalLine(tempText)) {
      break;
    }

    textToInsert.push(tempText.trim());
    context.addToInsertedIndex(targetIndex);
  }
}

/**
 * Processes secondary content for slides
 */
function processSecondaryContent(
  secondaryLinesArray: string[],
  primaryLinesArray: string[],
  insertedIndex: number[],
  isCover: boolean,
  toRemoveIdenticalWords: boolean,
): string[] {
  const textToInsert: string[] = [];

  insertedIndex.forEach((i) => {
    let tempLine = secondaryLinesArray[i]?.trim() ?? "";

    if (isCover) {
      const subCoverLineIndex = tempLine.indexOf(
        `${LYRIC_SECTION.SECONDARY_TITLE} `,
      );
      const hasSecondaryTitle = subCoverLineIndex !== -1;

      tempLine = hasSecondaryTitle
        ? tempLine.substring(subCoverLineIndex + 3)
        : tempLine.replace(`${LYRIC_SECTION.MAIN_TITLE} `, "");
    }

    if (toRemoveIdenticalWords) {
      tempLine = removeIdenticalWords(
        tempLine,
        primaryLinesArray[i]?.trim() || "",
      );
    }

    textToInsert.push(tempLine);
  });

  return textToInsert;
}

/**
 * Finalizes the last section
 */
function finalizeLastSection(
  context: ProcessingContext,
  lastIndex: number,
): void {
  if (!context.isCurrentMainSectionDefault()) {
    const lastMainSectionInfo = {
      ...context.currentMainSectionInfo,
      endLineIndex: lastIndex,
    };
    context.addToMainSectionsInfo(lastMainSectionInfo);
  }
}
