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

| Decision                                                           | Rationale                                                                                                                           |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Planning files are the only intended modifications in this session | Keeps faith with "dont modify yet" while still producing requested plan artifacts                                                   |
| Treat the new verification PPTX as a golden fixture                | User explicitly expects the generated PPTX to match the provided reference deck in bytes and look                                   |
| Note deterministic PPTX generation as a requirement/risk           | Byte-for-byte PPTX equality can fail due to timestamps, generated relationship IDs, or zip metadata even when slides look identical |

## Issues Encountered

| Issue                                                                                     | Resolution                                                                     |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `python -m markitdown` unavailable in bundled Python                                      | Parsed PPTX directly via zip/XML instead                                       |
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

## 2026-06-08 Overflow Regression Finding

- User-created `.planning/cli-redo/verification/test-error.txt` intentionally combines the Mandarin line `奇异恩典 何等甘甜 我罪已得赦免 前我失丧 今被寻回`.
- The current CLI report at `tmp/khen-cli-redo/analyze-report.json` has zero warnings/errors for that input, even though the web UI should flag the line as wrapping.
- This confirms Phase 3/CLI overflow detection from `spec.md` remains unimplemented after the first CLI slice.
- The desired warning should use `code: "TEXT_WRAP"` and include the source line number, content type, slide index, and source text so an AI agent can edit the lyrics without relying only on preview pixels.

## 2026-06-08 Follow-Up Scope

- User wants lint fixed now, batch tests added now, and docs updated with lyric repair guidance.
- User clarified overflow detection should report all wrapped text, including cover text. The report should not decide whether the wrap is unacceptable; users/agents can add manual `\n` breaks or leave the text if it looks visually acceptable.
- Normalized PPTX comparison remains useful but is not current priority. Keep it documented as a TODO rather than implementing now.
- Current `.eslintrc.json` is legacy config while the project uses ESLint 9 and Next 16. The existing `npm run lint` script uses `next lint`, which fails before linting.

## 2026-06-08 CLI Smoke Test Finding

- Jest workflow tests intentionally inject a fake overflow detector because sandboxed test runs cannot reliably launch Chromium.
- This means Jest verifies report plumbing and fixture expectations, but does not prove the real CLI command, `tsx` runner, Playwright text measurement, preview PNG generation, or PPTX file writing all work together.
- A separate `npm run test:cli` script should shell out to `npx tsx scripts/khen-ppt.ts` so it behaves like an AI agent using the tool from the terminal.
- The smoke test should keep stdout quiet for commands using `--report`, then read the report JSON files to assert `TEXT_WRAP` warnings, preview outputs, and batch PPTX outputs.

## 2026-06-15 Per-Slide Override Planning

- User wants a rare but real case: a mostly Mandarin song with one slide containing one or two English lyric lines. Section-level preset override is too broad because it changes the whole song.
- Current inline JSON overwrite support is global/section-scoped only:
  - Global overwrite: JSON line before the first `----`.
  - Section overwrite: JSON line immediately after a `----` section marker.
  - `mergeOverwritesFromLyrics` applies those via `parseAllOverwritesFromLyrics`.
  - `removeAllOverwritesFromLyrics` strips only those global/section overwrite positions.
- A raw JSON line in the middle of lyrics currently does not have slide-level meaning. In the shared slide generator, it is not classified as metadata or an override directive, so it risks being treated like normal lyric content unless preprocessed elsewhere.
- Slide allocation is not one-line-per-slide:
  - `DerivedPptConfig.totalLineCountPerSlide = linePerTextbox * textboxCountPerSlide`.
  - `processContentLine` may collect additional normal lines into the same textbox with `collectAdditionalLines`.
  - Therefore the directive should target the "next generated slide" rather than a single following source line.
- Recommended syntax:
  - Use an explicit reserved scope such as `{"$scope":"slide", ...}` or `{"slide":{...}}`.
  - Place it immediately before the first lyric line that should use the override.
  - The directive is consumed and should not render.
  - It applies to exactly the next generated content slide, then clears.
