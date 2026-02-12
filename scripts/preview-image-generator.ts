/**
 * Preview Image Generator for CLI
 * Generates PNG preview images of PPT slides using Playwright
 */

import { chromium } from "playwright";
import path from "path";

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

function calculatePercentage(value: number | string, total: number): number {
  return typeof value === "number" ? (value / total) * 100 : parseInt(String(value), 10);
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

function getTextStyleCSS(
  style: InternalSlideObject["style"],
  dimensions: [number, number],
  slideWidth: number
): string {
  const pointsToPx = (points: number) =>
    ((points * POINTS_TO_INCHES) / dimensions[0]) * slideWidth;

  const styles: string[] = [];

  if (style.fontSize) {
    styles.push(`font-size: ${pointsToPx(style.fontSize)}px`);
  }
  if (style.color) {
    styles.push(`color: ${normalizedColorToCSS(style.color)}`);
  }
  if (style.fontFace) {
    styles.push(`font-family: "${style.fontFace}", sans-serif`);
  }
  if (style.bold) {
    styles.push("font-weight: bold");
  }
  if (style.charSpacing) {
    styles.push(`letter-spacing: ${pointsToPx(style.charSpacing)}px`);
  }
  if (style.lineSpacing) {
    styles.push(`line-height: ${pointsToPx(style.lineSpacing)}px`);
  }

  return styles.join("; ");
}

function renderTextObject(
  object: InternalSlideObject,
  dimensions: [number, number],
  slideWidth: number
): string {
  if (object.kind !== "text" || !object.text) return "";

  const xPct = calculatePercentage(object.style.x, dimensions[0]);
  const yPct = calculatePercentage(object.style.y, dimensions[1]);
  const wPct = calculatePercentage(object.style.w, dimensions[0]);
  const hPct = calculatePercentage(object.style.h, dimensions[1]);

  const containerStyle = getTextStyleCSS(object.style, dimensions, slideWidth);

  let verticalAlign = "center";
  if (object.style.verticalAlign === "top") verticalAlign = "flex-start";
  if (object.style.verticalAlign === "bottom") verticalAlign = "flex-end";

  const textParts = object.text
    .map((part) => {
      const partStyle = getTextStyleCSS(
        part.style as InternalSlideObject["style"],
        dimensions,
        slideWidth
      );
      return `<div style="${partStyle}">${escapeHtml(part.text)}</div>`;
    })
    .join("");

  return `
    <div style="
      position: absolute;
      left: ${xPct}%;
      top: ${yPct}%;
      width: ${wPct}%;
      height: ${hPct}%;
      box-sizing: border-box;
    ">
      <div style="
        ${containerStyle};
        height: 100%;
        display: flex;
        flex-direction: column;
        text-align: ${object.style.align || "left"};
        justify-content: ${object.style.align || "left"};
        align-items: ${verticalAlign};
      ">
        ${textParts}
      </div>
    </div>
  `;
}

function renderSlide(
  slide: InternalSlide,
  masterSlide: InternalMasterSlide | undefined,
  dimensions: [number, number],
  slideWidth: number
): string {
  const backgroundColor = slide.backgroundColor ?? masterSlide?.backgroundColor;
  const backgroundImage = slide.backgroundImage ?? masterSlide?.backgroundImage;

  let bgImageStyle = "";
  if (backgroundImage) {
    if (typeof backgroundImage === "string") {
      bgImageStyle = `background-image: url("data:${backgroundImage}");`;
    } else if (backgroundImage.kind === "path" && backgroundImage.path) {
      bgImageStyle = `background-image: url("${backgroundImage.path}");`;
    } else if (backgroundImage.data) {
      bgImageStyle = `background-image: url("data:${backgroundImage.data}");`;
    }
  }

  const aspectRatio = dimensions[0] / dimensions[1];
  const slideHeight = slideWidth / aspectRatio;

  const masterObjects = masterSlide?.objects
    ?.map((obj) => renderTextObject(obj, dimensions, slideWidth))
    .join("") ?? "";

  const slideObjects = slide.objects
    ?.map((obj) => renderTextObject(obj, dimensions, slideWidth))
    .join("") ?? "";

  return `
    <div style="
      width: ${slideWidth}px;
      height: ${slideHeight}px;
      background-color: ${backgroundColor ? normalizedColorToCSS(backgroundColor) : "white"};
      ${bgImageStyle}
      background-size: cover;
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

function generatePreviewHtml(config: InternalPresentation): string {
  const dimensions = layoutToInches(config.layout);
  const slideWidth = 320;

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
            grid-template-columns: repeat(5, ${slideWidth}px);
            gap: 16px;
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background-color: #09090b;
          padding: 40px;
          width: 1800px;
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
  const html = generatePreviewHtml(config);

  // Launch browser and capture screenshot
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set content and wait for rendering
  await page.setContent(html, { waitUntil: "networkidle" });

  // Get the body dimensions to capture the full content
  const bodyHandle = await page.$("body");
  const boundingBox = await bodyHandle?.boundingBox();

  if (!boundingBox) {
    await browser.close();
    throw new Error("Failed to get page dimensions");
  }

  // Take screenshot
  const screenshotPath = outputPath.endsWith(".png") ? outputPath : `${outputPath}.png`;

  await page.screenshot({
    path: screenshotPath,
    clip: {
      x: 0,
      y: 0,
      width: Math.ceil(boundingBox.width),
      height: Math.ceil(boundingBox.height),
    },
  });

  await browser.close();

  return screenshotPath;
}

// Export types for use in main script
export type { InternalPresentation };
