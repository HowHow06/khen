# Findings & Decisions

## Requirements
- Create a CLI version of Khen's PPT generator, either by continuing existing work or starting over.
- CLI is primarily for AI agents replicating the current web workflow.
- Current human workflow: paste formatted main lyrics, auto-generate secondary pinyin lyrics, apply presets globally or per song section, inspect preview/validation, adjust lyrics, generate PPT, repeat for onsite and online presets.
- CLI should let agents validate lyric formatting and detect likely wrapped/too-long lines before generating the final PPT.
- A preview grid image is a candidate output so an AI agent can visually inspect malformed slides/lyrics.
- Planning only in this turn: investigate, gather specs, and write planning files under `.planning/cli-redo`.
- New acceptance criterion from user: verification input `.planning/cli-redo/verification/test-input.txt` should generate the same PPTX as `.planning/cli-redo/verification/20240101 PNW.pptx` when the default/global preset is `Default Onsite Chinese` and the second song section overrides to `Default Onsite English`.

## Research Findings
- Repository already contains an incomplete/previous CLI track:
  - `scripts/generate-ppt-from-lyrics.ts`
  - `scripts/preview-image-generator.ts`
  - `scripts/presets/*.json`
  - `scripts/samples/*`
  - `docs/CLI_PPT_GENERATOR_GUIDE.md`
  - `scripts/AGENTS.md`
- `package.json` includes `tsx`, `playwright`, and `pptxgenjs`, so a Node/TypeScript CLI can run without adding a new runtime dependency in the first iteration.
- Existing web-side reusable modules found:
  - `lib/utils/ppt-generator/ppt-generation.ts`
  - `lib/utils/ppt-generator/ppt-preview.ts`
  - `lib/utils/ppt-generator/create-slides-from-lyrics-v2.ts`
  - `lib/utils/ppt-generator/line-to-slide-mapper.ts`
  - `lib/utils/ppt-generator/lyric-validation.ts`
  - `lib/utils/ppt-generator/settings-generator.ts`
  - `lib/utils/ppt-generator/settings-diff.ts`
- Existing overflow detection appears browser/DOM-oriented:
  - `components/ppt-generator/HiddenOverflowDetector.tsx`
  - `lib/hooks/use-text-overflow-detection.ts`
  - textarea line highlighting in `MainLyricSection.tsx` and `SecondaryLyricSection.tsx`.
- `scripts/AGENTS.md` documents the current CLI as standalone via `npx tsx` and says dynamic imports are intentional to avoid circular dependency errors.
- `scripts/generate-ppt-from-lyrics.ts` currently supports:
  - `--main`, `--secondary`, `--auto-pinyin`, `--config`, `--output`, `--filename`, `--preview`, `--help`
  - JSON settings loading
  - inline settings default generation
  - inline overwrite merging through `mergeOverwritesFromLyrics`
  - PPT writing via `createPptInstance`
  - preview PNG generation via `generatePreviewConfig` + `generatePreviewImage`
- Existing CLI gaps relative to the requested AI-agent workflow:
  - No structured `validate` or `analyze` command.
  - `--preview` generates a visual grid, but does not emit machine-readable slide/line mappings or overflow warnings.
  - Preview generation does not pass a `LineToSlideMapper`, so it cannot currently report line-to-slide relationships from the CLI.
  - No CLI equivalent of `useTextOverflowDetection`; the only overflow detector is a React hook using an off-screen DOM element.
  - No first-class multi-output workflow for generating both Onsite and Online/Live variants from the same lyric file.
- `lib/hooks/use-text-overflow-detection.ts` algorithm:
  - Generate `InternalPresentation`.
  - For each slide, get normal lyric mappings from `LineToSlideMapper`.
  - Render each text part in a hidden DOM element with matching width/font settings.
  - Compare wrapped height to single-line height.
  - Match wrapped text back to main/secondary lyric lines and produce `LyricWarning` entries.
- `lib/utils/ppt-generator/line-to-slide-mapper.ts` already stores 0-based lyric line numbers mapped to 1-based slide indices with line types; this should be reused for CLI reports.
- `lib/utils/ppt-generator/lyric-validation.ts` is currently only a syntax/basic summary helper. It checks unclosed braces and estimates counts, but does not detect semantic issues like section mismatch or text overflow.
- Existing CLI/user docs describe four preset config files:
  - `onsite-chinese.json`: black background, Mandarin + pinyin, 2 textboxes per slide.
  - `onsite-english.json`: black background, ignores secondary content, 1 textbox per slide, 2 lines per textbox.
  - `live-chinese.json`: green screen/live overlay, Mandarin + pinyin, bottom placement, `(live)` filename suffix.
  - `live-english.json`: green screen/live overlay, ignores secondary content.
- Web preset source is `lib/presets/ppt-generator.ts`; script preset JSON mirrors these values. A redo should avoid letting script JSON silently drift from web presets.
- The app's auto-pinyin default lives in `PptSettingsUIContext` as `isAutoGeneratePinyinEnabled: true` and `pinyinType: WITHOUT_TONE`.
- Generation submit warns only when main and secondary line counts differ and subcontent is not ignored globally. CLI should make this a structured warning/error instead of an interactive confirmation.
- Section-specific settings are represented as JSON overwrite lines:
  - Optional global overwrite before the first `----`.
  - Section overwrite immediately after a `----` line.
  - `parseAllOverwritesFromLyrics` maps the nth `----` section to `sectionN`.
  - `mergeOverwritesFromLyrics` can apply `general.presetChosen` globally or per section.
