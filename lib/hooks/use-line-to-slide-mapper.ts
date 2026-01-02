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
   * Scroll to a specific slide by its index
   */
  const scrollPreviewToSlideIndex = useCallback(
    (slideIndex: number): boolean => {
      // Find the slide element using the slide index
      const slideElement = document.querySelector(
        `[data-slide-index="${slideIndex}"]`,
      );
      if (slideElement) {
        slideElement.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
      }

      // Fallback: try to find by slide ID
      const slideElementById = document.getElementById(`slide-${slideIndex}`);
      if (slideElementById) {
        slideElementById.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return true;
      }

      return false;
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
      return scrollPreviewToSlideIndex(slideIndex);
    },
    [getSlideIndexForLine, scrollPreviewToSlideIndex],
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

  /**
   * Get the first line number for a specific slide index
   */
  const getFirstLineForSlide = useCallback(
    (slideIndex: number): number | null => {
      const lines = lineMapperRef.current.getLinesForSlide(slideIndex);
      if (lines.length === 0) return null;
      // Sort by line number and return the first one
      const sortedLines = [...lines].sort(
        (a, b) => a.lineNumber - b.lineNumber,
      );
      return sortedLines[0].lineNumber;
    },
    [],
  );

  return {
    lineMapper: lineMapperRef.current,
    clearMappings,
    getSlideIndexForLine,
    scrollPreviewToSlideForLine,
    scrollPreviewToSlideIndex,
    getAllMappings,
    getLinesForSlide,
    getFirstLineForSlide,
    scrollPreviewToCursorPosition,
  };
};
