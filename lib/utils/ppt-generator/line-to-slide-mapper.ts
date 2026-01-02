/**
 * Maps line numbers in the lyrics to their corresponding slide indices
 * This enables the scroll-to-slide functionality when text changes
 */

export interface LineToSlideMapping {
  lineNumber: number;
  slideIndex: number;
  slideId: string; // unique identifier for the slide
  sectionName?: string;
  isSpecialLine: boolean; // section, cover, empty slide, etc.
  lineType: LineType;
}

export enum LineType {
  NORMAL = "normal",
  SECTION = "section",
  SUBSECTION = "subsection",
  COVER = "cover",
  EMPTY_SLIDE = "empty_slide",
  FILL_SLIDE = "fill_slide",
  METADATA = "metadata",
  SKIPPED = "skipped", // line was merged into previous slide
}

export class LineToSlideMapper {
  private mappings: LineToSlideMapping[] = [];
  public currentSlideIndex = 0; // one based index, if zero means no slide

  /**
   * Record that a line maps to a specific slide
   */
  addMapping(
    lineNumber: number,
    slideIndex: number,
    lineType: LineType,
    sectionName?: string,
  ): void {
    const slideId = `slide-${slideIndex}`;

    this.mappings.push({
      lineNumber,
      slideIndex,
      slideId,
      sectionName,
      isSpecialLine: lineType !== LineType.NORMAL,
      lineType,
    });
  }

  /**
   * Mark lines as skipped (when they're merged into current slide)
   */
  addSkippedLines(lineNumbers: number[], sectionName?: string): void {
    lineNumbers.forEach((lineNumber) => {
      this.mappings.push({
        lineNumber,
        slideIndex: this.currentSlideIndex, // current
        slideId: `slide-${this.currentSlideIndex}`,
        sectionName,
        isSpecialLine: false,
        lineType: LineType.SKIPPED,
      });
    });
  }

  /**
   * Increment slide index when a new slide is created
   */
  incrementSlideIndex(): void {
    this.currentSlideIndex++;
  }

  /**
   * Get the slide index for a specific line number
   */
  _getSlideIndexForLine(lineNumber: number): number | null {
    const mapping = this.mappings.find((m) => m.lineNumber === lineNumber);
    return mapping?.slideIndex ?? null;
  }

  /**
   * Get the slide ID for a specific line number
   */
  getSlideIdForLine(lineNumber: number): string | null {
    const mapping = this.mappings.find((m) => m.lineNumber === lineNumber);
    return mapping?.slideId ?? null;
  }

  /**
   * Get all mappings for debugging/analysis
   */
  getAllMappings(): LineToSlideMapping[] {
    return [...this.mappings];
  }

  /**
   * Get mappings for a specific slide
   */
  getLinesForSlide(slideIndex: number): LineToSlideMapping[] {
    return this.mappings.filter((m) => m.slideIndex === slideIndex);
  }

  /**
   * Clear all mappings (for new generation)
   */
  clear(): void {
    this.mappings = [];
    this.currentSlideIndex = 0;
  }

  /**
   * Find the closest slide for a line that might not have an exact mapping
   */
  getClosestSlideForLine(lineNumber: number): number | null {
    if (this.mappings.length === 0) return null;

    // Find exact match first
    const exactMatch = this._getSlideIndexForLine(lineNumber);
    if (exactMatch !== null) return exactMatch;

    // Find the closest slide before this line
    const beforeMappings = this.mappings
      .filter((m) => m.lineNumber <= lineNumber)
      .sort((a, b) => b.lineNumber - a.lineNumber);

    if (beforeMappings.length > 0) {
      return beforeMappings[0].slideIndex;
    }

    // If no mappings before, return the first slide
    return 0;
  }
}
