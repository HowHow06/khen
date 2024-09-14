import {
  InternalPresentation,
  InternalText,
  InternalTextPartBaseStyle,
} from "@/lib/react-pptx-preview/normalizer";
import { PptSettingsStateType } from "@/lib/types";
import type { PptxGenJS as PptxGenJSType2 } from "@/lib/types/pptxgenjs";
import {
  DataOrPathProps,
  ObjectOptions,
  SectionProps,
} from "@/lib/types/pptxgenjs/core-interfaces";
import { createPptInstance } from "@/lib/utils";

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

const getSectionBySlideName = (sections: SectionProps[], slideName: string) => {
  const result = sections.find(
    (section) =>
      section._slides.find((slide) => slide._name === slideName) !== undefined,
  );

  return result;
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
  const { pres } = await createPptInstance({
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

  const sections = presV2.sections;
  const slidesConfig = slides.map((slide) => ({
    masterName: slide._slideLayout._name || null,
    backgroundColor: slide.background?.color,
    backgroundImage: slide.background?.data,
    hidden: slide.hidden,
    sectionName: slide._name
      ? getSectionBySlideName(sections, slide._name)?.title
      : undefined,
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
