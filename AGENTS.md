# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.

## Project Overview

Khen is a Next.js-based web application designed to generate PowerPoint presentations for praise and worship songs. The primary feature is the PPT Generator, which converts song lyrics into formatted presentation slides with extensive customization options.

**Tech Stack:**
- Next.js 16 with App Router (React 19)
- TypeScript
- Tailwind CSS with shadcn/ui components
- pptxgenjs for PowerPoint generation
- React Hook Form with Zod validation
- Jest for testing

## Environment Setup

**Before running any commands**, check the environment for Node.js version managers and switch to the appropriate version:

1. **Check for nvm or nvs:**
   ```bash
   # Check if nvm is available
   command -v nvm
   
   # Check if nvs is available
   command -v nvs
   ```

2. **Switch to the correct Node.js version:**
   ```bash
   # If using nvm
   nvm use 20
   
   # If using nvs
   nvs use 20
   ```

3. **Verify the Node.js version meets requirements:**
   ```bash
   node --version  # Should be >= 20.9.0
   ```

**Node Version:** Requires Node.js >= 20.9.0 (specified in package.json engines)

## Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbo

# Building
npm run build           # Build static export (configured with output: "export")
npm start               # Start production server

# Testing & Quality
npm test                # Run Jest tests
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript compiler checks
npm run check           # Run both lint and type-check
```

## Architecture Overview

### Directory Structure

- **`app/`** - Next.js App Router pages
  - `ppt-generator/page.tsx` - Main PPT generator page
- **`components/`** - React components
  - `context/` - React Context providers for state management
  - `ppt-generator/` - PPT generator-specific components
  - `ui/` - shadcn/ui components
- **`lib/`** - Core business logic
  - `constant/` - Constants and configuration
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions
  - `hooks/` - Custom React hooks
  - `schemas/` - Zod validation schemas
  - `presets/` - Preset configurations for PPT settings

### Core Context Providers

The application uses three main context providers that wrap the PPT generator page:

1. **`LineToSlideMapperContext`** - Maintains mapping between lyric lines and generated slides for live preview functionality
2. **`PptSettingsUIContext`** - Manages UI state (accordion open/closed, active tabs, auto-pinyin settings)
3. **`PptGeneratorFormContext`** - Main form state including:
   - Primary and secondary lyric text
   - Complete settings form state (via React Hook Form)
   - PPT generation and submission logic

These are applied in nested order in `app/ppt-generator/page.tsx`.

### Settings System Architecture

The settings system is a complex, type-safe configuration architecture:

- **Settings Categories:** `FILE`, `GENERAL`, `COVER`, `CONTENT`, `SECTION`
- **Content Types:** Different text types (main, pinyin, translation, transliteration)
- **Dynamic Structure:**
  - Sections can be added dynamically (identified by `section_N` keys)
  - Each section can have multiple textboxes (identified by `textbox_N` keys)
  - Each section can override general settings with section-specific values

**Key Files:**
- `lib/constant/ppt-generator.ts` - Settings metadata definitions
- `lib/types/ppt-generator.ts` - Complex TypeScript types for settings
- `lib/utils/ppt-generator/settings-generator.ts` - Initial state generation
- `lib/utils/ppt-generator/settings-diff.ts` - Compare and merge settings

**Type System:** Settings types are derived from metadata using TypeScript mapped types, ensuring type safety between metadata definitions and runtime values. The system uses discriminated unions based on `fieldType` to enforce correct value types.

### PPT Generation Flow

**Process:**
1. User inputs primary lyrics (required) and optional secondary lyrics
2. User configures settings across multiple categories
3. On generate, `create-slides-from-lyrics-v2.ts` processes lyrics:
   - Classifies lines (cover, section headers, normal content, metadata)
   - Builds configuration from settings using `PptConfigurationBuilder`
   - Creates slides using pptxgenjs with configured styles
   - Maps lines to slides via `LineToSlideMapper`
4. Generated PPTX file is downloaded

**Key Files:**
- `lib/utils/ppt-generator/create-slides-from-lyrics-v2.ts` - Main generation logic
- `lib/utils/ppt-generator/ppt-configuration-builder.ts` - Transforms settings into pptxgenjs configs
- `lib/utils/ppt-generator/line-to-slide-mapper.ts` - Tracks line-to-slide relationships
- `lib/utils/ppt-generator/processing-context.ts` - Maintains state during generation

### Lyrics Processing

Lines are classified into types:
- **MAIN_SECTION** - Section headers starting with `#`
- **SUB_SECTION** - Subsection headers
- **COVER** - Cover slide indicators
- **EMPTY_SLIDE** - Creates blank slide
- **FILL_SLIDE** - Fills remaining textboxes
- **NORMAL** - Regular lyric lines
- **METADATA** - Metadata lines (not rendered)

The system supports Chinese characters with automatic pinyin generation (using `pinyin-pro` library) and OpenCC for traditional/simplified Chinese conversion.

