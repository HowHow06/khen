import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { hydrateCliImageSettings } from "./assets";
import { getPresetInfoById, resolvePresetId } from "./presets";

type PptSettingsState = Record<string, any> & {
  general: Record<string, any>;
  file: Record<string, any>;
  content: Record<string, any>;
  cover: Record<string, any>;
  section?: Record<string, any>;
};

type SectionPresetOverride = {
  selector: string;
  presetId: string;
};

type TextOverflowDetector = (args: {
  previewConfig: any;
  lineMappings: any[];
  mainLines: string[];
  secondaryLines: string[];
}) => Promise<{
  warnings: Array<Record<string, any>>;
  overflowSlideIndices: number[];
}>;

export type WorkflowOptions = {
  main: string;
  secondary?: string;
  autoPinyin: boolean;
  config?: string;
  output: string;
  filename?: string;
  preset?: string;
  previewGrid?: string;
  report?: string;
  sectionPresets: string[];
  textOverflowDetector?: TextOverflowDetector;
};

export type CliReport = {
  version: 1;
  input: {
    main: string;
    secondary: string | null;
    autoPinyin: boolean;
    preset: string | null;
    sectionPresets: string[];
  };
  summary: {
    mainLineCount: number;
    secondaryLineCount: number;
    songCount: number;
    subsectionCount: number;
    slideCount: number;
    hasCover: boolean;
  };
  outputs: {
    pptx?: string;
    previewGrid?: string;
    report?: string;
  };
  overflowSlideIndices: number[];
  sections: Array<{
    index: number;
    name: string;
    preset: string | null;
    slideIndices: number[];
  }>;
  lineMappings: Array<{
    lineNumber: number;
    slideIndex: number;
    lineType: string;
    sectionName?: string;
    isSpecialLine: boolean;
  }>;
  warnings: Array<Record<string, any>>;
  errors: Array<Record<string, any>>;
};

type RuntimeModules = {
  constants: any;
  deepMerge: <T extends Record<string, any>>(target: T, source: T) => T;
  createPptInstance: (args: any) => Promise<any>;
  generatePreviewConfig: (args: any) => Promise<any>;
  getPinyin: (args: { text: string; hasTone: boolean }) => string;
  LineToSlideMapper: new () => any;
  mergeOverwritesFromLyrics: (settings: any, lyric: string) => PptSettingsState;
  parsePptFilename: (args: {
    filename: string | undefined;
    prefix: string | undefined;
    suffix: string | undefined;
  }) => { fileName: string };
  removeAllOverwritesFromLyrics: (lyrics: string) => string;
  validateLyrics: (lyrics: string) => any[];
  getLyricsSummary: (lyrics: string) => {
    lineCount: number;
    songCount: number;
    subsectionCount: number;
    hasCover: boolean;
    estimatedSlides: number;
  };
  presets: Record<string, PptSettingsState>;
};

export async function loadRuntimeModules(): Promise<RuntimeModules> {
  const constants = await import("../../lib/constant/ppt-generator");
  const { deepMerge } = await import("../../lib/utils/general");
  const { createPptInstance } =
    await import("../../lib/utils/ppt-generator/ppt-generation");
  const { generatePreviewConfig } =
    await import("../../lib/utils/ppt-generator/ppt-preview");
  const { getPinyin } = await import("../../lib/utils/pinyin");
  const { LineToSlideMapper } =
    await import("../../lib/utils/ppt-generator/line-to-slide-mapper");
  const { mergeOverwritesFromLyrics } =
    await import("../../lib/utils/ppt-generator/settings-diff");
  const { parsePptFilename } =
    await import("../../lib/utils/ppt-generator/settings-utils");
  const { removeAllOverwritesFromLyrics } =
    await import("../../lib/utils/ppt-generator/lyrics-overwrite");
  const { validateLyrics, getLyricsSummary } =
    await import("../../lib/utils/ppt-generator/lyric-validation");
  const presets = await import("../../lib/presets/ppt-generator");

  return {
    constants,
    deepMerge,
    createPptInstance,
    generatePreviewConfig,
    getPinyin,
    LineToSlideMapper,
    mergeOverwritesFromLyrics,
    parsePptFilename,
    removeAllOverwritesFromLyrics,
    validateLyrics,
    getLyricsSummary,
    presets: presets as Record<string, PptSettingsState>,
  };
}

