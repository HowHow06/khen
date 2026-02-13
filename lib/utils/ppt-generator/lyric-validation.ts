/**
 * Lyric validation utilities
 *
 * Lyric Syntax Reference:
 * - `# <Main Title> ## <Secondary Title>` = Cover/title slide (both on same line)
 * - `----` or `---- <Song Name>` = Song section (separates different songs in a medley)
 * - `---` or `--- <Section Name>` = Subsection (verse, chorus, bridge, etc.)
 * - `***` = Empty slide
 * - `**` = Page break/fill slide
 * - `@<key>: <value>` = Metadata (not rendered)
 * - `{...}` = JSON settings overwrite (after section markers)
 */

export type LyricWarning = {
  type: "error" | "warning" | "info";
  message: string;
  lineNumber?: number;
  suggestion?: string;
};

/**
 * Check if a line is a cover/title slide
 * Cover slides use: # <Main Title> ## <Secondary Title>
 */
const isCoverLine = (line: string): boolean => {
  const trimmed = line.trim();
  // Must start with # and contain ## for title slide
  return trimmed.startsWith("#") && trimmed.includes("##");
};

/**
 * Check if a line is a song section marker (----)
 * Song sections separate different songs in a medley
 */
const isSongSectionLine = (line: string): boolean => {
  return line.trim().startsWith("----");
};

/**
 * Check if a line is a subsection marker (---)
 * Subsections mark verse, chorus, bridge, etc.
 */
const isSubsectionLine = (line: string): boolean => {
  const trimmed = line.trim();
  // Must start with --- but NOT ---- (which is song section)
  return trimmed.startsWith("---") && !trimmed.startsWith("----");
};

/**
 * Check if a line is an empty slide marker (***)
 */
const isEmptySlideMarker = (line: string): boolean => {
  return line.trim() === "***";
};

/**
 * Check if a line is a page break/fill slide marker (**)
 */
const isPageBreakMarker = (line: string): boolean => {
  return line.trim() === "**";
};

/**
 * Check if a line is metadata (@key: value)
 */
const isMetadataLine = (line: string): boolean => {
  return line.trim().startsWith("@");
};

/**
 * Check if a line is a JSON settings overwrite
 */
const isJsonOverwriteLine = (line: string): boolean => {
  const trimmed = line.trim();
  return trimmed.startsWith("{") && trimmed.endsWith("}");
};

/**
 * Check if a line is any kind of special marker (not regular content)
 */
const isSpecialMarker = (line: string): boolean => {
  return (
    isCoverLine(line) ||
    isSongSectionLine(line) ||
    isSubsectionLine(line) ||
    isEmptySlideMarker(line) ||
    isPageBreakMarker(line) ||
    isMetadataLine(line) ||
    isJsonOverwriteLine(line)
  );
};

/**
 * Validate lyrics and return warnings
 * Note: These are heuristic-based and may not be perfectly accurate
 */
export const validateLyrics = (lyrics: string): LyricWarning[] => {
  const warnings: LyricWarning[] = [];
  const lines = lyrics.split("\n");

  let openBracketLine: number | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    const lineNumber = i + 1;

    // Skip empty lines
    if (!trimmedLine) {
      continue;
    }

    // Check for unclosed brackets/braces (for JSON overwrites)
    if (trimmedLine.includes("{") && !trimmedLine.includes("}")) {
      openBracketLine = lineNumber;
    } else if (trimmedLine.includes("}") && openBracketLine !== null) {
      openBracketLine = null;
    }
  }

  // Check for unclosed brackets
  if (openBracketLine !== null) {
    warnings.push({
      type: "error",
      message: `Unclosed bracket starting at line ${openBracketLine}`,
      lineNumber: openBracketLine,
      suggestion: "Make sure all { have matching }",
    });
  }

  return warnings;
};

/**
 * Count slides that will be generated from lyrics
 * This is a rough estimate based on line count and section markers
 */
export const estimateSlideCount = (
  mainLyrics: string,
  linesPerSlide: number = 2
): number => {
  const lines = mainLyrics.split("\n");
  let slideCount = 0;
  let currentLinesInSlide = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      continue;
    }

    // Cover/title slide (# Title ## Subtitle)
    if (isCoverLine(trimmed)) {
      if (currentLinesInSlide > 0) {
        slideCount++;
        currentLinesInSlide = 0;
      }
      slideCount++; // Cover slide itself
      continue;
    }

    // Song section marker (----) - doesn't create a slide itself
    if (isSongSectionLine(trimmed)) {
      if (currentLinesInSlide > 0) {
        slideCount++;
        currentLinesInSlide = 0;
      }
      continue;
    }

    // Subsection marker (---) - doesn't create a slide itself
    if (isSubsectionLine(trimmed)) {
      if (currentLinesInSlide > 0) {
        slideCount++;
        currentLinesInSlide = 0;
      }
      continue;
    }

    // Empty slide marker (***)
    if (isEmptySlideMarker(trimmed)) {
      if (currentLinesInSlide > 0) {
        slideCount++;
        currentLinesInSlide = 0;
      }
      slideCount++; // Empty slide itself
      continue;
    }

    // Page break marker (**)
    if (isPageBreakMarker(trimmed)) {
      if (currentLinesInSlide > 0) {
        slideCount++;
        currentLinesInSlide = 0;
      }
      continue;
    }

    // Skip metadata and JSON overwrites
    if (isMetadataLine(trimmed) || isJsonOverwriteLine(trimmed)) {
      continue;
    }

    // Regular content line
    currentLinesInSlide++;

    // Check if we've filled a slide
    if (currentLinesInSlide >= linesPerSlide) {
      slideCount++;
      currentLinesInSlide = 0;
    }
  }

  // Don't forget remaining lines
  if (currentLinesInSlide > 0) {
    slideCount++;
  }

  return slideCount;
};

/**
 * Get a summary of the lyrics content
 */
export const getLyricsSummary = (
  mainLyrics: string
): {
  lineCount: number;
  songCount: number;
  subsectionCount: number;
  hasCover: boolean;
  estimatedSlides: number;
} => {
  const lines = mainLyrics.split("\n");

  // Count content lines (excluding all special markers)
  const contentLines = lines.filter((l) => {
    const trimmed = l.trim();
    return trimmed && !isSpecialMarker(trimmed);
  });

  // Count song sections (----)
  const songSections = lines.filter((l) => isSongSectionLine(l));

  // Count subsections (--- but not ----)
  const subsections = lines.filter((l) => isSubsectionLine(l));

  // Check for cover slides (# Title ## Subtitle)
  const hasCover = lines.some((l) => isCoverLine(l));

  return {
    lineCount: contentLines.length,
    songCount: songSections.length,
    subsectionCount: subsections.length,
    hasCover,
    estimatedSlides: estimateSlideCount(mainLyrics),
  };
};
