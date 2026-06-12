import {
  DEFAULT_FILENAME,
  LYRIC_SECTION,
  SECTION_PREFIX,
  SETTING_FIELD_TYPE,
} from "@/lib/constant";
import { FieldTypeToTypeScriptType } from "@/lib/types";
import { getBase64, getBlobFromUrl } from "@/lib/utils/general";

export const getBase64FromImageField = async (
  imageValue: FieldTypeToTypeScriptType[SETTING_FIELD_TYPE.IMAGE],
): Promise<string | null> => {
  if (!imageValue) {
    return null;
  }

  let image: string | File | Blob = imageValue;
  if (typeof image === "string") {
    if (
      image.startsWith("data:") ||
      /^[a-z0-9.+-]+\/[a-z0-9.+-]+;base64,/i.test(image)
    ) {
      return image;
    }

    if (typeof window === "undefined" && image.startsWith("/")) {
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const filePath = path.join(process.cwd(), "public", image);
        const fileBuffer = await fs.readFile(filePath);
        const ext = path.extname(image).toLowerCase();
        const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
        return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
      } catch (e) {
        // Fallback to fetch if filesystem read fails
      }
    }

    try {
      image = await getBlobFromUrl(image);
    } catch (error) {
      return null;
    }
  }

  try {
    return await getBase64(image);
  } catch (error) {
    console.error("Failed to convert image to base64:", error);
    return null;
  }
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

/**
 * Get title of the master slide with background image for current section
 */
export function getSectionImageSlideMasterTitle(sectionNumber: number) {
  return `${SECTION_PREFIX}${sectionNumber}_IMAGE`;
}

/**
 * Get title of the master slide with background color for current section
 */
export function getSectionColorSlideMasterTitle(sectionNumber: number) {
  return `${SECTION_PREFIX}${sectionNumber}_COLOR`;
}