function getInitialValuesFromSettings(
  settingsMeta: Record<string, any>,
  defaultGroupingName: string,
  hasGrouping = false,
): Record<string, any> {
  const resultValues: Record<string, any> = {};
  Object.entries(settingsMeta).forEach(([key, setting]: [string, any]) => {
    if (setting.isNotAvailable || setting.defaultValue === undefined) {
      return;
    }

    if (hasGrouping) {
      const grouping = setting.groupingName || defaultGroupingName;
      resultValues[grouping] = resultValues[grouping] || {};
      resultValues[grouping][key] = setting.defaultValue;
      return;
    }

    resultValues[key] = setting.defaultValue;
  });

  return resultValues;
}

function getTextboxSettingsInitialValues(
  textboxSettingsMeta: Record<string, any>,
  textboxPrefix: string,
  defaultGroupingName: string,
  textboxCount: number,
): Record<string, any> {
  const textBoxInitialState: Record<string, any> = {};
  Array.from({ length: textboxCount }).forEach((_, index) => {
    textBoxInitialState[`${textboxPrefix}${index + 1}`] =
      getInitialValuesFromSettings(textboxSettingsMeta, defaultGroupingName);
  });
  return textBoxInitialState;
}

function generateInitialSettings(runtime: RuntimeModules): PptSettingsState {
  const {
    PPT_GENERATION_SETTINGS_META,
    SETTING_CATEGORY,
    CONTENT_TYPE,
    DEFAULT_TEXTBOX_COUNT_PER_SLIDE,
    DEFAULT_GROUPING_NAME,
    TEXTBOX_GROUPING_PREFIX,
  } = runtime.constants;

  const initialState = {
    [SETTING_CATEGORY.GENERAL]: {},
    [SETTING_CATEGORY.FILE]: {},
    [SETTING_CATEGORY.CONTENT]: {
      [CONTENT_TYPE.MAIN]: { textbox: {} },
      [CONTENT_TYPE.SECONDARY]: { textbox: {} },
    },
    [SETTING_CATEGORY.COVER]: {
      [CONTENT_TYPE.MAIN]: {},
      [CONTENT_TYPE.SECONDARY]: {},
    },
  } as PptSettingsState;

  Object.entries(PPT_GENERATION_SETTINGS_META).forEach(
    ([category, settingsMeta]) => {
      switch (category) {
        case SETTING_CATEGORY.GENERAL:
        case SETTING_CATEGORY.FILE:
          initialState[category] = getInitialValuesFromSettings(
            settingsMeta as Record<string, any>,
            DEFAULT_GROUPING_NAME,
          );
          break;
        case SETTING_CATEGORY.COVER:
          Object.values(CONTENT_TYPE).forEach((contentType) => {
            initialState[category][contentType as string] =
              getInitialValuesFromSettings(
                settingsMeta as Record<string, any>,
                DEFAULT_GROUPING_NAME,
              );
          });
          break;
        case SETTING_CATEGORY.CONTENT:
          Object.values(CONTENT_TYPE).forEach((contentType) => {
            initialState[category][contentType as string] = {
              ...getInitialValuesFromSettings(
                settingsMeta as Record<string, any>,
                DEFAULT_GROUPING_NAME,
                true,
              ),
              textbox: getTextboxSettingsInitialValues(
                PPT_GENERATION_SETTINGS_META.contentTextbox,
                TEXTBOX_GROUPING_PREFIX,
                DEFAULT_GROUPING_NAME,
                DEFAULT_TEXTBOX_COUNT_PER_SLIDE,
              ),
            };
          });
          break;
      }
    },
  );

  return initialState;
}

function combineWithDefaultSettings(
  runtime: RuntimeModules,
  settingsValue: PptSettingsState,
): PptSettingsState {
  return runtime.deepMerge(
    generateInitialSettings(runtime),
    settingsValue,
  ) as PptSettingsState;
}

