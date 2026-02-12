import {
  MAIN_SECTION_NAME,
  PPT_GENERATION_SETTINGS_META,
} from "@/lib/constant";
import {
  PptSettingsStateType,
  SectionSettingsKeyType,
  SectionSettingsType,
} from "@/lib/types";
import { deepCopy, deepMerge } from "@/lib/utils/general";
import {
  combineWithDefaultSettings,
  generateSectionSettingsFromFullSettings,
} from "./settings-generator";
import { generateFullSettings } from "./import-export-settings";
import {
  ParsedLyricsOverwrites,
  parseAllOverwritesFromLyrics,
} from "./lyrics-overwrite";
import {
  getPreset,
  getSectionSettingsInitialValue,
} from "./settings-generator";

// Fields to ignore when computing the diff (e.g., image fields, internal fields)
const FIELDS_TO_IGNORE = [
  "mainBackgroundImage",
  "sectionBackgroundImage",
  "autoOutputOverwrite",
  "useDifferentSettingForEachSection",
];

/**
 * Recursively compute the difference between current settings and preset settings.
 * Only returns fields that have different values.
 */
function computeDiff(
  current: Record<string, any>,
  preset: Record<string, any>,
  path: string[] = [],
): Record<string, any> | null {
  const diff: Record<string, any> = {};

  for (const key of Object.keys(current)) {
    const currentPath = [...path, key];
    const fullPath = currentPath.join(".");

    // Skip ignored fields
    if (FIELDS_TO_IGNORE.includes(key)) {
      continue;
    }

    const currentValue = current[key];
    const presetValue = preset?.[key];

    // If current value is an object (and not null), recurse
    if (
      currentValue !== null &&
      typeof currentValue === "object" &&
      !Array.isArray(currentValue) &&
      !(currentValue instanceof File) &&
      !(currentValue instanceof Blob)
    ) {
      const nestedDiff = computeDiff(
        currentValue,
        presetValue ?? {},
        currentPath,
      );
      if (nestedDiff && Object.keys(nestedDiff).length > 0) {
        diff[key] = nestedDiff;
      }
    } else {
      // Compare primitive values
      if (currentValue !== presetValue) {
        diff[key] = currentValue;
      }
    }
  }

  return Object.keys(diff).length > 0 ? diff : null;
}

// Global settings fields that should be included in the header overwrite
const GLOBAL_SETTINGS_FIELDS = [
  "useDifferentSettingForEachSection",
  "separateSectionsToFiles",
  "sectionsAutoNumbering",
];

/**
 * Get the global/header overwrite that should appear before the first section.
 * This includes settings like useDifferentSettingForEachSection and the main presetChosen.
 * Only includes fields that differ from the preset.
 */
export function getGlobalSettingsOverwrite(
  currentSettings: PptSettingsStateType,
): Record<string, any> {
  const presetName = currentSettings.general?.presetChosen;
  const globalOverwrite: Record<string, any> = {};

  const presetSettings = getPreset(presetName || "");
  const presetWithDefaults = presetSettings
    ? combineWithDefaultSettings(presetSettings)
    : null;

  // Add global settings fields only if they differ from preset
  for (const field of GLOBAL_SETTINGS_FIELDS) {
    const currentValue = (currentSettings.general as any)?.[field];
    const presetValue = presetWithDefaults
      ? (presetWithDefaults.general as any)?.[field]
      : undefined;

    // Include the field if it differs from preset or preset doesn't exist
    if (currentValue !== undefined && currentValue !== presetValue) {
      if (!globalOverwrite.general) {
        globalOverwrite.general = {};
      }
      globalOverwrite.general[field] = currentValue;
    }
  }

  if (Object.keys(globalOverwrite).length !== 0) {
    globalOverwrite.general = {
      ...globalOverwrite.general,
      presetChosen: presetName,
    };
  }

  return globalOverwrite;
}

/**
 * Get the overwritten settings compared to the chosen preset.
 * Returns a partial settings object with only the changed fields.
 * Always includes the preset name in general.presetChosen.
 */
export function getSettingsOverwrite(
  currentSettings: PptSettingsStateType,
): Record<string, any> | null {
  const presetName = currentSettings.general?.presetChosen;
  if (!presetName) {
    return null;
  }

  const presetSettings = getPreset(presetName);
  if (!presetSettings) {
    return null;
  }

  // Compute the diff, excluding the section settings and file settings
  const {
    section: _,
    file: __,
    ...presetToCompare
  } = combineWithDefaultSettings(presetSettings) as any;
  const { section, file, ...settingsToCompare } = currentSettings as any;

  const diff = computeDiff(settingsToCompare, presetToCompare);

  // Even if no diff, return the preset name
  return diff;
}

