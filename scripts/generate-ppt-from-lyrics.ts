#!/usr/bin/env npx tsx

/**
 * CLI Script to generate PPT from lyrics files
 *
 * Usage:
 *   npx tsx scripts/generate-ppt-from-lyrics.ts --main <lyrics-file> [options]
 *
 * Options:
 *   --main, -m        Path to main lyrics file (required)
 *   --secondary, -s   Path to secondary lyrics file (optional)
 *   --config, -c      Path to settings JSON file (optional)
 *   --output, -o      Output directory (default: current directory)
 *   --filename, -f    Output filename without extension (optional)
 *   --preview, -p     Generate preview image (PNG) instead of PPT (optional)
 *   --help, -h        Show help
 *
 * Examples:
 *   npx tsx scripts/generate-ppt-from-lyrics.ts --main lyrics.txt
 *   npx tsx scripts/generate-ppt-from-lyrics.ts -m lyrics.txt -s pinyin.txt -o ./output
 *   npx tsx scripts/generate-ppt-from-lyrics.ts -m lyrics.txt -c settings.json --preview
 */

import { readFile, writeFile } from "fs/promises";
import path from "path";
import { parseArgs } from "util";

// Types
interface CliOptions {
  main: string;
  secondary?: string;
  config?: string;
  output: string;
  filename?: string;
  preview: boolean;
  help: boolean;
}