- This supports the requested mixed-language workflow if lyrics include per-section preset overrides such as using `onsiteEnglishPreset`/`liveEnglishPreset` for English sections while the global preset remains Chinese.
- `createPptInstance` is the central reusable generation seam:
  - It merges background settings, defines master slides, calls `createSlidesFromLyricsRefactored`, and returns the `pptxgenjs` presentation plus `sectionsInfo` and split lyric arrays.
  - It already accepts an optional `LineToSlideMapper`.
- `createSlidesFromLyricsRefactored` does the true slide allocation:
  - Classifies `----`, `---`, `#`, `***`, `**`, metadata, and normal lines.
  - Calculates slide positions based on section settings (`lineCountPerTextbox * textboxCountPerContentPerSlide`).
  - Groups additional normal lines into a textbox when `lineCountPerTextbox > 1`.
  - Records skipped/grouped lines through `LineToSlideMapper.addSkippedLines`.
- Current Node/browser compatibility risk:
  - `getBase64FromImageField` relies on `fetch` and `FileReader` via `getBlobFromUrl`/`getBase64`.
  - Onsite black-background decks avoid the issue because background image is null.
  - Live/online presets use `/images/background/greenScreenWithBlackCover_v2.png`; Node-safe file path/data URL resolution should be added for accurate CLI live output.
- Current CLI smoke test:
  - `npx tsx ... --help` works outside the sandbox.
  - Sample onsite Chinese PPT generation works outside the sandbox.
  - Sample onsite Chinese preview PNG generation works outside the sandbox and uses Playwright successfully.
  - The sandbox blocks `tsx` IPC pipe creation with `listen EPERM`; this is an environment limitation, not necessarily an app bug.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Planning files are the only intended modifications in this session | Keeps faith with "dont modify yet" while still producing requested plan artifacts |
| Treat the new verification PPTX as a golden fixture | User explicitly expects the generated PPTX to match the provided reference deck in bytes and look |
| Note deterministic PPTX generation as a requirement/risk | Byte-for-byte PPTX equality can fail due to timestamps, generated relationship IDs, or zip metadata even when slides look identical |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| `python -m markitdown` unavailable in bundled Python | Parsed PPTX directly via zip/XML instead |
| Local render tools for PPTX thumbnails unavailable (`soffice`, `libreoffice`, `pdftoppm`) | Did not produce thumbnails; captured text/style/layout observations from OOXML |

## Resources
- Planning directory: `/Users/holim/Workspaces/my-repo/khen/.planning/cli-redo`
- Sample PPTX: `/Users/holim/Downloads/20240101 PNW.pptx`
- Existing CLI guide: `/Users/holim/Workspaces/my-repo/khen/docs/CLI_PPT_GENERATOR_GUIDE.md`
- Existing CLI script: `/Users/holim/Workspaces/my-repo/khen/scripts/generate-ppt-from-lyrics.ts`
- Existing CLI preview renderer: `/Users/holim/Workspaces/my-repo/khen/scripts/preview-image-generator.ts`
- Golden verification input: `/Users/holim/Workspaces/my-repo/khen/.planning/cli-redo/verification/test-input.txt`
- Golden verification PPTX: `/Users/holim/Workspaces/my-repo/khen/.planning/cli-redo/verification/20240101 PNW.pptx`
- Golden verification PPTX SHA-256: `2b0f4990dd88765b40d7fe30b4c050d69530217e6b1df1d0c34b4e5a11221501`

## Visual/Browser Findings
- Sample PPTX `/Users/holim/Downloads/20240101 PNW.pptx` observations from OOXML:
  - 19 slides, standard 16:9 dimensions (`9144000 x 5143500` EMU, equivalent to 10 x 5.625 inches in Khen's layout model).
  - Slides 1 and 10 are cover/title slides.
  - Slides 9 and 19 are blank separator/end slides.
  - Chinese song slides use black background, centered white bold text, Microsoft YaHei for Mandarin, Ebrima for pinyin.
  - Chinese content slides place two Mandarin lyric lines per slide; each Mandarin line is followed by its pinyin line.
  - Chinese content text sizes observed: Mandarin 60 pt, pinyin 31 pt.
  - Chinese cover observed: title 80 pt Microsoft YaHei, subtitle 48 pt Ebrima.
  - English section ignores secondary lyrics and groups two English lines per slide in one textbox with paragraph breaks.
  - English content text size observed: 44 pt Ebrima; English cover observed as 72 pt Segoe Print.
  - All observed text boxes span full slide width (`x=0`, width full slide) with centered text.
- Generated CLI preview image `/private/tmp/khen-cli-redo/sample-onsite-preview.png` observations:
  - PNG dimensions: 2100 x 2110.
  - Shows `Khen PPT Preview` header, slide count, section headers, per-section slide-count badges, slide thumbnails, and slide-number badges.
  - Slides are readable enough for visual inspection at high detail.
  - No overflow/wrap warning overlay is rendered.
  - No machine-readable report accompanies the PNG.

---
*Update this file after every 2 view/browser/search operations.*