## Working with Settings

When adding or modifying settings:

1. Define metadata in `lib/constant/ppt-generator.ts` in the appropriate `PPT_GENERATION_*_SETTINGS` object
2. Specify `fieldType` which determines the TypeScript type automatically
3. Types will be inferred in `PptSettingsStateType` via mapped types
4. Add corresponding UI component in `components/ppt-generator/settings/`
5. Handle the setting in `ppt-configuration-builder.ts` if it affects PPT generation

**Field Types:** `TEXT`, `BOOLEAN`, `NUMBER`, `PERCENTAGE`, `IMAGE`, `COLOR`, `FONT`, `HORIZONTAL_ALIGN`, `SHADOW_TYPE`, `TRANSITION`

## Testing

- Tests are in `__tests__/` directory
- Jest is configured with Next.js integration via `next/jest`
- Uses `@testing-library/react` for component testing
- Test files should be `*.test.ts` or `*.test.tsx`

**Known Issue:** When using yarn, Jest may encounter ESM module issues with `wrap-ansi` and `string-width`. The project uses npm to avoid this issue (see README Troubleshooting section).

## Static Export Configuration

The app is configured for static export (`output: "export"` in `next.config.mjs`). This means:
- No server-side runtime features (API routes, ISR, SSR)
- All generation happens client-side
- Images are unoptimized (`images: { unoptimized: true }`)
- Build outputs to `out/` directory

## Code Patterns

**Settings Access Pattern:**
```typescript
// Get typed settings value
const value = settingsValues[SETTING_CATEGORY.GENERAL]?.someSettingKey;

// Access section-specific settings
const sectionKey = `${SECTION_PREFIX}${sectionNumber}` as SectionSettingsKeyType;
const sectionValue = settingsValues[SETTING_CATEGORY.SECTION]?.[sectionKey]?.general?.someSetting;
```

**Context Usage:**
```typescript
// In components, use hooks to access contexts
const { mainText, setMainText, form, settingsValues } = usePptGeneratorFormContext();
const { lineMapper } = useLineToSlideMapperContext();
```

**Component Location:**
- Generic reusable components → `components/ui/`
- PPT generator-specific components → `components/ppt-generator/`
- Context providers → `components/context/`

## Import Patterns & Circular Dependency Prevention

**IMPORTANT:** This codebase does NOT use barrel files (index.ts) in `lib/utils/`. All imports must be from specific files to prevent circular dependency issues.

### Import Rules

1. **Always import from specific files, never from directory paths:**
   ```typescript
   // ✅ Correct
   import { cn, deepMerge } from "@/lib/utils/general";
   import { generatePpt } from "@/lib/utils/ppt-generator/ppt-generation";
   import { generatePptSettingsInitialState } from "@/lib/utils/ppt-generator/settings-generator";
   
   // ❌ Wrong - barrel imports are NOT available
   import { cn } from "@/lib/utils";
   import { generatePpt } from "@/lib/utils/ppt-generator";
   ```

2. **Files in `lib/constant/` should NEVER import from `lib/utils/` directory path**
   - Import directly: `../utils/general`, `../utils/ppt-generator/specific-file`

3. **Files in `lib/types/` should NEVER import from `lib/utils/` or `lib/schemas/`**
   - Types should be self-contained or only depend on constants

### Safe Import Hierarchy

```
lib/constant/  →  can import from: lib/types/, lib/utils/general.ts (specific file only)
lib/types/     →  can import from: lib/constant/
lib/schemas/   →  can import from: lib/constant/, lib/types/
lib/utils/     →  can import from: lib/constant/, lib/types/, lib/schemas/, other specific util files
lib/hooks/     →  can import from: anything in lib/
lib/presets/   →  can import from: anything in lib/
```

### Utility File Locations

- `lib/utils/general.ts` - General utilities (cn, deepMerge, deepCopy, etc.)
- `lib/utils/ppt-generator/ppt-generation.ts` - PPT generation (generatePpt, createPptInstance)
- `lib/utils/ppt-generator/ppt-preview.ts` - Preview generation (generatePreviewConfig)
- `lib/utils/ppt-generator/settings-generator.ts` - Settings generation (generatePptSettingsInitialState, getPreset, etc.)
- `lib/utils/ppt-generator/settings-diff.ts` - Settings comparison and merging
- `lib/utils/ppt-generator/settings-utils.ts` - Settings utilities (parsePptFilename, getBase64FromImageField)
- `lib/utils/ppt-generator/import-export-settings.ts` - Settings import/export (exportFullSettings, generateFullSettings)
- `lib/utils/ppt-generator/lyrics-overwrite.ts` - Lyrics overwrite parsing

### Debugging Circular Dependencies

If you see errors like `Cannot access 'X' before initialization`:
1. Trace the import chain from the error stack
2. Check if any module is importing from a directory path instead of a specific file
3. Replace with direct file imports
