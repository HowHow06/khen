import { SETTING_CATEGORY } from "@/lib/constant";
import { SectionSettingsType } from "@/lib/types";
import { deepCopy, deepMerge } from "@/lib/utils/general";
import {
  combineWithDefaultSettings,
  generateSectionSettingsFromFullSettings,
  getPreset,
} from "./settings-generator";

export type SlideOverride = {
  $scope: "slide";
  preset?: string;
  general?: Partial<SectionSettingsType[SETTING_CATEGORY.GENERAL]>;
  cover?: Partial<SectionSettingsType[SETTING_CATEGORY.COVER]>;
  content?: Partial<SectionSettingsType[SETTING_CATEGORY.CONTENT]>;
};

const JSON_LINE_REGEX = /^\s*\{.*\}\s*$/;

function isPlainObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isJsonLine(line: string): boolean {
  return JSON_LINE_REGEX.test(line);
}

export function isSlideOverrideCandidateLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("{") &&
    trimmed.endsWith("}") &&
    trimmed.includes('"$scope"') &&
    trimmed.includes("slide")
  );
}

export function parseSlideOverride(line: string): SlideOverride | null {
  if (!isJsonLine(line)) {
    return null;
  }

  try {
    const parsed = JSON.parse(line.trim());
    if (!isPlainObject(parsed) || parsed.$scope !== "slide") {
      return null;
    }
    return parsed as SlideOverride;
  } catch {
    return null;
  }
}

export function isSlideOverrideLine(line: string): boolean {
  return parseSlideOverride(line) !== null;
}

export function stripSlideOverridesFromLyrics(lyrics: string): string {
  return lyrics
    .split("\n")
    .filter((line) => !isSlideOverrideLine(line))
    .join("\n");
}

function preserveBaseBackgroundSettings(
  target: SectionSettingsType,
  base: SectionSettingsType,
): SectionSettingsType {
  return {
    ...target,
    general: {
      ...target.general,
      useMainBackgroundImage: base.general?.useMainBackgroundImage,
      sectionBackgroundImage: base.general?.sectionBackgroundImage,
      useMainBackgroundColor: base.general?.useMainBackgroundColor,
      sectionBackgroundColor: base.general?.sectionBackgroundColor,
    },
  };
}

export function applySlideOverrideToSectionSettings({
  baseSectionSettings,
  override,
}: {
  baseSectionSettings: SectionSettingsType;
  override: SlideOverride;
}): SectionSettingsType {
  const { $scope: _scope, preset, ...explicitOverride } = override;
  let result = deepCopy(baseSectionSettings);

  if (preset) {
    const presetSettings = getPreset(preset);
    if (presetSettings) {
      result = generateSectionSettingsFromFullSettings(
        combineWithDefaultSettings(presetSettings),
      );
      result = preserveBaseBackgroundSettings(result, baseSectionSettings);
    }
  }

  result.general = {
    ...result.general,
    useMainSectionSettings: false,
  };

  return deepMerge(
    result as Record<string, any>,
    explicitOverride as Record<string, any>,
  ) as SectionSettingsType;
}