- Recommended semantics:
  - If the directive appears at a slide boundary, it applies to the next content slide without creating a blank slide.
  - If it appears in the middle of a partially filled slide, it should force the next lyric line onto a new slide, equivalent to a non-rendered `**` plus override.
  - It should support enough fields to solve the Mandarin-song-with-English-slide case: ignore secondary content, line count per textbox, textbox count per slide, main font, font size, alignment, and textbox positions.
  - A preset shortcut is useful but optional for MVP. Without a preset shortcut, the same effect can be expressed with `general.ignoreSubcontent`, `general.lineCountPerTextbox`, `general.textboxCountPerContentPerSlide`, and `content.main.text`.
- Suggested example:

```text
讓我們一同齊聲讚美
名叫平安的君王
耶穌降生在世上
一切再也不一樣
{"$scope":"slide","general":{"ignoreSubcontent":true,"lineCountPerTextbox":2,"textboxCountPerContentPerSlide":1},"content":{"main":{"text":{"font":"Ebrima","fontSize":44}}}}
So we say
"Merry Christmas" Today
```

- Web UI impact:
  - If implemented in `lib/utils/ppt-generator/create-slides-from-lyrics-v2.ts`, the web preview and web PPT generation will also support it automatically because they share the same generator.
  - That is probably desirable; otherwise CLI output and web output would diverge.
  - Web textareas/settings UI will not need new controls for MVP, but web validation/sync helpers should be updated so the directive is recognized, not rendered, not stripped accidentally, and not reported as an invalid inline override.
  - The web "sync overwrites" feature currently focuses on global/section overwrites; it should preserve slide directives rather than trying to import them as persistent form settings.

## 2026-06-15 Per-Slide Override Deep Implementation Design

### Recommended Syntax and Semantics

- Canonical directive:

```text
{"$scope":"slide","preset":"onsiteEnglishPreset"}
```

- Canonical explicit-settings variant:

```text
{"$scope":"slide","general":{"ignoreSubcontent":true,"lineCountPerTextbox":2,"textboxCountPerContentPerSlide":1},"content":{"main":{"text":{"font":"Ebrima","fontSize":44}}}}
```

- Placement: immediately before the first lyric line that should use the override.
- Lifetime: applies to exactly the next generated content slide, then clears.
- Boundary behavior:
  - If inserted at a natural slide boundary, it should not create a blank slide.
  - If inserted after previous lyric lines already occupy a partial slide, it should force the next lyric line onto a new slide, equivalent to a non-rendered `**` plus a one-slide settings override.
- Scope:
  - It should affect content slides first. Cover-slide support can be allowed later, but the MVP should document that slide directives are intended for lyric/content slides.
  - It should not apply to section/subsection/metadata/empty-slide lines. If those appear between directive and content, keep the pending override until the next content slide or emit a validation warning if that proves too ambiguous.

### Implementation Shape

- Add a shared slide directive helper under `lib/utils/ppt-generator/`, for example `slide-overwrite.ts`.
  - `isSlideOverrideLine(line: string): boolean`
  - `parseSlideOverride(line: string): SlideOverride | null`
  - `applySlideOverrideToSectionSettings(base: SectionSettingsType, override: SlideOverride): SectionSettingsType`
  - `stripSlideOverrideLinesForReporting(lyrics: string): string` or equivalent report-only helper
- Suggested `SlideOverride` shape:

```ts
type SlideOverride = {
  $scope: "slide";
  preset?: string;
  general?: Partial<SectionSettingsType["general"]>;
  cover?: Partial<SectionSettingsType["cover"]>;
  content?: Partial<SectionSettingsType["content"]>;
};
```

- Preset shorthand should reuse the existing source preset system:
  - `getPreset(presetId)`
  - `combineWithDefaultSettings(preset)`
  - `generateSectionSettingsFromFullSettings(...)`
  - then deep-merge any explicit `general`/`cover`/`content` fields on top.
- Do not import CLI validator code into `lib/`. Keep shared parser/runtime behavior in `lib`, and keep CLI schema/report validation in `scripts/cli/inline-overrides.ts`.

### Generator Changes

