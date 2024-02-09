import jszip from "jszip";
import pptxgenjs from "pptxgenjs";
import { extractNumber, getBase64, startsWithNumbering } from ".";
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
  LYRIC_POSITION,
  LYRIC_SECTION,
  LYRIC_TYPE,
  PPT_GENERATION_GENERAL_SETTINGS,
  SETTING_CATEGORY,
  SETTING_FIELD_TYPE,
  TEXTBOX_GROUPING_PREFIX,
} from "../constant";
import {
  BaseSettingMetaType,
  ContentSettingsType,
  ContentTypeType,
  InferTypeScriptTypeFromSettingFieldType,
  PptGenerationSettingMetaType,
  PptMainSectionInfo,
  PptSettingsStateType,
} from "../types";

export const generatePptSettingsInitialState = (
  settings: PptGenerationSettingMetaType,
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

  type CategoryWithContentType =
    | typeof SETTING_CATEGORY.COVER
    | typeof SETTING_CATEGORY.CONTENT;
  const applySettings = ({
    category,
    settingsMeta,
    contentType,
    groupingName,
  }: {
    settingsMeta: BaseSettingMetaType;
  } & (
    | {
        category: Exclude<keyof PptSettingsStateType, CategoryWithContentType>;
        contentType?: never;
        groupingName?: never;
      }
    | {
        category: typeof SETTING_CATEGORY.COVER;
        contentType: ContentTypeType;
        groupingName?: never;
      }
    | {
        category: typeof SETTING_CATEGORY.CONTENT;
        contentType: ContentTypeType;
        groupingName?: keyof ContentSettingsType;
      }
  )) => {
    Object.entries(settingsMeta).forEach(([key, setting]) => {
      if (setting.isHidden || setting.defaultValue === undefined) {
        return;
      }

      // All category besides cover and content will go under this statement
      if (
        category != SETTING_CATEGORY.COVER &&
        category != SETTING_CATEGORY.CONTENT
      ) {
        initialState[category] = {
          ...initialState[category],
          [setting.fieldKey]: setting.defaultValue,
        };
        return;
      }

      if (category == SETTING_CATEGORY.COVER) {
        initialState[category][contentType] = {
          ...initialState[category][contentType],
          [setting.fieldKey]: setting.defaultValue,
        };
        return;
      }

      if (category == SETTING_CATEGORY.CONTENT) {
        const grouping =
          groupingName || setting.groupingName || DEFAULT_GROUPING_NAME;
        const originalGroupingObject =
          initialState[category][contentType][
            grouping as keyof ContentSettingsType
          ];
        initialState[category][contentType] = {
          ...initialState[category][contentType],
          [grouping]: {
            ...originalGroupingObject,
            [setting.fieldKey]: setting.defaultValue,
          },
        };
        return;
      }
    });
  };

  Object.entries(settings).forEach(([category, settingsMeta]) => {
    switch (category) {
      case SETTING_CATEGORY.GENERAL:
      case SETTING_CATEGORY.FILE:
        applySettings({ category, settingsMeta });
        break;
      case SETTING_CATEGORY.CONTENT:
      case SETTING_CATEGORY.COVER:
        Object.values(CONTENT_TYPE).forEach((contentType) => {
          applySettings({ category, settingsMeta, contentType });
          if (category === SETTING_CATEGORY.CONTENT) {
            Array.from({ length: DEFAULT_LINE_COUNT_PER_SLIDE }).forEach(
              (_, index) => {
                const groupingName = `${TEXTBOX_GROUPING_PREFIX}${index + 1}`;
                applySettings({
                  category,
                  settingsMeta: settings.contentTextbox,
                  contentType,
                  groupingName: groupingName as keyof ContentSettingsType,
                });
              },
            );
          }
        });
        break;
    }
  });

  return initialState;
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
  const imageBase64 = await getBase64(backgroundImage);
  if (typeof imageBase64 !== "string") {
    return backgroundProp;
  }
  return {
    ...backgroundProp,
    data: imageBase64 as string,
  };
};