// Parse command line arguments
function parseCliArgs(): CliOptions {
  const { values } = parseArgs({
    options: {
      main: { type: "string", short: "m" },
      secondary: { type: "string", short: "s" },
      config: { type: "string", short: "c" },
      output: { type: "string", short: "o", default: "." },
      filename: { type: "string", short: "f" },
      preview: { type: "boolean", short: "p", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: true,
  });

  return {
    main: values.main as string,
    secondary: values.secondary as string | undefined,
    config: values.config as string | undefined,
    output: values.output as string,
    filename: values.filename as string | undefined,
    preview: values.preview as boolean,
    help: values.help as boolean,
  };
}

// Show help message
function showHelp(): void {
  console.log(`
Khen PPT Generator CLI

Usage:
  npx tsx scripts/generate-ppt-from-lyrics.ts --main <lyrics-file> [options]

Options:
  --main, -m        Path to main lyrics file (required)
  --secondary, -s   Path to secondary lyrics file (optional, uses main if not provided)
  --config, -c      Path to settings JSON file (optional)
  --output, -o      Output directory (default: current directory)
  --filename, -f    Output filename without extension (optional)
  --preview, -p     Generate preview image (PNG) instead of PPT (optional)
  --help, -h        Show this help message

Examples:
  # Basic usage - generate PPT from lyrics
  npx tsx scripts/generate-ppt-from-lyrics.ts --main lyrics.txt

  # With secondary lyrics (e.g., pinyin)
  npx tsx scripts/generate-ppt-from-lyrics.ts -m lyrics.txt -s pinyin.txt

  # With custom settings and output directory
  npx tsx scripts/generate-ppt-from-lyrics.ts -m lyrics.txt -c settings.json -o ./output

  # Generate preview image instead of PPT
  npx tsx scripts/generate-ppt-from-lyrics.ts -m lyrics.txt --preview

  # Full example with all options
  npx tsx scripts/generate-ppt-from-lyrics.ts \\
    --main lyrics.txt \\
    --secondary pinyin.txt \\
    --config settings.json \\
    --output ./output \\
    --filename "My Presentation"
`);
}

// Main function - uses dynamic imports to avoid circular dependency at module load time
async function main(): Promise<void> {
  const options = parseCliArgs();

  // Show help if requested
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Validate required arguments
  if (!options.main) {
    console.error("Error: Main lyrics file is required.");
    console.error("Use --help for usage information.");
    process.exit(1);
  }

  // Dynamic imports - order matters to avoid circular dependency
  // First load constants (no deps on utils)
  const constantModule = await import("../lib/constant/ppt-generator");
  const PPT_GENERATION_SETTINGS_META =
    constantModule.PPT_GENERATION_SETTINGS_META;

  // Load utility functions with careful ordering
  const { deepMerge } = await import("../lib/utils/general");
  const { removeAllOverwritesFromLyrics } =
    await import("../lib/utils/ppt-generator/lyrics-overwrite");
  const { mergeOverwritesFromLyrics } =
    await import("../lib/utils/ppt-generator/settings-diff");

  // Inline implementation of settings generation to avoid circular dependency
  const SETTING_CATEGORY = constantModule.SETTING_CATEGORY;
  const CONTENT_TYPE = constantModule.CONTENT_TYPE;
  const DEFAULT_TEXTBOX_COUNT_PER_SLIDE =
    constantModule.DEFAULT_TEXTBOX_COUNT_PER_SLIDE;
  const DEFAULT_GROUPING_NAME = constantModule.DEFAULT_GROUPING_NAME;
  const TEXTBOX_GROUPING_PREFIX = constantModule.TEXTBOX_GROUPING_PREFIX;

  type PptSettingsStateType = {
    general: Record<string, any>;
    file: Record<string, any>;
    content: Record<string, any>;
    cover: Record<string, any>;
    section?: Record<string, any>;
  };

  // Simplified settings generator (inline to avoid circular deps)
  function getInitialValuesFromSettings(
    settingsMeta: Record<string, any>,
    hasGrouping = false,
  ): Record<string, any> {
    const resultValues: any = {};
    Object.entries(settingsMeta).forEach(([key, setting]: [string, any]) => {
      if (setting.isNotAvailable || setting.defaultValue === undefined) {
        return;
      }

      if (hasGrouping) {
        const grouping = setting.groupingName || DEFAULT_GROUPING_NAME;
        if (resultValues[grouping] === undefined) {
          resultValues[grouping] = {};
        }
        resultValues[grouping][key] = setting.defaultValue;
        return;
      }

      resultValues[key] = setting.defaultValue;
    });

    return resultValues;
  }

  function getTextboxSettingsInitialValues(
    textboxSettingsMeta: Record<string, any>,
    textboxCount: number = DEFAULT_TEXTBOX_COUNT_PER_SLIDE,
  ): Record<string, any> {
    const textBoxInitialState: Record<string, any> = {};
    Array.from({ length: textboxCount }).forEach((_, index) => {
      textBoxInitialState[`${TEXTBOX_GROUPING_PREFIX}${index + 1}`] =
        getInitialValuesFromSettings(textboxSettingsMeta);
    });
    return textBoxInitialState;
  }

  function generatePptSettingsInitialState(
    settings: Record<string, any>,
    textboxCount: number = DEFAULT_TEXTBOX_COUNT_PER_SLIDE,
  ): PptSettingsStateType {
    const initialState: PptSettingsStateType = {
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
    };

    Object.entries(settings).forEach(([category, settingsMeta]) => {
      switch (category) {
        case SETTING_CATEGORY.GENERAL:
        case SETTING_CATEGORY.FILE:
          initialState[category] = getInitialValuesFromSettings(
            settingsMeta as Record<string, any>,
          );
          break;
        case SETTING_CATEGORY.COVER:
          Object.values(CONTENT_TYPE).forEach((contentType) => {
            (initialState[category] as any)[contentType] =
              getInitialValuesFromSettings(settingsMeta as Record<string, any>);
          });
          break;
        case SETTING_CATEGORY.CONTENT:
          Object.values(CONTENT_TYPE).forEach((contentType) => {
            (initialState[category] as any)[contentType] = {
              ...getInitialValuesFromSettings(
                settingsMeta as Record<string, any>,
                true,
              ),
              textbox: getTextboxSettingsInitialValues(
                settings.contentTextbox,
                textboxCount,
              ),
            };
          });
          break;
      }
    });

    return initialState;
  }

  function combineWithDefaultSettings(
    settingsValue: PptSettingsStateType,
  ): PptSettingsStateType {
    const defaultInitialState = generatePptSettingsInitialState(
      PPT_GENERATION_SETTINGS_META,
    );
    const result = deepMerge(
      defaultInitialState,
      settingsValue,
    ) as PptSettingsStateType;
    return result;
  }

  // Now we can safely load the rest
  const { createPptInstance } =
    await import("../lib/utils/ppt-generator/ppt-generation");
  const { parsePptFilename } =
    await import("../lib/utils/ppt-generator/settings-utils");

  // Load settings from JSON file or use defaults
  async function loadSettings(
    configPath?: string,
  ): Promise<PptSettingsStateType> {
    const defaultSettings = combineWithDefaultSettings(
      generatePptSettingsInitialState(PPT_GENERATION_SETTINGS_META),
    );

    if (!configPath) {
      return defaultSettings;
    }

    try {
      const configContent = await readFile(configPath, "utf-8");
      const userSettings = JSON.parse(
        configContent,
      ) as Partial<PptSettingsStateType>;

      // Merge user settings with defaults
      return {
        ...defaultSettings,
        ...userSettings,
        general: {
          ...defaultSettings.general,
          ...(userSettings.general || {}),
        },
        file: {
          ...defaultSettings.file,
          ...(userSettings.file || {}),
        },
        content: {
          ...defaultSettings.content,
          ...(userSettings.content || {}),
        },
        cover: {
          ...defaultSettings.cover,
          ...(userSettings.cover || {}),
        },
      } as PptSettingsStateType;
    } catch (error) {
      console.warn(
        `Warning: Could not load config file "${configPath}". Using defaults.`,
      );
      if (error instanceof Error) {
        console.warn(`  Reason: ${error.message}`);
      }
      return defaultSettings;
    }
  }

  // Import preview image generator
  const { generatePreviewImage } = await import("./preview-image-generator");
  const { generatePreviewConfig } =
    await import("../lib/utils/ppt-generator/ppt-preview");

  // Generate preview image
  async function generatePreview(
    settings: PptSettingsStateType,
    primaryLyric: string,
    secondaryLyric: string,
    outputDir: string,
    customFilename?: string,
  ): Promise<string> {
    console.log("Generating preview configuration...");

    // Generate the internal presentation config (same as web app)
    const previewConfig = await generatePreviewConfig({
      settingValues: settings as any,
      primaryLyric,
      secondaryLyric,
    });

    if (!previewConfig || previewConfig.slides.length === 0) {
      throw new Error("No slides to preview");
    }

    console.log(`Found ${previewConfig.slides.length} slides`);
    console.log("Rendering preview image with Playwright...");

    // Generate filename
    const filename = customFilename
      ? `${customFilename}-preview.png`
      : `preview-${Date.now()}.png`;
    const outputPath = path.join(outputDir, filename);

    // Generate the preview image
    const imagePath = await generatePreviewImage(
      previewConfig as any,
      outputPath,
    );

    return imagePath;
  }

  // Generate PPT file
  async function generatePpt(
    settings: PptSettingsStateType,
    primaryLyric: string,
    secondaryLyric: string,
    outputDir: string,
    customFilename?: string,
  ): Promise<string> {
    const mergedSettings = mergeOverwritesFromLyrics(
      settings as any,
      primaryLyric,
    );
    const strippedPrimary = removeAllOverwritesFromLyrics(primaryLyric);
    const strippedSecondary = removeAllOverwritesFromLyrics(secondaryLyric);

    // Override filename if provided
    if (customFilename) {
      mergedSettings.file.filename = customFilename;
    }

    const { pres } = await createPptInstance({
      settingValues: mergedSettings,
      primaryLyric: strippedPrimary,
      secondaryLyric: strippedSecondary,
    });

    const { fileName } = parsePptFilename({
      filename: mergedSettings.file.filename,
      prefix: mergedSettings.file.filenamePrefix,
      suffix: mergedSettings.file.filenameSuffix,
    });

    // Use nodebuffer output type for Node.js environment
    const content = await pres.write({ outputType: "nodebuffer" });
    const filePath = path.join(outputDir, fileName);

    await writeFile(filePath, content as Buffer);
    return filePath;
  }

  try {
    // Load lyrics files
    console.log(`Reading main lyrics from: ${options.main}`);
    const primaryLyric = await readFile(options.main, "utf-8");

    let secondaryLyric: string;
    if (options.secondary) {
      console.log(`Reading secondary lyrics from: ${options.secondary}`);
      secondaryLyric = await readFile(options.secondary, "utf-8");
    } else {
      console.log("No secondary lyrics file provided, using main lyrics.");
      secondaryLyric = primaryLyric;
    }

    // Load settings
    const settings = await loadSettings(options.config);
    if (options.config) {
      console.log(`Loaded settings from: ${options.config}`);
    } else {
      console.log("Using default settings.");
    }

    // Set default filename if not provided
    if (!options.filename && !settings.file.filename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      settings.file.filename = `Lyrics-${timestamp}`;
    }

    if (options.preview) {
      // Generate preview image
      console.log("Generating preview image...");
      const previewPath = await generatePreview(
        settings,
        primaryLyric,
        secondaryLyric,
        options.output,
        options.filename,
      );
      console.log(`Preview image saved to: ${previewPath}`);
    } else {
      // Generate PPT
      console.log("Generating PPT...");
      const outputPath = await generatePpt(
        settings,
        primaryLyric,
        secondaryLyric,
        options.output,
        options.filename,
      );
      console.log(`PPT saved to: ${outputPath}`);
    }

    console.log("Done!");
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
}

// Run main
main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
