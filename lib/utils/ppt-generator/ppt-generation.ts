import {
  DEFAULT_AUTHOR,
  DEFAULT_PPT_LAYOUT,
  DEFAULT_SUBJECT,
  DEFAULT_TITLE,
  MASTER_SLIDE_BACKGROUND_COLOR,
  MASTER_SLIDE_BACKGROUND_IMAGE,
  PPT_GENERATION_COMBINED_GENERAL_SETTINGS,
  SETTING_FIELD_TYPE,
} from "@/lib/constant";
import { FieldTypeToTypeScriptType, PptSettingsStateType } from "@/lib/types";
import jszip from "jszip";
import pptxgenjs from "pptxgenjs";
import { createSlidesFromLyricsRefactored } from "./create-slides-from-lyrics-v2";
import { LineToSlideMapper } from "./line-to-slide-mapper";
import { removeAllOverwritesFromLyrics } from "./lyrics-overwrite";
import { mergeOverwritesFromLyrics } from "./settings-diff";
import {
  getBase64FromImageField,
  getSectionColorSlideMasterTitle,
  getSectionImageSlideMasterTitle,
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
  lineMapper,
}: {
  settingValues: PptSettingsStateType;
  primaryLyric: string;
  secondaryLyric: string;
  lineMapper?: LineToSlideMapper;
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
  const { sectionsInfo } = createSlidesFromLyricsRefactored({
    pres,
    primaryLinesArray,
    secondaryLinesArray,
    settingValues,
    lineMapper,
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
  lineMapper,
}: {
  settingValues: PptSettingsStateType;
  primaryLyric: string;
  secondaryLyric: string;
  lineMapper?: LineToSlideMapper;
}) => {
  // Merge inline overwrites from lyrics with settings
  const mergedSettings = mergeOverwritesFromLyrics(settingValues, primaryLyric);

  // Strip overwrite JSON lines from lyrics before processing
  const strippedPrimaryLyric = removeAllOverwritesFromLyrics(primaryLyric);
  const strippedSecondaryLyric = removeAllOverwritesFromLyrics(secondaryLyric);

  const {
    general: { separateSectionsToFiles },
  } = mergedSettings;

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
    settingValues: mergedSettings,
    primaryLyric: strippedPrimaryLyric,
    secondaryLyric: strippedSecondaryLyric,
    lineMapper,
  });

  // 4. Save the Presentation
  const { fileName, cleanFileName, fileNamePrefix, fileNameSuffix } =
    parsePptFilename({
      filename: mergedSettings.file.filename,
      prefix: mergedSettings.file.filenamePrefix,
      suffix: mergedSettings.file.filenameSuffix,
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

      createSlidesFromLyricsRefactored({
        pres: tempPres,
        primaryLinesArray: tempPrimaryLinesArray,
        secondaryLinesArray: tempSecondaryLinesArray,
        settingValues: mergedSettings,
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
