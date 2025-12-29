import { LYRIC_SECTION, SECTION_PREFIX } from "@/lib/constant";
import { SectionSettingsKeyType } from "@/lib/types";

/**
 * Regex to match the overwrite JSON line after a section header.
 * The JSON line is expected to start with '{' and end with '}'.
 */
const OVERWRITE_JSON_REGEX = /^\{.*\}$/;

/**
 * Check if a line is a section header (starts with "----")
 */
function isSectionHeader(line: string): boolean {
  return line.startsWith(LYRIC_SECTION.SECTION);
}

/**
 * Check if a line is an overwrite JSON line.
 */
function isOverwriteJsonLine(line: string): boolean {
  return OVERWRITE_JSON_REGEX.test(line.trim());
}

/**
 * Insert or update the overwrite JSON in the lyrics after section headers.
 *
 * Expected format:
 * ```
 * ---- section 1
 * {"general": {"key": "value"}}
 * # cover
 * --- subsection 1
 * lyrics here
 * ```
 *
 * @param lyrics - The current lyrics text
 * @param overwriteJson - The JSON string to insert (empty string to remove overwrites)
 * @returns The updated lyrics text
 */
export function insertOrUpdateOverwriteInLyrics(
  lyrics: string,
  overwriteJson: string,
): string {
  const lines = lyrics.split("\n");
  const resultLines: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const currentLine = lines[i];
    resultLines.push(currentLine);

    // Check if this is a section header
    if (isSectionHeader(currentLine)) {
      i++;

      // Check if the next line is an existing overwrite JSON
      if (i < lines.length && isOverwriteJsonLine(lines[i])) {
        // Replace or remove the existing overwrite
        if (overwriteJson) {
          resultLines.push(overwriteJson);
        }
        // Skip the old JSON line (it's already been handled)
        i++;
      } else {
        // No existing overwrite, insert new one if provided
        if (overwriteJson) {
          resultLines.push(overwriteJson);
        }
      }
    } else {
      i++;
    }
  }

  return resultLines.join("\n");
}

/**
 * Insert or update section-specific overwrite JSON in the lyrics.
 * Each section can have its own overwrite based on the section number.
 * Also supports a global/header overwrite that appears before the first section.
 *
 * @param lyrics - The current lyrics text
 * @param sectionOverwrites - Map of section key (e.g., "section1") to JSON string
 * @param globalOverwriteJson - Optional global overwrite JSON to insert before the first section
 * @returns The updated lyrics text
 */
export function insertOrUpdateSectionOverwritesInLyrics(
  lyrics: string,
  sectionOverwrites: Map<SectionSettingsKeyType, string>,
  globalOverwriteJson?: string,
): string {
  const lines = lyrics.split("\n");
  const resultLines: string[] = [];
  let i = 0;
  let sectionNumber = 0;
  let hasInsertedGlobalOverwrite = false;

  // Check if the first non-empty line is a global overwrite (before first section)
  // First, skip any leading empty lines or existing global overwrite
  while (i < lines.length) {
    const currentLine = lines[i];

    // If we haven't seen a section yet and this is a JSON line, it's a global overwrite to replace
    if (
      !hasInsertedGlobalOverwrite &&
      sectionNumber === 0 &&
      isOverwriteJsonLine(currentLine)
    ) {
      // Skip the old global overwrite line
      i++;
      continue;
    }

    // Check if this is a section header
    if (isSectionHeader(currentLine)) {
      // Insert global overwrite before the first section
      if (
        !hasInsertedGlobalOverwrite &&
        sectionNumber === 0 &&
        globalOverwriteJson
      ) {
        resultLines.push(globalOverwriteJson);
        hasInsertedGlobalOverwrite = true;
      }

      resultLines.push(currentLine);
      sectionNumber++;
      const sectionKey =
        `${SECTION_PREFIX}${sectionNumber}` as SectionSettingsKeyType;
      const overwriteJson = sectionOverwrites.get(sectionKey) ?? "";

      i++;

      // Check if the next line is an existing overwrite JSON
      if (i < lines.length && isOverwriteJsonLine(lines[i])) {
        // Replace or remove the existing overwrite
        if (overwriteJson) {
          resultLines.push(overwriteJson);
        }
        // Skip the old JSON line (it's already been handled)
        i++;
      } else {
        // No existing overwrite, insert new one if provided
        if (overwriteJson) {
          resultLines.push(overwriteJson);
        }
      }
    } else {
      resultLines.push(currentLine);
      i++;
    }
  }

  return resultLines.join("\n");
}