function createPresentationInstance({
  author = DEFAULT_AUTHOR,
  subject = DEFAULT_SUBJECT,
  title = DEFAULT_TITLE,
  layout = DEFAULT_PPT_LAYOUT,
  backgroundProp,
}: {
  author?: string;
  subject?: string;
  title?: string;
  layout?: string;
  backgroundProp: PptxGenJS.default.BackgroundProps;
}) {
  let pres = new pptxgenjs();
  pres.author = author;
  pres.subject = subject;
  pres.title = title;
  pres.layout = layout;
  pres.defineSlideMaster({
    title: "MASTER_SLIDE_BACKGROUND_IMAGE",
    background: backgroundProp,
  });
  pres.defineSlideMaster({
    title: "MASTER_SLIDE_BACKGROUND_COLOR",
    background: { color: backgroundProp.color },
  });

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
    general: { useBackgroundColorWhenEmpty, singleLineMode, ignoreSubcontent },
  } = settingValues;
  const isBackgroundColorWhenEmpty =
    useBackgroundColorWhenEmpty ??
    PPT_GENERATION_GENERAL_SETTINGS.useBackgroundColorWhenEmpty.defaultValue;
  const linePerSlide = singleLineMode ? 1 : DEFAULT_LINE_COUNT_PER_SLIDE;
  const hasSecondaryContent = !ignoreSubcontent;

  let coverCount = 0;
  let pptSectionCount = 0;
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

      if (hasNumbering && isMainSection) {
        mainSectionCount = extractNumber(sectionName);
      }

      if (!hasNumbering && isMainSection) {
        mainSectionCount++;
        sectionName = `${mainSectionCount}. ${sectionName}`;
      }

      if (!hasNumbering && isSubSection) {
        sectionName = `${mainSectionCount}.${subsectionCount} ${sectionName}`;
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
      }

      currentPptSectionName = sectionName;
      pres.addSection({ title: sectionName });
      return;
    }

    let currentLine = primaryLine;
    // 2. check if is cover, update current line
    const isCover = primaryLine.startsWith(`${LYRIC_SECTION.MAINTITLE} `);
    if (isCover) {
      coverCount++;
      const regex = /^#[^#]*/;
      currentLine =
        currentLine
          .match(regex)?.[0]
          .replace(`${LYRIC_SECTION.MAINTITLE}`, "")
          .trim() || currentLine;
      // TODO: revise the algorithm here, in current case,
      // here will only get the main title (not the secondary title)
    }

    const currentIndex = index - coverCount - pptSectionCount;
    let slide = getWorkingSlide({
      pres,
      currentIndex,
      linePerSlide,
      isCover,
      isEmptyLine: currentLine.trim().length == 0,
      isBackgroundColorWhenEmpty,
      sectionName: currentPptSectionName,
      currentPresSlide: currentSlide,
    });
    currentSlide = slide; // update current slide

    const currentLyricPosition = isCover
      ? LYRIC_POSITION.COVER
      : currentIndex % linePerSlide == 0
        ? LYRIC_POSITION.UPPER
        : LYRIC_POSITION.LOWER;

    // add primary content
    addTextLineToSlide({
      slide,
      line: currentLine,
      type: LYRIC_TYPE.PRIMARY,
      lyricPosition: currentLyricPosition,
      settingValues,
    });

    if (hasSecondaryContent) {
      //add secondary content
      let secondaryLine = secondaryLinesArray[index] ?? "";
      if (isCover) {
        secondaryLine = secondaryLine.replace("# ", "");

        const subCoverLineIndex = secondaryLine.indexOf("## ");
        const hasSubCoverLine = subCoverLineIndex != -1;

        if (hasSubCoverLine) {
          secondaryLine = secondaryLine.substring(subCoverLineIndex + 3);
        }
      }

      addTextLineToSlide({
        slide,
        line: secondaryLine,
        type: LYRIC_TYPE.SECONDARY,
        lyricPosition: currentLyricPosition,
        settingValues,
      });
    }

    const isLastLine = index == primaryLinesArray.length - 1;
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
}: {
  pres: pptxgenjs;
  currentIndex: number;
  linePerSlide: number;
  isCover: boolean;
  sectionName: string;
  isEmptyLine: boolean;
  isBackgroundColorWhenEmpty: boolean;
  currentPresSlide?: PptxGenJS.default.Slide;
}): PptxGenJS.default.Slide {
  const isToCreateSlide =
    getIsToCreateNewSlide({
      currentIndex,
      linePerSlide,
      isCover,
    }) || currentPresSlide === undefined;

  if (isToCreateSlide) {
    const isUseBackgroundColor = isEmptyLine && isBackgroundColorWhenEmpty;
    const newSlide = pres.addSlide({
      masterName: isUseBackgroundColor
        ? "MASTER_SLIDE_BACKGROUND_COLOR"
        : "MASTER_SLIDE_BACKGROUND_IMAGE",
      ...(sectionName && { sectionTitle: sectionName }),
    });
    return newSlide;
  }

  return currentPresSlide;
}

