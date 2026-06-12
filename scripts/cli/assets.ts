import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

type CliSettings = {
  general?: Record<string, any>;
  section?: Record<string, any>;
};

function getMimeType(filePath: string): string {
  switch (path.extname(filePath).toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".png":
    default:
      return "image/png";
  }
}

function isAlreadyEmbeddedImage(value: string): boolean {
  return (
    value.startsWith("data:") ||
    /^[a-z0-9.+-]+\/[a-z0-9.+-]+;base64,/i.test(value)
  );
}

async function readImageAsDataUrl(filePath: string): Promise<string | null> {
  try {
    const buffer = await readFile(filePath);
    return `data:${getMimeType(filePath)};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

async function hydrateImageValue(
  value: unknown,
  projectRoot: string,
): Promise<unknown> {
  if (typeof value !== "string" || value.trim() === "") {
    return value;
  }

  const imagePath = value.trim();
  if (
    isAlreadyEmbeddedImage(imagePath) ||
    /^[a-z][a-z0-9+.-]*:/i.test(imagePath)
  ) {
    return imagePath;
  }

  if (imagePath.startsWith("/") && !imagePath.startsWith("//")) {
    const publicAsset = await readImageAsDataUrl(
      path.join(projectRoot, "public", imagePath),
    );
    if (publicAsset) {
      return publicAsset;
    }
  }

  if (imagePath.startsWith("file://")) {
    const fileAsset = await readImageAsDataUrl(fileURLToPath(imagePath));
    if (fileAsset) {
      return fileAsset;
    }
  }

  const localPath = path.isAbsolute(imagePath)
    ? imagePath
    : path.join(projectRoot, imagePath);
  return (await readImageAsDataUrl(localPath)) ?? value;
}

async function hydrateImageField(
  settingsGroup: Record<string, any> | undefined,
  key: string,
  projectRoot: string,
) {
  if (!settingsGroup || !(key in settingsGroup)) {
    return;
  }

  settingsGroup[key] = await hydrateImageValue(settingsGroup[key], projectRoot);
}

export async function hydrateCliImageSettings(
  settings: CliSettings,
  projectRoot = process.cwd(),
) {
  await hydrateImageField(settings.general, "mainBackgroundImage", projectRoot);

  for (const sectionSettings of Object.values(settings.section ?? {})) {
    await hydrateImageField(
      sectionSettings?.general,
      "sectionBackgroundImage",
      projectRoot,
    );
  }
}