async function loadSettings(
  runtime: RuntimeModules,
  configPath: string | undefined,
  presetName: string | undefined,
): Promise<{ settings: PptSettingsState; resolvedPresetId: string | null }> {
  let settings = generateInitialSettings(runtime);
  let resolvedPresetId: string | null = null;

  if (presetName) {
    resolvedPresetId = resolvePresetId(presetName);
    const preset = runtime.presets[resolvedPresetId];
    if (!preset) {
      throw new Error(
        `Preset "${resolvedPresetId}" was resolved but not found in source presets.`,
      );
    }
    settings = combineWithDefaultSettings(runtime, preset);
  }

  if (configPath) {
    const configContent = await readFile(configPath, "utf-8");
    const userSettings = JSON.parse(configContent) as PptSettingsState;
    settings = runtime.deepMerge(settings, userSettings) as PptSettingsState;
  }

  return { settings, resolvedPresetId };
}

async function loadLyrics(
  runtime: RuntimeModules,
  options: WorkflowOptions,
): Promise<{ primaryLyric: string; secondaryLyric: string }> {
  const primaryLyric = await readFile(options.main, "utf-8");

  if (options.secondary) {
    return {
      primaryLyric,
      secondaryLyric: await readFile(options.secondary, "utf-8"),
    };
  }

  if (options.autoPinyin) {
    return {
      primaryLyric,
      secondaryLyric: runtime.getPinyin({ text: primaryLyric, hasTone: false }),
    };
  }

  return { primaryLyric, secondaryLyric: primaryLyric };
}

function parseSectionPreset(value: string): SectionPresetOverride {
  const separatorIndex = value.indexOf("=");
  if (separatorIndex === -1) {
    throw new Error(
      `Invalid --section-preset "${value}". Expected format: 2=onsite-english`,
    );
  }

  return {
    selector: value.slice(0, separatorIndex).trim(),
    presetId: resolvePresetId(value.slice(separatorIndex + 1).trim()),
  };
}

function isOverwriteJsonLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("{") && trimmed.endsWith("}");
}

function parseSectionHeaderName(line: string): string {
  return line.replace(/^----\s*/, "").trim();
}

function mergeJsonLineWithPreset(
  line: string | undefined,
  presetId: string,
): string {
  let parsed: Record<string, any> = {};
  if (line && isOverwriteJsonLine(line)) {
    try {
      parsed = JSON.parse(line);
    } catch {
      parsed = {};
    }
  }

  return JSON.stringify({
    ...parsed,
    general: {
      ...(parsed.general || {}),
      presetChosen: presetId,
    },
  });
}

function applySectionPresetOverrides(
  primaryLyric: string,
  overrides: SectionPresetOverride[],
): string {
  if (overrides.length === 0) {
    return primaryLyric;
  }

  const lines = primaryLyric.split("\n");
  const result: string[] = [];
  let sectionIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    result.push(line);

    if (!line.trim().startsWith("----")) {
      continue;
    }

    sectionIndex++;
    const sectionName = parseSectionHeaderName(line);
    const override = overrides.find(({ selector }) => {
      const normalizedSelector = selector.toLowerCase();
      return (
        selector === String(sectionIndex) ||
        normalizedSelector === sectionName.toLowerCase()
      );
    });

    if (!override) {
      continue;
    }

    const nextLine = lines[i + 1];
    if (nextLine !== undefined && isOverwriteJsonLine(nextLine)) {
      result.push(mergeJsonLineWithPreset(nextLine, override.presetId));
      i++;
    } else {
      result.push(mergeJsonLineWithPreset(undefined, override.presetId));
    }
  }

  return result.join("\n");
}

function getSectionPresetByIndex(
  overrides: SectionPresetOverride[],
  sectionIndex: number,
  sectionName: string,
): string | null {
  const match = overrides.find(({ selector }) => {
    const normalizedSelector = selector.toLowerCase();
    return (
      selector === String(sectionIndex) ||
      normalizedSelector === sectionName.toLowerCase()
    );
  });
  return match?.presetId ?? null;
}