function addTextLineToSlide({
  slide,
  line,
  type = LYRIC_TYPE.PRIMARY,
  lyricPosition = LYRIC_POSITION.UPPER,
  settingValues,
}: {
  slide: PptxGenJS.default.Slide;
  line: string;
  type: (typeof LYRIC_TYPE)[keyof typeof LYRIC_TYPE];
  lyricPosition: (typeof LYRIC_POSITION)[keyof typeof LYRIC_POSITION];
  settingValues: PptSettingsStateType;
}) {
  const isUpper = lyricPosition == LYRIC_POSITION.UPPER;
  const isCover = lyricPosition == LYRIC_POSITION.COVER;
  const isTypePrimary = type == LYRIC_TYPE.PRIMARY;
  const isTypeSecondary = type == LYRIC_TYPE.SECONDARY;
  const contentOptionToUse = isTypePrimary
    ? settingValues.content.main
    : settingValues.content.secondary;
  let customOption: PptxGenJS.default.TextPropsOptions = {
    x: isUpper
      ? `${contentOptionToUse.textboxLine1.textboxPositionX || 0}%`
      : `${contentOptionToUse.textboxLine2.textboxPositionX || 0}%`,
    y: isUpper
      ? `${contentOptionToUse.textboxLine1.textboxPositionY || 0}%`
      : `${contentOptionToUse.textboxLine2.textboxPositionY || 0}%`,
    bold: contentOptionToUse.text?.bold,
    color: contentOptionToUse.text?.fontColor?.replace("#", "") ?? "FFFFFF",
    fontFace: contentOptionToUse.text?.font ?? "Microsoft Yahei",
    fontSize: contentOptionToUse.text?.fontSize ?? 50,
    charSpacing: contentOptionToUse.text?.charSpacing ?? 2,
  };

  if (contentOptionToUse.glow?.hasGlow) {
    customOption = {
      ...customOption,
      glow: {
        size: contentOptionToUse.glow.glowSize ?? 5,
        color: contentOptionToUse.glow.glowColor?.replace("#", "") ?? "FFFFFF",
        opacity: contentOptionToUse.glow.glowOpacity ?? 0.25,
      },
    };
  }
  if (contentOptionToUse.outline?.hasOutline) {
    customOption = {
      ...customOption,
      outline: {
        size: contentOptionToUse.outline.outlineWeight ?? 1,
        color:
          contentOptionToUse.outline.outlineColor?.replace("#", "") ?? "FFFFFF",
      },
    };
  }

  if (contentOptionToUse.shadow?.hasShadow) {
    customOption = {
      ...customOption,
      shadow: {
        type: contentOptionToUse.shadow.shadowType ?? "outer",
        color:
          contentOptionToUse.shadow.shadowColor?.replace("#", "") ?? "000000",
        blur: contentOptionToUse.shadow.shadowBlur ?? 3,
        offset: contentOptionToUse.shadow.shadowOffset ?? 3,
        angle: contentOptionToUse.shadow.shadowAngle ?? 45,
        opacity: contentOptionToUse.shadow.shadowOpacity ?? 0.5,
      },
    };
  }

  // TODO: think how to handle the textboxLine1
  let customValues: PptxGenJS.default.TextPropsOptions = {};

  const coverOption = isTypePrimary
    ? settingValues.cover.main
    : settingValues.cover.secondary;

  // TODO: CONTINUE HERE
  if (isCover) {
    customValues = {
      ...customValues,
      ...{
        y: `${coverOption.coverTitlePositionY || 0}%`,
        fontSize: coverOption.coverTitleFontSize,
        fontFace: coverOption.coverTitleFont,
        color: coverOption.coverTitleFontColor,
      },
    };
  }

  customOption = {
    ...customOption,
    ...customValues,
  };
  let finalOption: PptxGenJS.default.TextPropsOptions = {
    ...DEFAULT_BASE_OPTION,
    ...customOption,
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

const parseFilename = ({
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
      ignoreSubcontent,
      separateSectionsToFiles,
      mainBackgroundColor,
      mainBackgroundImage,
    },
  } = settingValues;
  const hasSecondaryContent = !ignoreSubcontent;
  const primaryLinesArray = primaryLyric.split("\n");
  const secondaryLinesArray = secondaryLyric.split("\n");

  // 0. Perform length checking
  if (
    hasSecondaryContent &&
    primaryLinesArray.length !== secondaryLinesArray.length &&
    !confirm(
      `主内容有 ${primaryLinesArray.length} 行，而副内容有 ${secondaryLinesArray.length} 行，确定继续吗？`,
    )
  ) {
    return;
  }

  // 1. Get background prop for the presentation
  const backgroundProp = await getPptBackgroundProp({
    backgroundColor:
      mainBackgroundColor ??
      PPT_GENERATION_GENERAL_SETTINGS.mainBackgroundColor.defaultValue,
    backgroundImage:
      mainBackgroundImage ??
      PPT_GENERATION_GENERAL_SETTINGS.mainBackgroundImage.defaultValue,
  });

  // 2. Create a new Presentation instance
  const pres = createPresentationInstance({ backgroundProp: backgroundProp });

  // 3. Create Slides in the Presentation
  const { sectionsInfo } = createSlidesFromLyrics({
    pres,
    primaryLinesArray,
    secondaryLinesArray,
    settingValues,
  });

  // 4. Save the Presentation
  const { fileName, cleanFileName, fileNamePrefix, fileNameSuffix } =
    parseFilename({
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
      let tempPres = createPresentationInstance({ backgroundProp }); // for saving into zip file
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