- `lib/utils/ppt-generator/create-slides-from-lyrics-v2.ts`
  - Add `LineClassification.SLIDE_OVERRIDE`.
  - Classify `{"$scope":"slide",...}` before falling through to `NORMAL`.
  - Treat `SLIDE_OVERRIDE` as a special non-rendered line.
  - On a slide directive line:
    - parse and store pending override in `ProcessingContext`;
    - map it with a new `LineType.SLIDE_OVERRIDE`;
    - adjust weights:
      - at slide boundary: add `-1` like metadata, so it consumes no rendered line;
      - mid-slide: add `position.remainingLineCountBeforeInsert - 1`, so the next content line starts on a new slide.
  - Before calculating position for a normal/content line, resolve an effective section config:
    1. get current section setting;
    2. if a pending slide override exists and this line is content/cover, produce a one-slide section setting from it;
    3. build `DerivedPptConfig` from the overridden section setting;
    4. calculate slide position using that effective config.
  - Clear the pending override after `processContentLine` completes for the slide it affected.
- `lib/utils/ppt-generator/processing-context.ts`
  - Add pending slide override storage with `setPendingSlideOverride`, `getPendingSlideOverride`, `clearPendingSlideOverride`, and `hasPendingSlideOverride`.
- `lib/utils/ppt-generator/line-to-slide-mapper.ts`
  - Add `LineType.SLIDE_OVERRIDE = "slide_override"`.
- `lib/utils/ppt-generator/settings-utils.ts`
  - Update `getIsNormalLine` so slide directive lines are not considered normal and cannot be collected into a textbox by `collectAdditionalLines`.

### CLI Validation and Schema Changes

- `scripts/cli/inline-overrides.ts`
  - Extend `InlineOverrideLocation.scope` with `"slide"`.
  - In `locateInlineOverrides`, parse JSON-like lines enough to detect `"$scope":"slide"` in mid-lyric positions.
  - Existing random mid-lyric JSON must still emit `INLINE_OVERRIDE_LOCATION_INVALID`.
  - Validate slide override keys separately:
    - allow `$scope`;
    - allow `preset`;
    - allow `general`, `cover`, and `content` using section-setting metadata;
    - do not require `general.useMainSectionSettings:false` for slide overrides, because the runtime will apply the override directly to one effective section config.
  - Add a preset warning equivalent to current `presetChosen` warnings: `preset` must be an internal preset id, not display name or CLI alias.
  - Add `slideOverride` to `override-schema` output with examples.

### Report, Overflow, and Line Count Changes

- Current CLI `analyzeWorkflow` feeds `strippedPrimaryLyric = removeAllOverwritesFromLyrics(...)` to:
  - `getLyricsSummary`
  - line count summary
  - overflow detector `mainLines`
- `removeAllOverwritesFromLyrics` currently strips only global/section overwrites. That is good for generator input because slide directives must remain visible to the generator.
- For report and measurement clarity, add a render-control strip helper that removes both global/section overwrites and slide directives when computing:
  - rendered main/secondary line counts;
  - `getLyricsSummary`;
  - secondary line-count mismatch checks if secondary input does not include directive lines.
- Preserve generator line mappings against the actual generator input line numbers, because agents need warnings to point back to the original editable source file.
- CLI overflow detector should continue reporting only `LineType.NORMAL` and `LineType.COVER`; it should not report `SLIDE_OVERRIDE` lines.
- Web `HiddenOverflowDetector` currently passes raw `mainText.split("\n")`/`secondaryText.split("\n")` and filters mapper lines to `LineType.NORMAL`. That is okay if the generator maps real content lines to original source indices and marks the directive as `slide_override`.

### Web UI Impact

- Web preview and web PPT generation should support the feature automatically if the implementation is in shared generation code.
- `validateLyrics` and `getLyricsSummary` already treat any `{...}` as special, so slide directives will not count as content lines. They should still get a small update/comment to recognize scoped slide directives explicitly.
- Submit-time main/secondary line-count confirmation in `PptGeneratorFormContext` currently compares raw `.split("\n")` counts. If secondary lyrics are manually provided and do not include directive lines, this may show a false mismatch. Consider using the same render-control strip helper there.
- Sync-overwrite controls should continue syncing only global/section overwrites. They should preserve slide directives in the text because slide directives are generation instructions, not durable form settings.
- Auto-output-overwrite removal currently calls `removeAllOverwritesFromLyrics`; it should not remove slide directives unless the user explicitly asks to remove generation directives.