function buildSectionsReport(
  previewConfig: any,
  lineMappings: any[],
  overrides: SectionPresetOverride[],
  globalPresetId: string | null,
) {
  const mainSectionMappings = lineMappings.filter(
    (mapping) => mapping.lineType === "section",
  );

  if (mainSectionMappings.length === 0) {
    return [
      {
        index: 1,
        name: "Slides",
        preset: globalPresetId,
        slideIndices: previewConfig.slides.map(
          (_: any, index: number) => index + 1,
        ),
      },
    ];
  }

  return mainSectionMappings.map((mapping, index) => {
    const sectionIndex = index + 1;
    const nextSection = mainSectionMappings[index + 1];
    const startSlide = Math.max(1, mapping.slideIndex + 1);
    const endSlide = nextSection
      ? Math.max(startSlide, nextSection.slideIndex)
      : previewConfig.slides.length;
    const name = (mapping.sectionName || `Section ${sectionIndex}`)
      .replace(/^\d+(?:\.\d+)*\.?\s*/, "")
      .replace(/\*\s*$/, "")
      .trim();

    return {
      index: sectionIndex,
      name,
      preset:
        getSectionPresetByIndex(overrides, sectionIndex, name) ??
        globalPresetId,
      slideIndices: Array.from(
        { length: endSlide - startSlide + 1 },
        (_, slideOffset) => startSlide + slideOffset,
      ),
    };
  });
}

function buildWarnings(
  runtime: RuntimeModules,
  effectivePrimaryLyric: string,
  secondaryLyric: string,
  settings: PptSettingsState,
) {
  const warnings = runtime
    .validateLyrics(effectivePrimaryLyric)
    .map((warning) => ({
      ...warning,
      code: warning.type === "error" ? "LYRIC_SYNTAX" : "LYRIC_WARNING",
    }));

  const shouldIgnoreSecondary = settings.general?.ignoreSubcontent === true;
  const mainLineCount = runtime
    .removeAllOverwritesFromLyrics(effectivePrimaryLyric)
    .split("\n").length;
  const secondaryLineCount = runtime
    .removeAllOverwritesFromLyrics(secondaryLyric)
    .split("\n").length;
  if (!shouldIgnoreSecondary && mainLineCount !== secondaryLineCount) {
    warnings.push({
      type: "warning",
      code: "SECONDARY_LINE_COUNT_MISMATCH",
      message: `Main lyrics have ${mainLineCount} lines but secondary lyrics have ${secondaryLineCount} lines.`,
    });
  }

  return warnings;
}

export async function analyzeWorkflow(
  options: WorkflowOptions,
): Promise<CliReport> {
  const runtime = await loadRuntimeModules();
  const { primaryLyric, secondaryLyric } = await loadLyrics(runtime, options);
  const sectionPresetOverrides = options.sectionPresets.map(parseSectionPreset);
  const { settings, resolvedPresetId } = await loadSettings(
    runtime,
    options.config,
    options.preset,
  );
  await hydrateCliImageSettings(settings);

  if (sectionPresetOverrides.length > 0) {
    settings.general.useDifferentSettingForEachSection = true;
  }

  const effectivePrimaryLyric = applySectionPresetOverrides(
    primaryLyric,
    sectionPresetOverrides,
  );

  const lineMapper = new runtime.LineToSlideMapper();
  const previewConfig = await runtime.generatePreviewConfig({
    settingValues: settings,
    primaryLyric: effectivePrimaryLyric,
    secondaryLyric,
    lineMapper,
  });
  const strippedPrimaryLyric = runtime.removeAllOverwritesFromLyrics(
    effectivePrimaryLyric,
  );
  const strippedSecondaryLyric =
    runtime.removeAllOverwritesFromLyrics(secondaryLyric);
  const summary = runtime.getLyricsSummary(strippedPrimaryLyric);
  const mergedSettings = runtime.mergeOverwritesFromLyrics(
    settings,
    effectivePrimaryLyric,
  );
  const warnings = buildWarnings(
    runtime,
    effectivePrimaryLyric,
    secondaryLyric,
    mergedSettings,
  );
  const textOverflowDetector =
    options.textOverflowDetector ??
    (await import("./text-overflow")).detectTextOverflowWarnings;
  const overflowResult = await textOverflowDetector({
    previewConfig,
    lineMappings: lineMapper.getAllMappings(),
    mainLines: strippedPrimaryLyric.split("\n"),
    secondaryLines: strippedSecondaryLyric.split("\n"),
  });
  warnings.push(...overflowResult.warnings);

  const outputs: CliReport["outputs"] = {};
  if (options.previewGrid) {
    const { generatePreviewImage } = await import("../preview-image-generator");
    await mkdir(path.dirname(options.previewGrid), { recursive: true });
    outputs.previewGrid = await generatePreviewImage(
      previewConfig,
      options.previewGrid,
      { overflowSlideIndices: new Set(overflowResult.overflowSlideIndices) },
    );
  }

  const report: CliReport = {
    version: 1,
    input: {
      main: options.main,
      secondary: options.secondary ?? null,
      autoPinyin: options.autoPinyin,
      preset: resolvedPresetId,
      sectionPresets: options.sectionPresets,
    },
    summary: {
      mainLineCount: strippedPrimaryLyric.split("\n").length,
      secondaryLineCount: strippedSecondaryLyric.split("\n").length,
      songCount: summary.songCount,
      subsectionCount: summary.subsectionCount,
      slideCount: previewConfig.slides.length,
      hasCover: summary.hasCover,
    },
    outputs,
    overflowSlideIndices: overflowResult.overflowSlideIndices,
    sections: buildSectionsReport(
      previewConfig,
      lineMapper.getAllMappings(),
      sectionPresetOverrides,
      resolvedPresetId,
    ),
    lineMappings: lineMapper.getAllMappings().map((mapping: any) => ({
      lineNumber: mapping.lineNumber + 1,
      slideIndex: mapping.slideIndex,
      lineType: mapping.lineType,
      sectionName: mapping.sectionName,
      isSpecialLine: mapping.isSpecialLine,
    })),
    warnings,
    errors: warnings
      .filter((warning) => warning.type === "error")
      .map((warning) => ({ ...warning })),
  };

  if (options.report) {
    report.outputs.report = options.report;
    await mkdir(path.dirname(options.report), { recursive: true });
    await writeFile(options.report, JSON.stringify(report, null, 2));
  }

  return report;
}

