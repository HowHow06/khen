# AGENTS.md - CLI Scripts

Technical documentation for AI assistants and developers working on the CLI tools.

## Directory Structure

```
scripts/
├── AGENTS.md                      # This file
├── generate-ppt-from-lyrics.ts    # Main CLI entry point
├── preview-image-generator.ts     # Preview image rendering module
├── presets/                       # Pre-configured settings JSON files
│   ├── README.md
│   ├── onsite-chinese.json
│   ├── onsite-english.json
│   ├── live-chinese.json
│   └── live-english.json
└── samples/                       # Sample files for testing
    ├── README.md
    ├── sample-lyrics-chinese.txt
    └── sample-settings.json
```

## Main Entry Point: `generate-ppt-from-lyrics.ts`

### Overview

The CLI script generates PowerPoint presentations from lyrics files. It's designed to run standalone via `npx tsx` without requiring the web app.

### Command Line Options

| Option          | Short | Type    | Default | Description                                      |
|-----------------|-------|---------|---------|--------------------------------------------------|
| `--main`        | `-m`  | string  | -       | Path to main lyrics file (required)              |
| `--secondary`   | `-s`  | string  | -       | Path to secondary lyrics file                    |
| `--auto-pinyin` | `-y`  | boolean | false   | Auto-generate pinyin as secondary lyrics         |
| `--config`      | `-c`  | string  | -       | Path to settings JSON file                       |
| `--output`      | `-o`  | string  | `.`     | Output directory                                 |
| `--filename`    | `-f`  | string  | -       | Output filename (without extension)              |
| `--preview`     | `-p`  | boolean | false   | Generate preview image instead of PPT            |
| `--help`        | `-h`  | boolean | false   | Show help message                                |

### Architecture: Circular Dependency Avoidance

The CLI uses **dynamic imports** inside the `main()` function to avoid circular dependency issues that occur at module load time. This is a critical pattern that must be maintained.

**Why dynamic imports?**
- The web app's utilities have complex interdependencies
- Static imports at the top of the file cause `ReferenceError: Cannot access 'X' before initialization`
- Dynamic imports defer module loading until runtime, after all modules are initialized

**Import order matters:**
```typescript
// 1. First: Load constants (no dependencies on utils)
const constantModule = await import("../lib/constant/ppt-generator");

// 2. Second: Load utility functions
const { deepMerge } = await import("../lib/utils/general");
const { removeAllOverwritesFromLyrics } = await import("../lib/utils/ppt-generator/lyrics-overwrite");

// 3. Third: Load heavier modules that depend on above
const { createPptInstance } = await import("../lib/utils/ppt-generator/ppt-generation");
```

### Settings Generation (Inline Implementation)

The CLI contains an **inline copy** of the settings generation logic (`generatePptSettingsInitialState`, `getInitialValuesFromSettings`, etc.) rather than importing from `lib/utils/ppt-generator/settings-generator.ts`.

**Why?**
- The original `settings-generator.ts` has imports that trigger circular dependencies
- The inline version is simplified to only what the CLI needs
- It uses the same constants from `lib/constant/ppt-generator.ts` to stay in sync

**Key functions:**
- `getInitialValuesFromSettings()` - Extracts default values from settings metadata
- `getTextboxSettingsInitialValues()` - Creates textbox-specific settings
- `generatePptSettingsInitialState()` - Builds complete initial settings state
- `combineWithDefaultSettings()` - Merges user settings with defaults

### Secondary Lyrics Resolution

The CLI resolves secondary lyrics in this priority order:
1. `--secondary` file path (if provided)
2. `--auto-pinyin` flag → generates pinyin from primary lyrics using `lib/utils/pinyin.ts`
3. Falls back to using primary lyrics as secondary

### PPT Generation Flow

```
1. Parse CLI args
2. Load constants (dynamic import)
3. Load utilities (dynamic import)
4. Read primary lyrics file
5. Resolve secondary lyrics (file / auto-pinyin / fallback)
6. Load settings (JSON file or defaults)
7. Merge inline overwrites from lyrics into settings
8. Strip overwrites from lyrics text
9. Create pptxgenjs instance via createPptInstance()
10. Write buffer to file
```