/**
 * Get section-specific overwritten settings compared to the section's preset.
 * Only returns the diff for sections where useMainSectionSettings is false.
 * Always includes the preset name in general.presetChosen.
 */
export function getSectionSettingsOverwrite(
  sectionSettings: SectionSettingsType,
): Record<string, any> | null {
  // If section is using main settings, no overwrite needed
  const useMainSectionSettings =
    sectionSettings.general?.useMainSectionSettings;
  if (useMainSectionSettings === true) {
    return null;
  }

  // Get the preset name for this section
  const sectionPresetName = sectionSettings.general?.presetChosen;
  if (!sectionPresetName) {
    return null;
  }

  const presetSettings = getPreset(sectionPresetName);
  if (!presetSettings) {
    return null;
  }

  // Generate section settings from the preset to compare against
  const presetWithDefaults = combineWithDefaultSettings(presetSettings);
  const presetSectionSettings =
    generateSectionSettingsFromFullSettings(presetWithDefaults);
  // default to using main section settings
  presetSectionSettings.general.useMainSectionSettings = true;

  // Compute the diff between current section settings and preset section settings
  const diff = computeDiff(
    sectionSettings as Record<string, any>,
    presetSectionSettings as Record<string, any>,
  );

  return diff;
}

/**
 * Get all overwrites for all sections based on the settings mode.
 *
 * - When `useDifferentSettingForEachSection` is `false`:
 *   Returns the main settings overwrite (compared against main preset) for all sections.
 *
 * - When `useDifferentSettingForEachSection` is `true`:
 *   For each section where `useMainSectionSettings` is `false`,
 *   returns the section-specific overwrite (compared against its own preset).
 *   For sections where `useMainSectionSettings` is `true`, returns null (no overwrite needed).
 *
 * @param currentSettings - The current full settings
 * @param sectionCount - The number of sections in the lyrics (to generate overwrites for all sections)
 * @returns A map of section key to their overwrite objects
 */
export function getAllSectionOverwrites(
  currentSettings: PptSettingsStateType,
  sectionCount: number,
): Map<SectionSettingsKeyType, Record<string, any> | null> {
  const sectionOverwrites = new Map<
    SectionSettingsKeyType,
    Record<string, any> | null
  >();

  const useDifferentSettingForEachSection =
    currentSettings.general?.useDifferentSettingForEachSection === true;

  // When not using different settings per section, use main settings overwrite for all sections
  if (!useDifferentSettingForEachSection) {
    const mainOverwrite = getSettingsOverwrite(currentSettings);

    for (let i = 1; i <= sectionCount; i++) {
      const sectionKey = `section${i}` as SectionSettingsKeyType;
      sectionOverwrites.set(sectionKey, mainOverwrite);
    }

    return sectionOverwrites;
  }

  // When using different settings per section, check each section individually
  const sections = currentSettings.section;

  for (let i = 1; i <= sectionCount; i++) {
    const sectionKey = `section${i}` as SectionSettingsKeyType;
    const sectionSettings = sections?.[sectionKey];

    if (!sectionSettings) {
      // No section settings found, use main settings overwrite as fallback
      const mainOverwrite = getSettingsOverwrite(currentSettings);
      sectionOverwrites.set(sectionKey, mainOverwrite);
      continue;
    }

    // Check if this section uses main settings
    const useMainSectionSettings =
      sectionSettings.general?.useMainSectionSettings === true;

    if (useMainSectionSettings) {
      // Section uses main settings, use main settings overwrite
      const mainOverwrite = getSettingsOverwrite(currentSettings);
      sectionOverwrites.set(sectionKey, mainOverwrite);
    } else {
      // Section has its own settings, compute section-specific overwrite
      const sectionOverwrite = getSectionSettingsOverwrite(sectionSettings);
      if (sectionOverwrite) {
        sectionOverwrite.general = {
          ...sectionOverwrite.general,
          presetChosen: sectionSettings.general?.presetChosen,
        };
      }
      sectionOverwrites.set(sectionKey, sectionOverwrite);
    }
  }

  return sectionOverwrites;
}

/**
 * Convert the settings overwrite to a JSON string for insertion into lyrics.
 */
