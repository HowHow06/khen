"use client";

import { InternalPresentation } from "@/lib/react-pptx-preview/normalizer";
import { useTextOverflowDetection } from "@/lib/hooks/use-text-overflow-detection";
import { generatePreviewConfig } from "@/lib/utils/ppt-generator/ppt-preview";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";
import { LineToSlideMapper } from "@/lib/utils/ppt-generator/line-to-slide-mapper";

const DEBOUNCE_MS = 800;

/**
 * Hidden component that generates its own previewConfig independently
 * and runs overflow detection. Always mounted in PptGeneratorContent
 * so it works regardless of whether MiniPreview or the modal is open.
 */
const HiddenOverflowDetector = () => {
  const {
    mainText,
    secondaryText,
    settingsValues,
    setOverflowWarnings,
    setOverflowSlideIndices,
  } = usePptGeneratorFormContext();

  // Use a separate LineToSlideMapper for overflow detection
  // so we don't interfere with the main one used for scroll-to-slide
  const overflowMapperRef = useRef<LineToSlideMapper>(new LineToSlideMapper());

  const [previewConfig, setPreviewConfig] =
    useState<InternalPresentation>();

  // Generate preview config independently (debounced)
  useEffect(() => {
    if (!mainText.trim()) {
      setPreviewConfig(undefined);
      setOverflowWarnings([]);
      setOverflowSlideIndices(new Set());
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        overflowMapperRef.current.clear();
        const config = await generatePreviewConfig({
          settingValues: settingsValues,
          primaryLyric: mainText,
          secondaryLyric: secondaryText,
          lineMapper: overflowMapperRef.current,
        });
        setPreviewConfig(config);
      } catch (err) {
        // Silently fail - overflow detection is non-critical
        console.warn("Overflow detection preview generation failed:", err);
        setPreviewConfig(undefined);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [
    mainText,
    secondaryText,
    settingsValues,
    setOverflowWarnings,
    setOverflowSlideIndices,
  ]);

  // Split mainText into lines for text content matching
  const mainLines = useMemo(() => mainText.split("\n"), [mainText]);

  // Run overflow detection on previewConfig
  const { overflowWarnings, overflowSlideIndices } =
    useTextOverflowDetection({
      previewConfig,
      lineMapper: overflowMapperRef.current,
      mainLines,
    });

  // Push results to context
  useEffect(() => {
    setOverflowWarnings(overflowWarnings);
  }, [overflowWarnings, setOverflowWarnings]);

  useEffect(() => {
    setOverflowSlideIndices(overflowSlideIndices);
  }, [overflowSlideIndices, setOverflowSlideIndices]);

  // This component renders nothing visible
  return null;
};

export default HiddenOverflowDetector;
