import fs from "fs/promises";
import path from "path";
import { chromium } from "playwright";

const LYRICS_FILE = "/home/clawd/workspaces/lyrics-shelf/version-3/11.txt";
const DOWNLOAD_DIR = "/home/clawd/downloads";
const PPT_URL = "https://ho2-khen.netlify.app/ppt-generator";

async function main() {
  const lyrics = await fs.readFile(LYRICS_FILE, "utf-8");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `LyricSlides-${timestamp}.pptx`;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1366, height: 768 },
  });
  const page = await context.newPage();
  await page.goto(PPT_URL, { waitUntil: "networkidle" });

  const mainInput = page.getByRole("textbox", {
    name: "Insert the main lyrics here. Press '/' for insert command.",
  });
  const secondaryInput = page.getByRole("textbox", {
    name: "Insert the secondary lyrics here.",
  });
  await mainInput.fill(lyrics);
  await secondaryInput.fill(lyrics);

  const fileNameInput = page.locator('input[name="file.filename"]');
  await fileNameInput.fill(fileName.replace(/\.pptx$/i, ""));

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page
      .getByRole("button", { name: "Generate", exact: true })
      .click(),
  ]);

  const downloadPath = path.join(DOWNLOAD_DIR, fileName);
  await download.saveAs(downloadPath);
  console.log(`Download saved to ${downloadPath}`);

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});