/**
 * Remove all overwrite JSON lines from the lyrics.
 * This includes both global overwrites (before first section) and section-specific overwrites.
 *
 * @param lyrics - The current lyrics text
 * @returns The lyrics text with all overwrites removed
 */
export function removeAllOverwritesFromLyrics(lyrics: string): string {
  const lines = lyrics.split("\n");
  const resultLines: string[] = [];
  let i = 0;
  let hasSeenSection = false;

  while (i < lines.length) {
    const currentLine = lines[i];

    // Check if this is a global overwrite (JSON line before first section)
    if (!hasSeenSection && isOverwriteJsonLine(currentLine)) {
      // Skip global overwrite JSON line
      i++;
      continue;
    }

    // Track when we've seen a section
    if (isSectionHeader(currentLine)) {
      hasSeenSection = true;
    }

    // Check if previous line was a section header and current line is overwrite JSON
    const prevLine =
      resultLines.length > 0 ? resultLines[resultLines.length - 1] : null;
    const isPrevSectionHeader = prevLine && isSectionHeader(prevLine);

    if (isPrevSectionHeader && isOverwriteJsonLine(currentLine)) {
      // Skip this overwrite JSON line
      i++;
      continue;
    }

    resultLines.push(currentLine);
    i++;
  }

  return resultLines.join("\n");
}

/**
 * Extract the overwrite JSON from lyrics (from the first section header).
 *
 * @param lyrics - The lyrics text
 * @returns The parsed overwrite object or null if not found
 */
export function extractOverwriteFromLyrics(
  lyrics: string,
): Record<string, any> | null {
  const lines = lyrics.split("\n");

  for (let i = 0; i < lines.length - 1; i++) {
    if (isSectionHeader(lines[i])) {
      const nextLine = lines[i + 1];
      if (isOverwriteJsonLine(nextLine)) {
        try {
          return JSON.parse(nextLine.trim());
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

/**
 * Parse result containing global overwrite and section-specific overwrites.
 */
export type ParsedLyricsOverwrites = {
  globalOverwrite: Record<string, any> | null;
  sectionOverwrites: Map<SectionSettingsKeyType, Record<string, any> | null>;
};

/**
 * Parse all overwrites from the lyrics.
 * Returns both the global overwrite (before first section) and section-specific overwrites.
 *
 * @param lyrics - The lyrics text
 * @returns Object containing globalOverwrite and sectionOverwrites map
 */
export function parseAllOverwritesFromLyrics(
  lyrics: string,
): ParsedLyricsOverwrites {
  const lines = lyrics.split("\n");
  let globalOverwrite: Record<string, any> | null = null;
  const sectionOverwrites = new Map<
    SectionSettingsKeyType,
    Record<string, any> | null
  >();

  let i = 0;
  let sectionNumber = 0;
  let hasSeenSection = false;

  while (i < lines.length) {
    const currentLine = lines[i];

    // Check for global overwrite (JSON line before first section)
    if (!hasSeenSection && isOverwriteJsonLine(currentLine)) {
      try {
        globalOverwrite = JSON.parse(currentLine.trim());
      } catch {
        // Invalid JSON, skip
      }
      i++;
      continue;
    }

    // Check if this is a section header
    if (isSectionHeader(currentLine)) {
      hasSeenSection = true;
      sectionNumber++;
      const sectionKey =
        `${SECTION_PREFIX}${sectionNumber}` as SectionSettingsKeyType;

      i++;

      // Check if the next line is an overwrite JSON
      if (i < lines.length && isOverwriteJsonLine(lines[i])) {
        try {
          const overwrite = JSON.parse(lines[i].trim());
          sectionOverwrites.set(sectionKey, overwrite);
        } catch {
          sectionOverwrites.set(sectionKey, null);
        }
        i++;
      } else {
        sectionOverwrites.set(sectionKey, null);
      }
    } else {
      i++;
    }
  }

  return {
    globalOverwrite,
    sectionOverwrites,
  };
}
