import { LineToSlideMapper } from "@/lib/utils/ppt-generator/line-to-slide-mapper";
import { useCallback, useRef } from "react";

/**
 * Hook to manage line-to-slide mapping and scroll-to-slide functionality
 */
export const useLineToSlideMapper = () => {
  const lineMapperRef = useRef<LineToSlideMapper>(new LineToSlideMapper());

  /**
   * Clear mappings when starting fresh
   */
  const clearMappings = useCallback(() => {
    lineMapperRef.current.clear();
  }, []);

  /**
   * Get the slide index for a specific line number
   */
  const getSlideIndexForLine = useCallback(
    (lineNumber: number): number | null => {
      return lineMapperRef.current.getClosestSlideForLine(lineNumber);
    },
    [],
  );

  /**
   * Scroll to the slide containing the specified line
   */
  const scrollPreviewToSlideForLine = useCallback(
    (lineNumber: number): boolean => {
      const slideIndex = getSlideIndexForLine(lineNumber);
      if (slideIndex === null) return false;

      // Find the slide element using the slide index
      // This depends on how slides are rendered in your Preview component
      const slideElement = document.querySelector(
        `[data-slide-index="${slideIndex}"]`,
      );
      if (slideElement) {
        slideElement.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
      }

      // Fallback: try to find by slide ID
      const slideId = lineMapperRef.current.getSlideIdForLine(lineNumber);
      if (slideId) {
        const slideElementById = document.getElementById(slideId);
        if (slideElementById) {
          slideElementById.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          return true;
        }
      }

      return false;
    },
    [getSlideIndexForLine],
  );

  /**
   * Get cursor position and scroll to corresponding slide
   */
  const scrollPreviewToCursorPosition = useCallback(
    (text: string, cursorPosition: number) => {
      const textBeforeCursor = text.substring(0, cursorPosition);
      const lineNumber = textBeforeCursor.split("\n").length - 1; // the line number is 0-based

      const slideIndex = getSlideIndexForLine(lineNumber);
      if (slideIndex !== null) {
        scrollPreviewToSlideForLine(lineNumber);
        return slideIndex;
      }

      return null;
    },
    [getSlideIndexForLine, scrollPreviewToSlideForLine],
  );

  /**
   * Get all mappings for debugging
   */
  const getAllMappings = useCallback(() => {
    return lineMapperRef.current.getAllMappings();
  }, []);

  /**
   * Get the lines that belong to a specific slide
   */
  const getLinesForSlide = useCallback((slideIndex: number) => {
    return lineMapperRef.current.getLinesForSlide(slideIndex);
  }, []);

  return {
    lineMapper: lineMapperRef.current,
    clearMappings,
    getSlideIndexForLine,
    scrollPreviewToSlideForLine,
    getAllMappings,
    getLinesForSlide,
    scrollPreviewToCursorPosition,
  };
};
