import { chromium } from "playwright";
import type { InternalPresentation } from "../../lib/react-pptx-preview/normalizer";
import type { LineToSlideMapping } from "../../lib/utils/ppt-generator/line-to-slide-mapper";
import { LineType } from "../../lib/utils/ppt-generator/line-to-slide-mapper";
import type { LyricWarning } from "../../lib/utils/ppt-generator/lyric-validation";

const MEASUREMENT_SLIDE_WIDTH = 800;
const POINTS_TO_INCHES = 1 / 72;

type TextWrapWarning = LyricWarning & {
  code: "TEXT_WRAP";
  slideIndex: number;
  text: string;
  lineType?: string;
  sourceText?: string;
};

type DetectTextOverflowOptions = {
  previewConfig: InternalPresentation;
  lineMappings: LineToSlideMapping[];
  mainLines: string[];
  secondaryLines: string[];
};

type BrowserDetectionResult = {
  warnings: TextWrapWarning[];
  overflowSlideIndices: number[];
};

const browserDetector = `({
  previewConfig,
  lineMappings,
  mainLines,
  secondaryLines,
  measurementSlideWidth,
  pointsToInches,
  reportableLineTypes,
}) => {
  const layoutToInches = (layout) => {
    switch (layout) {
      case "16x10":
        return [10, 6.25];
      case "16x9":
        return [10, 5.625];
      case "4x3":
        return [10, 7.5];
      case "wide":
        return [13.3, 7.5];
      default:
        return typeof layout === "object" && layout
          ? [layout.width, layout.height]
          : [10, 5.625];
    }
  };

  const calculatePercentage = (value, total) =>
    typeof value === "number" ? (value / total) * 100 : parseInt(value, 10);

  const dimensions = layoutToInches(previewConfig.layout);
  const pointsToPx = (points) =>
    ((points * pointsToInches) / dimensions[0]) * measurementSlideWidth;
  const root = document.getElementById("overflow-root");
  if (!root) {
    return { warnings: [], overflowSlideIndices: [] };
  }

  root.style.position = "absolute";
  root.style.left = "-9999px";
  root.style.top = "0";
  root.style.visibility = "hidden";
  root.style.pointerEvents = "none";

  const warnings = [];
  const overflowSlideIndices = new Set();
  const seenWarnings = new Set();

  const lineMatchesWrappedText = (sourceLine, wrappedText) => {
    if (!sourceLine || !wrappedText) return false;
    const source = sourceLine.trim();
    const markerStrippedSource = source
      .replace(/^#+\\s*/, "")
      .replace(/^---+\\s*/, "")
      .trim();
    return (
      source === wrappedText ||
      markerStrippedSource === wrappedText ||
      source.includes(wrappedText) ||
      markerStrippedSource.includes(wrappedText)
    );
  };

  const addWarning = ({ mapping, contentType, sourceLine, wrappedText }) => {
    const key =
      contentType +
      ":" +
      mapping.lineNumber +
      ":" +
      mapping.slideIndex +
      ":" +
      wrappedText;
    if (seenWarnings.has(key)) return;

    warnings.push({
      type: "warning",
      code: "TEXT_WRAP",
      message:
        "Line " +
        (mapping.lineNumber + 1) +
        " may wrap on slide " +
        mapping.slideIndex,
      lineNumber: mapping.lineNumber + 1,
      contentType,
      slideIndex: mapping.slideIndex,
      lineType: mapping.lineType,
      text: wrappedText,
      sourceText: sourceLine,
    });
    seenWarnings.add(key);
  };

  previewConfig.slides.forEach((slide, slideIdx) => {
    const slideIndex = slideIdx + 1;
    const slideLineMappings = lineMappings
      .filter(
        (mapping) =>
          mapping.slideIndex === slideIndex &&
          reportableLineTypes.includes(mapping.lineType),
      )
      .sort((a, b) => a.lineNumber - b.lineNumber);
    const textObjects = slide.objects.filter((object) => object.kind === "text");
    const wrappingTexts = new Set();

    textObjects.forEach((textObject) => {
      const wPercentage = calculatePercentage(textObject.style.w, dimensions[0]);
      const textboxPxWidth = (wPercentage / 100) * measurementSlideWidth;
      const baseStyle = textObject.style;

      textObject.text.forEach((part) => {
        const text = part.text && part.text.trim();
        if (!text) return;

        const measurer = document.createElement("div");
        measurer.style.width = textboxPxWidth + "px";
        measurer.style.whiteSpace = "pre-wrap";
        measurer.style.wordBreak = "break-word";
        measurer.style.position = "absolute";
        measurer.style.visibility = "hidden";

        const fontSize = part.style.fontSize ?? baseStyle.fontSize;
        const fontFace = part.style.fontFace ?? baseStyle.fontFace;
        const bold = part.style.bold ?? baseStyle.bold;
        const italic = part.style.italic ?? baseStyle.italic;
        const charSpacing = part.style.charSpacing ?? baseStyle.charSpacing;
        const lineSpacing = part.style.lineSpacing ?? baseStyle.lineSpacing;

        if (fontSize) {
          measurer.style.fontSize = pointsToPx(fontSize) + "px";
        }
        if (fontFace) {
          measurer.style.fontFamily = fontFace;
        }
        if (bold) {
          measurer.style.fontWeight = "bold";
        }
        if (italic) {
          measurer.style.fontStyle = "italic";
        }
        if (charSpacing) {
          measurer.style.letterSpacing = pointsToPx(charSpacing) + "px";
        }
        if (lineSpacing) {
          measurer.style.lineHeight = pointsToPx(lineSpacing) + "px";
        }
        if (baseStyle.margin !== undefined) {
          if (Array.isArray(baseStyle.margin)) {
            measurer.style.padding = baseStyle.margin
              .map((margin) => pointsToPx(margin) + "px")
              .join(" ");
          } else {
            measurer.style.padding =
              "0 " + pointsToPx(baseStyle.margin) + "px";
          }
        }

        measurer.textContent = part.text;
        root.appendChild(measurer);

        const singleLineMeasurer = document.createElement("div");
        singleLineMeasurer.style.cssText = measurer.style.cssText;
        singleLineMeasurer.style.whiteSpace = "nowrap";
        singleLineMeasurer.style.width = "auto";
        singleLineMeasurer.textContent = part.text;
        root.appendChild(singleLineMeasurer);

        const multiLineHeight = measurer.offsetHeight;
        const singleLineHeight = singleLineMeasurer.offsetHeight;

        if (
          singleLineHeight > 0 &&
          multiLineHeight > singleLineHeight * 1.1
        ) {
          wrappingTexts.add(text);
          overflowSlideIndices.add(slideIndex);
        }

        root.removeChild(measurer);
        root.removeChild(singleLineMeasurer);
      });
    });

    if (wrappingTexts.size === 0) return;

    slideLineMappings.forEach((mapping) => {
      const mainLine = mainLines[mapping.lineNumber]?.trim();
      if (mainLine) {
        for (const wrappingText of wrappingTexts) {
          if (lineMatchesWrappedText(mainLine, wrappingText)) {
            addWarning({
              mapping,
              contentType: "main",
              sourceLine: mainLine,
              wrappedText: wrappingText,
            });
          }
        }
      }

      const secondaryLine = secondaryLines[mapping.lineNumber]?.trim();
      if (secondaryLine && secondaryLine !== mainLine) {
        for (const wrappingText of wrappingTexts) {
          if (lineMatchesWrappedText(secondaryLine, wrappingText)) {
            addWarning({
              mapping,
              contentType: "secondary",
              sourceLine: secondaryLine,
              wrappedText: wrappingText,
            });
          }
        }
      }
    });
  });

  root.innerHTML = "";

  return {
    warnings,
    overflowSlideIndices: Array.from(overflowSlideIndices).sort(
      (a, b) => a - b,
    ),
  };
}`;

export async function detectTextOverflowWarnings({
  previewConfig,
  lineMappings,
  mainLines,
  secondaryLines,
}: DetectTextOverflowOptions): Promise<BrowserDetectionResult> {
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();
    await page.setContent(
      '<!DOCTYPE html><html><body><div id="overflow-root"></div></body></html>',
      { waitUntil: "domcontentloaded" },
    );

    const detectorInput = JSON.stringify({
      previewConfig,
      lineMappings,
      mainLines,
      secondaryLines,
      measurementSlideWidth: MEASUREMENT_SLIDE_WIDTH,
      pointsToInches: POINTS_TO_INCHES,
      reportableLineTypes: [LineType.NORMAL, LineType.COVER],
    });

    return (await page.evaluate(
      `(${browserDetector})(${detectorInput})`,
    )) as BrowserDetectionResult;
  } finally {
    await browser.close();
  }
}