export function settingsOverwriteToJson(
  overwrite: Record<string, any> | null,
): string {
  if (!overwrite || Object.keys(overwrite).length === 0) {
    return "";
  }
  return JSON.stringify(overwrite);
}

/**
 * Parse the overwrite JSON string from lyrics.
 */
export function parseSettingsOverwriteFromJson(
  jsonString: string,
): Record<string, any> | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Merge the parsed overwrites from lyrics with the current settings.
 * This applies both global overwrites and section-specific overwrites.
 *
 * The merge priority (lowest to highest):
 * 1. Default settings
 * 2. Preset settings (from global overwrite's presetChosen or settings' presetChosen)
 * 3. Current settings
 * 4. Global overwrite from lyrics (for general settings)
 * 5. Section overwrite from lyrics (for each section's settings)
 *
 * @param settings - The current settings
 * @param primaryLyric - The primary lyrics text containing overwrites
 * @returns The merged settings with overwrites applied
 */
export function mergeOverwritesFromLyrics(
  settings: PptSettingsStateType,
  primaryLyric: string,
): PptSettingsStateType {
  const parsedOverwrites = parseAllOverwritesFromLyrics(primaryLyric);
  return mergeOverwritesWithSettings(settings, parsedOverwrites);
}

/**
 * Merge parsed overwrites with the settings.
 *
 * @param settings - The current settings
 * @param parsedOverwrites - The parsed overwrites from lyrics
 * @returns The merged settings
 */
export function mergeOverwritesWithSettings(
  settings: PptSettingsStateType,
  parsedOverwrites: ParsedLyricsOverwrites,
): PptSettingsStateType {
  const { globalOverwrite, sectionOverwrites } = parsedOverwrites;
  console.log("parsedOverwrites", parsedOverwrites);

  // Start with a deep copy of the current settings
  let mergedSettings = deepCopy(settings);

  // Apply global overwrite to general settings
  if (globalOverwrite && Object.keys(globalOverwrite).length > 0) {
    // Check if globalOverwrite has a presetChosen - if so, apply the preset first
    const globalPresetChosen = globalOverwrite.general?.presetChosen;
    if (globalPresetChosen) {
      const preset = getPreset(globalPresetChosen);
      if (preset) {
        // Apply preset like applyPreset with isApplyToSection=false, isPreserveUseDifferentSetting=false, isPreserveExistingSectionSetting=false
        mergedSettings = generateFullSettings({
          newSettings: combineWithDefaultSettings(preset),
          originalSettings: mergedSettings,
          targetSectionName: MAIN_SECTION_NAME,
          isApplyToSection: false,
          isPreserveUseDifferentSetting: false,
          isPreserveExistingSectionSetting: false,
        });
      }
    }

    // Now apply the remaining overwrites on top
    mergedSettings = deepMerge(
      mergedSettings,
      globalOverwrite,
    ) as PptSettingsStateType;
  }

  // Apply section-specific overwrites
  if (sectionOverwrites.size > 0) {
    for (const [sectionKey, sectionOverwrite] of sectionOverwrites) {
      // Merge into section-specific settings
      if (!mergedSettings.section) {
        mergedSettings.section = {};
      }

      if (!mergedSettings.section[sectionKey]) {
        mergedSettings.section[sectionKey] = getSectionSettingsInitialValue({
          settings: PPT_GENERATION_SETTINGS_META,
        });
      }

      if (!sectionOverwrite || Object.keys(sectionOverwrite).length === 0) {
        continue;
      }

      // Check if sectionOverwrite has a presetChosen - if so, construct section settings from preset first
      const sectionPresetChosen = sectionOverwrite.general?.presetChosen;
      if (sectionPresetChosen) {
        const preset = getPreset(sectionPresetChosen);
        if (preset) {
          const sectionName = sectionKey as SectionSettingsKeyType;

          mergedSettings = generateFullSettings({
            newSettings: combineWithDefaultSettings(preset),
            originalSettings: mergedSettings,
            targetSectionName: sectionName,
            isApplyToSection: true,
            isPreserveUseDifferentSetting: true,
            isPreserveExistingSectionSetting: true,
          });
        }
      }

      let baseSectionSettings: SectionSettingsType =
        mergedSettings.section![sectionKey] || {};

      // Merge the overwrite into the section settings
      const mergedSectionSettings = deepMerge(
        baseSectionSettings,
        sectionOverwrite,
      ) as SectionSettingsType;

      mergedSettings.section![sectionKey] = mergedSectionSettings;
    }
  }

  console.log("logging mergedSettings", mergedSettings);
  return mergedSettings;
}