export async function generateWorkflow(
  options: WorkflowOptions,
): Promise<CliReport> {
  const runtime = await loadRuntimeModules();
  const { primaryLyric, secondaryLyric } = await loadLyrics(runtime, options);
  const sectionPresetOverrides = options.sectionPresets.map(parseSectionPreset);
  const { settings, resolvedPresetId } = await loadSettings(
    runtime,
    options.config,
    options.preset,
  );
  await hydrateCliImageSettings(settings);
  if (sectionPresetOverrides.length > 0) {
    settings.general.useDifferentSettingForEachSection = true;
  }
  if (options.filename) {
    settings.file.filename = options.filename;
  }

  const effectivePrimaryLyric = applySectionPresetOverrides(
    primaryLyric,
    sectionPresetOverrides,
  );

  await mkdir(options.output, { recursive: true });
  const mergedSettings = runtime.mergeOverwritesFromLyrics(
    settings,
    effectivePrimaryLyric,
  );
  const strippedPrimary = runtime.removeAllOverwritesFromLyrics(
    effectivePrimaryLyric,
  );
  const strippedSecondary =
    runtime.removeAllOverwritesFromLyrics(secondaryLyric);
  const { pres } = await runtime.createPptInstance({
    settingValues: mergedSettings,
    primaryLyric: strippedPrimary,
    secondaryLyric: strippedSecondary,
  });
  const { fileName } = runtime.parsePptFilename({
    filename: mergedSettings.file.filename,
    prefix: mergedSettings.file.filenamePrefix,
    suffix: mergedSettings.file.filenameSuffix,
  });
  const pptxPath = path.join(options.output, fileName);
  const content = await pres.write({ outputType: "nodebuffer" });
  await writeFile(pptxPath, content as Buffer);

  const report = await analyzeWorkflow({
    ...options,
    preset: resolvedPresetId ?? options.preset,
  });
  report.outputs.pptx = pptxPath;

  if (options.report) {
    await writeFile(options.report, JSON.stringify(report, null, 2));
  }

  return report;
}

export function listPresets() {
  return [
    "onsiteChinesePreset",
    "onsiteEnglishPreset",
    "liveChinesePreset",
    "liveEnglishPreset",
  ].map((id) => ({
    id,
    displayName: getPresetInfoById(id)?.displayName ?? id,
    aliases: getPresetInfoById(id)?.aliases ?? [],
    ignoresSecondary: getPresetInfoById(id)?.ignoresSecondary ?? false,
  }));
}