### Compatibility Safeguards

- Do not change `parseAllOverwritesFromLyrics` behavior for existing global and section inline JSON.
- Do not make arbitrary mid-lyric JSON valid; only `"$scope":"slide"` opts in.
- Do not make CLI aliases valid inside lyric JSON. Keep lyric JSON using internal preset ids for reproducibility.
- Do not strip slide directives before `createPptInstance`; the shared generator must see them.
- Do not add new web UI controls for MVP. The feature is text-directive driven.

### Test Matrix Before/After Implementation

- Unit tests:
  - `isSlideOverrideLine` only accepts valid JSON with `"$scope":"slide"`.
  - malformed slide directive emits `INLINE_OVERRIDE_JSON_INVALID`.
  - mid-lyric JSON without `"$scope":"slide"` still emits `INLINE_OVERRIDE_LOCATION_INVALID`.
  - slide directive with display-name preset emits `INLINE_OVERRIDE_PRESET_INVALID`.
  - slide directive with unknown setting key emits `INLINE_OVERRIDE_KEY_UNKNOWN`.
  - `override-schema` includes `slideOverride` and examples.
- Generator tests:
  - Mandarin section under Chinese preset, directive before two English lines with `preset:"onsiteEnglishPreset"`, generates those two English lines on one slide with no secondary text.
  - Directive placed mid-slide forces the next lyric to a new slide.
  - Directive line maps as `lineType:"slide_override"` and is never rendered as text.
  - Existing verification fixture with section preset override still reports 19 slides and zero warnings.
- CLI workflow tests:
  - `analyze` report includes `slide_override` line mapping.
  - `warnings[]` stays quiet for a valid slide directive.
  - line counts and summary count rendered lyric lines, not directive lines.
  - `TEXT_WRAP` detection still points to original source line numbers.
- Web-adjacent tests:
  - `validateLyrics` does not treat slide directive as content.
  - raw line-count mismatch behavior is adjusted or explicitly documented if manual secondary lyrics omit directive lines.
- Full checks:
  - `npm test -- --runInBand`
  - `npm run check`
  - `npm run test:cli` outside sandbox if `tsx`/Playwright hits `listen EPERM`.

## 2026-06-15 Per-Slide Override Implementation Findings

- Implemented canonical syntax: `{"$scope":"slide","preset":"onsiteEnglishPreset"}`.
- Runtime behavior:
  - directive is classified as `SLIDE_OVERRIDE`;
  - line mapper reports it as `lineType: "slide_override"`;
  - directive is not rendered;
  - if it appears mid-slide, it advances the section weight so the next content starts on a new slide;
  - pending override clears after the next generated content slide.
- Preset shorthand:
  - uses source presets through `getPreset`, `combineWithDefaultSettings`, and `generateSectionSettingsFromFullSettings`;
  - explicit `general`/`cover`/`content` fields merge on top of the preset-derived section settings;
  - per-slide override preserves the current section/main background selection to avoid requiring new one-off slide masters.
- Report behavior:
  - generator input keeps slide directive lines so mapper line numbers stay aligned with the editable source;
  - rendered `mainLineCount`, `secondaryLineCount`, and lyric summary strip slide directive lines separately;
  - overflow detection still receives generator-aligned lines and reports original source line numbers.
- CLI validation/schema:
  - random mid-lyric JSON still warns with `INLINE_OVERRIDE_LOCATION_INVALID`;
  - valid `"$scope":"slide"` JSON is validated as a slide override;
  - slide `preset` must be an internal preset ID, matching existing inline JSON behavior.
- Web behavior:
  - shared generation and preview paths now support slide directives automatically;
  - web submit-time main/secondary line-count confirmation strips global/section overwrites and slide directives before comparing counts.
- Test adjustments:
  - added `__tests__/slide-overrides.test.ts`;
  - extended CLI inline override and workflow tests;
  - updated the CLI smoke test to assert cover wrap by warning content instead of older fixed line/slide numbers because the current report's error fixture has 21 slides and the English cover wrap appears at line 26/slide 12.

---

_Update this file after every 2 view/browser/search operations._
