import {
  DEFAULT_FILENAME,
  LYRIC_SECTION,
  SETTING_FIELD_TYPE,
} from "@/lib/constant";
import { FieldTypeToTypeScriptType } from "@/lib/types";
import { getBase64, getBlobFromUrl } from "@/lib/utils";

export const getBase64FromImageField = async (
  imageValue: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.IMAGE],
): Promise<string | null> => {
  if (!imageValue) {
    return null;
  }

  let image: string | File | Blob = imageValue;
  if (typeof image === "string") {
    try {
      image = await getBlobFromUrl(image);
    } catch (error) {
      return null;
    }
  }

  return await getBase64(image);
};

/**
 * Check whether the given line is any special type (empty slide, fill slide, cover, section etc.)
 */
export function getIsNormalLine(line: string): boolean {
  for (const key in LYRIC_SECTION) {
    const syntax = LYRIC_SECTION[key as keyof typeof LYRIC_SECTION];
    if (line.startsWith(syntax)) {
      return false;
    }
  }
  return true;
}

// Function overload signatures, to tell typescript that when hexColor is not undefined, the output must be string
export function getColorValue(
  hexColor: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.COLOR],
): string;
export function getColorValue(
  hexColor: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.COLOR] | undefined,
): string | undefined;
export function getColorValue(
  hexColor: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.COLOR] | undefined,
): string | undefined {
  if (hexColor === undefined) return hexColor;
  return hexColor.replace("#", "");
}

export const parsePptFilename = ({
  filename,
  suffix,
  prefix,
}: {
  filename: string | undefined;
  suffix: string | undefined;
  prefix: string | undefined;
}) => {
  const fileName = filename || DEFAULT_FILENAME;
  const cleanFileName = fileName
    .toString()
    .replace(/\.pptx$/i, "")
    .trim();
  const fileNameSuffix = suffix ? suffix.trim() : "";
  const fileNamePrefix = prefix ? prefix.trim() : "";

  return {
    fileName: fileNamePrefix + cleanFileName + fileNameSuffix + ".pptx",
    cleanFileName,
    fileNamePrefix,
    fileNameSuffix,
  };
};