### Preview Generation Flow

```
1. Steps 1-6 same as PPT generation
2. Call generatePreviewConfig() to get InternalPresentation
3. Pass to generatePreviewImage() in preview-image-generator.ts
4. Playwright renders HTML and captures screenshot
```

---

## Preview Image Generator: `preview-image-generator.ts`

### Overview

Converts `InternalPresentation` data into a PNG image using Playwright (headless Chromium).

### Key Concepts

**InternalPresentation Structure:**
```typescript
interface InternalPresentation {
  layout: string;                                    // "16x9", "16x10", "4x3", "wide"
  masterSlides: Record<string, InternalMasterSlide>; // Named master slides
  slides: InternalSlide[];                           // All slides
}

interface InternalSlide {
  masterName?: string | null;    // Reference to master slide
  backgroundColor?: string;      // Slide-specific background
  backgroundImage?: string;      // Slide-specific background image
  sectionName?: string;          // Section this slide belongs to
  objects?: InternalSlideObject[]; // Text/shape objects
}

interface InternalSlideObject {
  kind: string;                  // "text" | "shape" | etc.
  text?: InternalTextPart[];     // Text content with styling
  style: {
    x: number | string;          // Position (inches or percentage)
    y: number | string;
    w: number | string;          // Size
    h: number | string;
    align?: string;              // "left" | "center" | "right"
    fontSize?: number;           // Points
    color?: string | null;
    fontFace?: string;
    // ... more style properties
  };
}
```

### Coordinate System

**pptxgenjs uses inches**, but the preview uses **percentages** for responsive scaling.

```typescript
// Convert inches to percentage of slide dimension
function calculatePercentage(value: number | string, total: number): number {
  if (typeof value === "number") {
    return (value / total) * 100;
  }
  return parseInt(String(value), 10); // Already a percentage string
}
```

**Slide dimensions by layout:**
- `16x9`: 10" × 5.625"
- `16x10`: 10" × 6.25"
- `4x3`: 10" × 7.5"
- `wide`: 13.3" × 7.5"

### Font Embedding

Fonts are embedded as **base64 data URLs** so they work in the headless browser without file system access.

```typescript
async function loadFontCSS(): Promise<string> {
  // 1. Read CSS files from public/css/
  // 2. Find all url("/fonts/...") references
  // 3. Read font files, convert to base64
  // 4. Replace URLs with data:font/woff2;base64,... 
  // 5. Return self-contained CSS
}
```

**Font files used:**
- `public/css/microsoft-yahei.css` → `public/fonts/microsoft-yahei-*.woff2`
- `public/css/ebrima.css` → `public/fonts/ebrima-*.woff2`

### Text Rendering

Text objects are rendered with careful style merging:

```typescript
// Container style (from object.style)
const containerStyleCSS = getTextPartStyleCSS(object.style, dimensions, slideWidth);

// Each text part can override container styles
object.text.map((part) => {
  const mergedStyle = { ...object.style, ...part.style };
  return `<span style="${getTextPartStyleCSS(mergedStyle, ...)}">...</span>`;
});
```

**Font size conversion:**
```typescript
// pptxgenjs uses points, CSS needs pixels
// Scale based on slide width for responsive rendering
function pointsToPx(points: number, dimensions: [number, number], slideWidth: number): number {
  const POINTS_TO_INCHES = 1 / 72;
  return ((points * POINTS_TO_INCHES) / dimensions[0]) * slideWidth;
}
```

### HTML Structure

```html
<body style="background: #09090b; padding: 40px; width: 2100px;">
  <!-- Header -->
  <h1>Khen PPT Preview</h1>
  <p>X slides • Generated DATE</p>
  
  <!-- Sections -->
  <div class="section">
    <h2>Section Name</h2>
    <span>N slides</span>
    
    <!-- Grid of slides (4 columns) -->
    <div style="display: grid; grid-template-columns: repeat(4, 480px);">
      <div class="slide-container">
        <div class="slide" style="width: 480px; height: Xpx;">
          <!-- Master slide objects -->
          <!-- Slide objects -->
        </div>
        <span>Slide N</span>
      </div>
    </div>
  </div>
</body>
```

