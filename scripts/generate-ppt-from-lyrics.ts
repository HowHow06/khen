import { readFile, writeFile } from "fs/promises";
import path from "path";
import {
  combineWithDefaultSettings,
  generatePptSettingsInitialState,
  mergeOverwritesFromLyrics,
} from "../lib/utils/ppt-generator/index.ts";
import { createPptInstance } from "../lib/utils/ppt-generator/ppt-generation.ts";
import { removeAllOverwritesFromLyrics } from "../lib/utils/ppt-generator/lyrics-overwrite.ts";
import { parsePptFilename } from "../lib/utils/ppt-generator/settings-utils.ts";
import { PPT_GENERATION_SETTINGS_META } from "../lib/constant/ppt-generator.ts";

const OUTPUT_DIR = "/home/clawd/downloads";
const INPUT_FILE = "/home/clawd/workspaces/lyrics-shelf/version-3/11.txt";

async function main() {
  const lyricText = await readFile(INPUT_FILE, "utf-8");
  const baseSettings = combineWithDefaultSettings(
    generatePptSettingsInitialState(PPT_GENERATION_SETTINGS_META),
  );
  const deadline = new Date().toISOString().replace(/[:.]/g, "-");
  baseSettings.file.filename = `Lyrics - ${deadline}`;

  const mergedSettings = mergeOverwritesFromLyrics(baseSettings, lyricText);
  const primary = removeAllOverwritesFromLyrics(lyricText);
  const secondary = removeAllOverwritesFromLyrics(lyricText);

  const { pres } = await createPptInstance({
    settingValues: mergedSettings,
    primaryLyric: primary,
    secondaryLyric: secondary,
  });

  const { fileName } = parsePptFilename({
    filename: mergedSettings.file.filename,
    prefix: mergedSettings.file.filenamePrefix,
    suffix: mergedSettings.file.filenameSuffix,
  });

  const content = await pres.write();
  const arrayBuffer = await content.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filePath = path.join(OUTPUT_DIR, fileName);
  await writeFile(filePath, buffer);
  console.log(`Generated PPT saved to ${filePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});