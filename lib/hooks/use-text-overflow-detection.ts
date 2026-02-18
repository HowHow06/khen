"use client";

import { InternalPresentation } from "@/lib/react-pptx-preview/normalizer";
import {
  calculatePercentage,
  layoutToInches,
  POINTS_TO_INCHES,
} from "@/lib/react-pptx-preview/util";
import {
  LineToSlideMapper,
  LineType,
} from "@/lib/utils/ppt-generator/line-to-slide-mapper";
import { LyricWarning } from "@/lib/utils/ppt-generator/lyric-validation";
import { useCallback, useEffect, useRef, useState } from "react";

const MEASUREMENT_SLIDE_WIDTH = 800; // Fixed reference width in pixels

/**
 * Measures text objects in a previewConfig for horizontal overflow (text wrapping).
 * Uses a hidden off-screen container to render text with matching styles
 * and checks if any single text part wraps to multiple lines.
 */
export const useTextOverflowDetection = ({
  previewConfig,
  lineMapper,
  mainLines,
  secondaryLines,
}: {
  previewConfig: InternalPresentation | undefined;
  lineMapper: LineToSlideMapper;
  mainLines: string[];
  secondaryLines: string[];
}) => {
  const [overflowWarnings, setOverflowWarnings] = useState<LyricWarning[]>([]);
  const [overflowSlideIndices, setOverflowSlideIndices] = useState<Set<number>>(
    new Set(),
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Create hidden container on mount
  useEffect(() => {
    const container = document.createElement("div");
    container.id = "overflow-detection-container";
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.visibility = "hidden";
    container.style.pointerEvents = "none";
    document.body.appendChild(container);
    containerRef.current = container;

    return () => {
      document.body.removeChild(container);
      containerRef.current = null;
    };
  }, []);

  const measureOverflow = useCallback(() => {
    if (!previewConfig || !containerRef.current) {
      setOverflowWarnings([]);
      setOverflowSlideIndices(new Set());
      return;
    }

    const container = containerRef.current;
    const dimensions = layoutToInches(previewConfig.layout);
    const slideWidth = MEASUREMENT_SLIDE_WIDTH;

    const pointsToPx = (points: number) =>
      ((points * POINTS_TO_INCHES) / dimensions[0]) * slideWidth;

    const warnings: LyricWarning[] = [];
    const overflowSlides = new Set<number>();

    // Clear previous measurement elements
    container.innerHTML = "";

    for (let slideIdx = 0; slideIdx < previewConfig.slides.length; slideIdx++) {
      const slide = previewConfig.slides[slideIdx];
      const slideIndex = slideIdx + 1; // 1-based

      // Get line mappings for this slide (only NORMAL lines)
      const lineMappings = lineMapper
        .getLinesForSlide(slideIndex)
        .filter((m) => m.lineType === LineType.NORMAL)
        .sort((a, b) => a.lineNumber - b.lineNumber);

      // Filter text objects only
      const textObjects = slide.objects.filter((o) => o.kind === "text");

      // Build a set of wrapping text strings for this slide
      const wrappingTexts = new Set<string>();

      for (let objIdx = 0; objIdx < textObjects.length; objIdx++) {
        const textObj = textObjects[objIdx];
        if (textObj.kind !== "text") continue;

        // Compute textbox pixel width from percentage/inches
        const wPercentage = calculatePercentage(textObj.style.w, dimensions[0]);
        const textboxPxWidth = (wPercentage / 100) * slideWidth;

        // Get the base text object style (parent-level styles)
        const baseStyle = textObj.style;

        // Check each text part
        for (let partIdx = 0; partIdx < textObj.text.length; partIdx++) {
          const part = textObj.text[partIdx];
          if (!part.text || !part.text.trim()) continue;

          // Create a measurement element matching the text styles
          const measurer = document.createElement("div");
          measurer.style.width = `${textboxPxWidth}px`;
          measurer.style.whiteSpace = "pre-wrap";
          measurer.style.wordBreak = "break-word";
          measurer.style.position = "absolute";
          measurer.style.visibility = "hidden";

          // Apply text styles - part style overrides base object style
          const fontSize = part.style.fontSize ?? baseStyle.fontSize;
          const fontFace = part.style.fontFace ?? baseStyle.fontFace;
          const bold = part.style.bold ?? baseStyle.bold;
          const italic = part.style.italic ?? baseStyle.italic;
          const charSpacing = part.style.charSpacing ?? baseStyle.charSpacing;
          const lineSpacing = part.style.lineSpacing ?? baseStyle.lineSpacing;

          if (fontSize) {
            measurer.style.fontSize = `${pointsToPx(fontSize)}px`;
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
            measurer.style.letterSpacing = `${pointsToPx(charSpacing)}px`;
          }
          if (lineSpacing) {
            measurer.style.lineHeight = `${pointsToPx(lineSpacing)}px`;
          }

          // Apply margin/padding from the text object style
          if (baseStyle.margin !== undefined) {
            if (Array.isArray(baseStyle.margin)) {
              measurer.style.padding = (baseStyle.margin as number[])
                .map((m) => `${pointsToPx(m)}px`)
                .join(" ");
            } else {
              measurer.style.padding = `0 ${pointsToPx(baseStyle.margin as number)}px`;
            }
          }

          measurer.textContent = part.text;
          container.appendChild(measurer);

          // Measure: create a single-line reference to compare
          const singleLineMeasurer = document.createElement("div");
          singleLineMeasurer.style.cssText = measurer.style.cssText;
          singleLineMeasurer.style.whiteSpace = "nowrap";
          singleLineMeasurer.style.width = "auto";
          singleLineMeasurer.textContent = part.text;
          container.appendChild(singleLineMeasurer);

          const multiLineHeight = measurer.offsetHeight;
          const singleLineHeight = singleLineMeasurer.offsetHeight;

          // If the multi-line rendered height is taller than single-line,
          // the text is wrapping
          if (
            multiLineHeight > singleLineHeight * 1.1 && // 10% tolerance
            singleLineHeight > 0
          ) {
            wrappingTexts.add(part.text.trim());
            overflowSlides.add(slideIndex);
          }

          // Clean up measurement elements
          container.removeChild(measurer);
          container.removeChild(singleLineMeasurer);
        }
      }

      // Match wrapping text to line numbers using the original lyrics
      // This avoids the mapping issue with interleaved secondary text objects
      if (wrappingTexts.size > 0) {
        for (const mapping of lineMappings) {
          const lineIdx = mapping.lineNumber;

          // Check main lines
          if (mainLines && lineIdx >= 0 && lineIdx < mainLines.length) {
            const originalLine = mainLines[lineIdx]?.trim();
            if (originalLine && wrappingTexts.has(originalLine)) {
              warnings.push({
                type: "warning",
                message: `Line ${lineIdx + 1} may wrap`,
                lineNumber: lineIdx + 1, // Convert to 1-based
                contentType: "main",
              });
              overflowSlides.add(slideIndex);
            }
          }

          // Check secondary lines
          if (
            secondaryLines &&
            lineIdx >= 0 &&
            lineIdx < secondaryLines.length
          ) {
            const secondaryLine = secondaryLines[lineIdx]?.trim();
            if (secondaryLine && wrappingTexts.has(secondaryLine)) {
              warnings.push({
                type: "warning",
                message: `Line ${lineIdx + 1} may wrap`,
                lineNumber: lineIdx + 1, // Convert to 1-based
                contentType: "secondary",
              });
              overflowSlides.add(slideIndex);
            }
          }
        }
      }
    }

    // Clean up any remaining elements
    container.innerHTML = "";

    setOverflowWarnings(warnings);
    setOverflowSlideIndices(overflowSlides);
  }, [previewConfig, lineMapper, mainLines, secondaryLines]);

  // Run measurement when previewConfig changes (debounced)
  useEffect(() => {
    if (!previewConfig) {
      setOverflowWarnings([]);
      setOverflowSlideIndices(new Set());
      return;
    }

    const timeout = setTimeout(() => {
      measureOverflow();
    }, 500);

    return () => clearTimeout(timeout);
  }, [previewConfig, measureOverflow]);

  return {
    overflowWarnings,
    overflowSlideIndices,
  };
};