### Playwright Usage

```typescript
const browser = await chromium.launch();
const page = await browser.newPage();

await page.setContent(html, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(500); // Allow fonts to load

await page.screenshot({
  path: outputPath,
  fullPage: true,  // Capture entire page, not just viewport
});

await browser.close();
```

**Prerequisites:**
```bash
npx playwright install chromium
```

---

## Adding New CLI Options

### 1. Update Argument Parsing

```typescript
// In parseCliArgs()
const { values } = parseArgs({
  options: {
    // Add new option
    "new-option": { type: "boolean", short: "n", default: false },
  },
});

// Update return type and value
return {
  newOption: values["new-option"] as boolean,
};
```

### 2. Update CliOptions Interface

```typescript
interface CliOptions {
  newOption: boolean;
}
```

### 3. Update Help Text

```typescript
function showHelp(): void {
  console.log(`
Options:
  --new-option, -n  Description of new option
  
Examples:
  npx tsx scripts/generate-ppt-from-lyrics.ts --main lyrics.txt --new-option
  `);
}
```

### 4. Implement Logic

Handle the new option in the `main()` function after dynamic imports are complete.

---

## Adding New Presets

1. Create JSON file in `scripts/presets/`
2. Follow the `PptSettingsStateType` structure
3. Update `scripts/presets/README.md`
4. Update `docs/CLI_PPT_GENERATOR_GUIDE.md`

---

## Testing Commands

```bash
# Basic PPT generation
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main scripts/samples/sample-lyrics-chinese.txt

# With preset and auto-pinyin
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main scripts/samples/sample-lyrics-chinese.txt \
  --config scripts/presets/onsite-chinese.json \
  --auto-pinyin

# Preview image generation
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main scripts/samples/sample-lyrics-chinese.txt \
  --config scripts/presets/onsite-chinese.json \
  --preview

# Type checking
npm run type-check
```

---

## Common Issues

### Circular Dependency Errors

**Symptom:** `ReferenceError: Cannot access 'X' before initialization`

**Cause:** Static imports at module load time create cycles

**Fix:** Use dynamic imports inside `main()`:
```typescript
// BAD - static import
import { foo } from "../lib/utils/bar";

// GOOD - dynamic import
async function main() {
  const { foo } = await import("../lib/utils/bar");
}
```

### Playwright Not Installed

**Symptom:** `Error: Cannot find module 'playwright'` or browser not found

**Fix:**
```bash
npm install playwright
npx playwright install chromium
```

### Font Rendering Issues

**Symptom:** Text appears with wrong font or as boxes

**Cause:** Font files not found or CSS paths incorrect

**Fix:** Ensure `public/css/*.css` and `public/fonts/*.woff2` files exist and paths match

### Preview Positioning Off

**Symptom:** Text appears mispositioned compared to actual PPT

**Cause:** Coordinate calculation or CSS transformation mismatch

**Reference:** Compare with `components/react-pptx-preview/SlidePreview.tsx` for web app's implementation

---

## Related Files

- `lib/constant/ppt-generator.ts` - Settings metadata and constants
- `lib/utils/ppt-generator/ppt-generation.ts` - PPT instance creation
- `lib/utils/ppt-generator/ppt-preview.ts` - Preview config generation
- `lib/utils/ppt-generator/settings-diff.ts` - Settings merging with overwrites
- `lib/utils/ppt-generator/lyrics-overwrite.ts` - Overwrite extraction from lyrics
- `lib/utils/pinyin.ts` - Pinyin generation
- `components/react-pptx-preview/SlidePreview.tsx` - Web app's preview component (reference for styling)
- `docs/CLI_PPT_GENERATOR_GUIDE.md` - User-facing documentation
