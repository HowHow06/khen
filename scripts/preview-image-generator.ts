/**
 * Preview Image Generator for CLI
 * Generates PNG preview images of PPT slides using Playwright
 */

import { chromium } from "playwright";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

// Get the project root directory (where public folder is located)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

/**
 * Load font CSS files and embed fonts as base64 data URLs
 */
async function loadFontCSS(): Promise<string> {
  const cssFiles = ["microsoft-yahei.css", "ebrima.css"];
  const fontCSSParts: string[] = [];

  for (const cssFile of cssFiles) {
    try {
      const cssPath = path.join(PROJECT_ROOT, "public", "css", cssFile);
      let cssContent = await fs.readFile(cssPath, "utf-8");

      // Find all font URLs and replace with base64 data URLs
      const urlMatches = cssContent.matchAll(/url\("([^"]+)"\)/g);
      for (const match of urlMatches) {
        const urlPath = match[1];
        if (urlPath.startsWith("/fonts/")) {
          const fontPath = path.join(PROJECT_ROOT, "public", urlPath);
          try {
            const fontData = await fs.readFile(fontPath);
            const base64 = fontData.toString("base64");
            const mimeType = urlPath.endsWith(".woff2")
              ? "font/woff2"
              : "font/woff";
            cssContent = cssContent.replace(
              `url("${urlPath}")`,
              `url("data:${mimeType};base64,${base64}")`
            );
          } catch {
            // Font file not found, keep original URL (will use local font)
          }
        }
      }

      fontCSSParts.push(cssContent);
    } catch {
      // CSS file not found, skip
    }
  }

  return fontCSSParts.join("\n");
}

// Types from the preview system
interface InternalTextPart {
  text: string;
  style: {
    fontSize?: number;
    color?: string | null;
    fontFace?: string;
    bold?: boolean;
    italic?: boolean;
    charSpacing?: number;
    lineSpacing?: number;
    underline?: boolean;
    strike?: boolean;
  };
}

interface InternalSlideObject {
  kind: string;
  text?: InternalTextPart[];
  style: {
    x: number | string;
    y: number | string;
    w: number | string;
    h: number | string;
    align?: string;
    verticalAlign?: string;
    fontSize?: number;
    color?: string | null;
    fontFace?: string;
    bold?: boolean;
    charSpacing?: number;
    lineSpacing?: number;
  };
}

interface InternalSlide {
  masterName?: string | null;
  backgroundColor?: string;
  backgroundImage?: string;
  sectionName?: string;
  objects?: InternalSlideObject[];
}

interface InternalMasterSlide {
  name?: string;
  objects?: InternalSlideObject[];
  backgroundColor?: string;
  backgroundImage?: {
    kind: string;
    path?: string;
    data?: string;
  } | null;
}

interface InternalPresentation {
  layout: string;
  masterSlides: Record<string, InternalMasterSlide>;
  slides: InternalSlide[];
}

const POINTS_TO_INCHES = 1 / 72;

function layoutToInches(layout: string): [number, number] {
  switch (layout) {
    case "16x10":
      return [10, 6.25];
    case "16x9":
      return [10, 5.625];
    case "4x3":
      return [10, 7.5];
    case "wide":
      return [13.3, 7.5];
    default:
      return [10, 5.625]; // Default to 16:9
  }
}

function normalizedColorToCSS(color: string | { type: string; color: string; alpha: number }): string {
  if (typeof color === "string") {
    return color.startsWith("#") ? color : `#${color}`;
  } else {
    const r = parseInt(color.color.substring(0, 2), 16);
    const g = parseInt(color.color.substring(2, 4), 16);
    const b = parseInt(color.color.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${1 - color.alpha / 100})`;
  }
}

// Calculate percentage - value can be inches (number) or already a percentage string
function calculatePercentage(value: number | string, total: number): number {
  if (typeof value === "number") {
    return (value / total) * 100;
  }
  // If it's a string like "50%", parse the number
  return parseInt(String(value), 10);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>");
}

function removeNumbering(text: string): string {
  // Remove leading numbering like "1. " or "1.1 "
  return text.replace(/^\d+(\.\d+)*\.?\s*/, "").trim();
}

// Convert points to pixels based on slide dimensions
function pointsToPx(points: number, dimensions: [number, number], slideWidth: number): number {
  return ((points * POINTS_TO_INCHES) / dimensions[0]) * slideWidth;
}

function getTextPartStyleCSS(
  style: any,
  dimensions: [number, number],
  slideWidth: number
): string {
  const styles: string[] = [];

  if (style.fontSize) {
    styles.push(`font-size: ${pointsToPx(style.fontSize, dimensions, slideWidth)}px`);
  }
  if (style.color) {
    styles.push(`color: ${normalizedColorToCSS(style.color)}`);
  }
  if (style.fontFace) {
    styles.push(`font-family: '${style.fontFace}', sans-serif`);
  }
  if (style.bold) {
    styles.push("font-weight: bold");
  }
  if (style.charSpacing) {
    styles.push(`letter-spacing: ${pointsToPx(style.charSpacing, dimensions, slideWidth)}px`);
  }
  if (style.lineSpacing) {
    styles.push(`line-height: ${pointsToPx(style.lineSpacing, dimensions, slideWidth)}px`);
  }

  return styles.join("; ");
}

function renderTextObject(
  object: InternalSlideObject,
  dimensions: [number, number],
  slideWidth: number
): string {
  if (object.kind !== "text" || !object.text || object.text.length === 0) return "";

  // Calculate positions - x, y, w might be percentage strings like "30%" or numbers (inches)
  const xPct = calculatePercentage(object.style.x, dimensions[0]);
  const yPct = calculatePercentage(object.style.y, dimensions[1]);
  const wPct = calculatePercentage(object.style.w, dimensions[0]);
  
  // Height might be 0 or undefined - in that case, let it auto-size
  const rawH = object.style.h;
  const hasHeight = rawH !== undefined && rawH !== 0 && rawH !== "0" && rawH !== "0%";
  const hPct = hasHeight ? calculatePercentage(rawH, dimensions[1]) : 0;

  // Get container style - this includes font size, color, etc.
  const containerStyleCSS = getTextPartStyleCSS(object.style, dimensions, slideWidth);

  // Determine horizontal alignment
  const textAlign = object.style.align || "center";

  // Render text parts - merge container styles with part-specific styles
  // Part styles override container styles
  const textParts = object.text
    .map((part) => {
      // Merge object.style with part.style (part overrides)
      const mergedStyle = { ...object.style, ...part.style };
      const partStyleCSS = getTextPartStyleCSS(mergedStyle, dimensions, slideWidth);
      return `<span style="${partStyleCSS}">${escapeHtml(part.text)}</span>`;
    })
    .join("");

  // If height is 0, don't constrain height - let text flow naturally
  const heightStyle = hasHeight ? `height: ${hPct}%;` : "";

  // Build clean inline styles without newlines
  // Use transform to offset text upward by half line height for better vertical centering
  // This aligns the center of the text with the y position rather than the top
  const outerStyles = [
    "position: absolute",
    `left: ${xPct}%`,
    `top: ${yPct}%`,
    `width: ${wPct}%`,
    hasHeight ? `height: ${hPct}%` : "",
    "box-sizing: border-box",
    "transform: translateY(-50%)", // Center text on y position
  ].filter(Boolean).join("; ");

  const innerStyles = [
    containerStyleCSS,
    "width: 100%",
    "line-height: 1.2", // Consistent line height
    `text-align: ${textAlign}`,
  ].filter(Boolean).join("; ");

  return `<div style="${outerStyles}"><div style="${innerStyles}">${textParts}</div></div>`;
}

function renderSlide(
  slide: InternalSlide,
  masterSlide: InternalMasterSlide | undefined,
  dimensions: [number, number],
  slideWidth: number
): string {
  // Get background from slide or master slide
  const backgroundColor = slide.backgroundColor ?? masterSlide?.backgroundColor;
  const slideBackgroundImage = slide.backgroundImage;
  const masterBackgroundImage = masterSlide?.backgroundImage;

  let bgImageStyle = "";
  
  // Check slide background image first
  if (slideBackgroundImage) {
    if (typeof slideBackgroundImage === "string") {
      // Already a data URL or path
      if (slideBackgroundImage.startsWith("data:") || slideBackgroundImage.startsWith("image/")) {
        bgImageStyle = `background-image: url("data:${slideBackgroundImage}");`;
      } else {
        bgImageStyle = `background-image: url("${slideBackgroundImage}");`;
      }
    }
  } else if (masterBackgroundImage) {
    // Check master slide background image
    if (masterBackgroundImage.kind === "path" && masterBackgroundImage.path) {
      bgImageStyle = `background-image: url("${masterBackgroundImage.path}");`;
    } else if (masterBackgroundImage.data) {
      bgImageStyle = `background-image: url("data:${masterBackgroundImage.data}");`;
    }
  }

  const aspectRatio = dimensions[0] / dimensions[1];
  const slideHeight = slideWidth / aspectRatio;

  // Render master slide objects first (background elements)
  const masterObjects = masterSlide?.objects
    ?.map((obj) => renderTextObject(obj, dimensions, slideWidth))
    .join("") ?? "";

  // Render slide objects on top
  const slideObjects = slide.objects
    ?.map((obj) => renderTextObject(obj, dimensions, slideWidth))
    .join("") ?? "";

  // Default to black background if no color specified (common for PPT slides)
  const bgColor = backgroundColor ? normalizedColorToCSS(backgroundColor) : "#000000";

  return `
    <div style="
      width: ${slideWidth}px;
      height: ${slideHeight}px;
      background-color: ${bgColor};
      ${bgImageStyle}
      background-size: cover;
      background-position: center;
      position: relative;
      white-space: pre-wrap;
      overflow: hidden;
      border-radius: 8px;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
    ">
      ${masterObjects}
      ${slideObjects}
    </div>
  `;
}

function generatePreviewHtml(config: InternalPresentation, fontCSS: string): string {
  const dimensions = layoutToInches(config.layout);
  const slideWidth = 480; // Increased from 320 for better visibility

  // Group slides by section
  const slidesBySection: Record<string, Array<{ slide: InternalSlide; index: number }>> = {};
  config.slides.forEach((slide, index) => {
    const sectionName = slide.sectionName || "Slides";
    if (!slidesBySection[sectionName]) {
      slidesBySection[sectionName] = [];
    }
    slidesBySection[sectionName].push({ slide, index: index + 1 });
  });

  const sectionsHtml = Object.entries(slidesBySection)
    .map(([sectionName, slides]) => {
      const displayName = removeNumbering(sectionName.trim());

      const slidesHtml = slides
        .map(({ slide, index }) => {
          const masterSlide = slide.masterName
            ? config.masterSlides[slide.masterName]
            : undefined;

          return `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 8px;
            ">
              <div style="
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
                border-radius: 8px;
                overflow: hidden;
              ">
                ${renderSlide(slide, masterSlide, dimensions, slideWidth)}
              </div>
              <span style="
                font-size: 11px;
                color: #a1a1aa;
                background-color: #18181b;
                padding: 4px 10px;
                border-radius: 6px;
              ">Slide ${index}</span>
            </div>
          `;
        })
        .join("");

      return `
        <div style="margin-bottom: 36px;">
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #27272a;
          ">
            <h2 style="
              font-size: 18px;
              font-weight: 600;
              color: #fafafa;
              margin: 0;
            ">${escapeHtml(displayName)}</h2>
            <span style="
              font-size: 12px;
              color: #71717a;
              background: #18181b;
              padding: 4px 10px;
              border-radius: 9999px;
            ">${slides.length} slide${slides.length !== 1 ? "s" : ""}</span>
          </div>
          <div style="
            display: grid;
            grid-template-columns: repeat(4, ${slideWidth}px);
            gap: 20px;
          ">
            ${slidesHtml}
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        /* Embedded font definitions */
        ${fontCSS}
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background-color: #09090b;
          padding: 40px;
          width: 2100px;
        }
      </style>
    </head>
    <body>
      <div style="margin-bottom: 32px;">
        <h1 style="
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        ">Khen PPT Preview</h1>
        <p style="font-size: 14px; color: #71717a; margin: 0;">
          ${config.slides.length} slides • Generated ${new Date().toLocaleDateString()}
        </p>
      </div>
      ${sectionsHtml}
    </body>
    </html>
  `;
}

export async function generatePreviewImage(
  config: InternalPresentation,
  outputPath: string
): Promise<string> {
  // Load font CSS with embedded base64 fonts
  const fontCSS = await loadFontCSS();
  const html = generatePreviewHtml(config, fontCSS);

  // Launch browser and capture screenshot
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set content and wait for rendering
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  
  // Wait for fonts to load and content to render
  await page.waitForTimeout(500);

  // Take full page screenshot
  const screenshotPath = outputPath.endsWith(".png") ? outputPath : `${outputPath}.png`;

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  await browser.close();

  return screenshotPath;
}

// Export types for use in main script
export type { InternalPresentation };
