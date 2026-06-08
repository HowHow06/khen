# Khen PPT Generator CLI Redo Spec

## Summary
Continue the existing CLI work rather than starting from scratch. The current CLI already proves that Node/TypeScript can reuse Khen's PPT generation and preview pipeline. The redo should turn it into an AI-agent-friendly workflow tool with structured validation, preview grid generation, line-to-slide mappings, overflow warnings, and repeatable onsite/live generation.

## Primary User
AI agents preparing worship PPTs from formatted lyric text.

The agent should be able to:
- Read or generate formatted lyric text.
- Auto-generate pinyin for Mandarin songs.
- Apply a global preset.
- Override one or more song sections with another preset.
- Generate a preview grid and machine-readable report.
- Use overflow and line warnings to edit lyrics before creating final PPTX files.
- Generate both onsite and live/online variants from the same source.

## Existing State
Current files:
- `scripts/generate-ppt-from-lyrics.ts`: current CLI entry point.
- `scripts/preview-image-generator.ts`: Playwright preview grid image renderer.
- `scripts/presets/*.json`: script preset configs.
- `docs/CLI_PPT_GENERATOR_GUIDE.md`: current CLI docs.
- `lib/utils/ppt-generator/ppt-generation.ts`: creates PPTX instances and generated files.
- `lib/utils/ppt-generator/ppt-preview.ts`: creates `InternalPresentation` preview configs.
- `lib/utils/ppt-generator/line-to-slide-mapper.ts`: maps lyric line numbers to slide indices.
- `lib/hooks/use-text-overflow-detection.ts`: browser-only overflow detection algorithm to port.

Decision: keep the existing CLI path, but refactor workflow logic into reusable CLI modules instead of expanding the monolithic script further.

## Proposed Commands

### `khen-ppt analyze`
Generate secondary lyrics if needed, merge settings/overwrites, create preview config, line mappings, warnings, and optional preview image. Does not write a PPTX by default.

```bash
npx tsx scripts/khen-ppt.ts analyze \
  --main lyrics.txt \
  --preset onsite-chinese \
  --auto-pinyin \
  --preview-grid out/preview-onsite.png \
  --report out/report-onsite.json
```

Behavior:
- Exit `0` when there are no errors.
- Exit non-zero when syntax/settings errors are present.
- Optional `--fail-on-warning` exits non-zero when overflow warnings exist.

### `khen-ppt generate`
Generate final PPTX after the same analysis pipeline.

```bash
npx tsx scripts/khen-ppt.ts generate \
  --main lyrics.txt \
  --preset onsite-chinese \
  --auto-pinyin \
  --output out \
  --filename "20240101 PNW"
```

### `khen-ppt batch`
Generate multiple variants from one lyric file.

```bash
npx tsx scripts/khen-ppt.ts batch \
  --main lyrics.txt \
  --auto-pinyin \
  --variant onsite=onsite-chinese \
  --variant live=live-chinese \
  --output out \
  --filename "20240101 PNW"
```

Each variant should be able to emit:
- PPTX
- preview PNG
- report JSON

### `khen-ppt presets`
List preset names, display names, and whether secondary content is ignored.

## Preset Names
Support friendly aliases:
- `onsite-chinese` -> `onsiteChinesePreset`
- `onsite-english` -> `onsiteEnglishPreset`
- `live-chinese` -> `liveChinesePreset`
- `live-english` -> `liveEnglishPreset`
- `online-chinese` -> `liveChinesePreset` alias, pending naming confirmation
- `online-english` -> `liveEnglishPreset` alias, pending naming confirmation

Prefer deriving CLI presets from `lib/presets/ppt-generator.ts` instead of maintaining duplicate JSON snapshots. If JSON presets remain, add a test that catches drift from source presets.

## Section Overrides
Use existing lyric overwrite syntax as the canonical input format.

Example mixed Mandarin/English source:
```text
{"general":{"presetChosen":"onsiteChinesePreset","useDifferentSettingForEachSection":true}}
---- 奇异恩典
{"general":{"presetChosen":"onsiteChinesePreset"}}
# 奇异恩典 ## Amazing Grace
--- Verse 1
奇异恩典 何等甘甜
我罪已得赦免
***
---- What a friend we have in Jesus
{"general":{"presetChosen":"onsiteEnglishPreset"}}
# What a friend we have in Jesus
--- 1
What a friend we have in Jesus
all our sins and griefs to bear
```

Optional CLI conveniences can be added later:
- `--section-preset 2=onsite-english`
- `--section-preset "What a friend we have in Jesus=onsite-english"`
- `--write-overwrites normalized-lyrics.txt`

These should compile to the existing JSON overwrite format.

## Report JSON Shape
The report should be the main AI-agent interface.

```json
{
  "version": 1,
  "input": {
    "main": "lyrics.txt",
    "secondary": null,
    "autoPinyin": true,
    "preset": "onsite-chinese"
  },
  "summary": {
    "mainLineCount": 20,
    "secondaryLineCount": 20,
    "songCount": 2,
    "slideCount": 19,
    "hasCover": true
  },
  "outputs": {
    "pptx": "out/20240101 PNW.pptx",
    "previewGrid": "out/preview-onsite.png"
  },
  "sections": [
    {
      "index": 1,
      "name": "奇异恩典",
      "preset": "onsiteChinesePreset",
      "startLine": 1,
      "endLine": 19,
      "slideIndices": [1, 2, 3]
    }
  ],
  "lineMappings": [
    {
      "lineNumber": 4,
      "slideIndex": 2,
      "lineType": "normal",
      "sectionName": "1. 第一节"
    }
  ],
  "warnings": [
    {
      "type": "warning",
      "code": "TEXT_WRAP",
      "lineNumber": 12,
      "contentType": "main",
      "slideIndex": 7,
      "text": "从日出之地 到日落之处",
      "message": "Line 12 may wrap on slide 7"
    }
  ],
  "errors": []
}
```

## Validation Requirements
Reuse and extend `validateLyrics`.

Required checks:
- Invalid or unclosed JSON overwrite blocks.
- Main/secondary line count mismatch when effective settings do not ignore secondary content.
- Unknown preset names in global or section overwrite JSON.
- Missing section settings when `useDifferentSettingForEachSection` is enabled.
- Text overflow/wrap warnings from the generated preview config.
- Optional: empty sections, cover syntax without subtitle, suspicious `---` vs `----` typos.

Validation should run after settings/overwrites are merged so section-specific `ignoreSubcontent` is respected.

## Overflow Detection Design
Port `useTextOverflowDetection` into a CLI-safe module.

New utility candidate:
- `lib/utils/ppt-generator/text-overflow-detection.ts`

API:
```ts
detectTextOverflow({
  previewConfig,
  lineMapper,
  mainLines,
  secondaryLines,
  measurementSlideWidth?: number
}): Promise<{
  warnings: LyricWarning[];
  overflowSlideIndices: Set<number>;
}>
```

Implementation:
- Use Playwright page evaluation or a headless DOM renderer.
- Reuse the same font CSS embedding from `scripts/preview-image-generator.ts`.
- Measure each text part with the same width/font/spacing logic as the preview renderer.
- Compare multiline vs nowrap heights.
- Match wrapped text back to line mappings and include slide index.

The same function can later replace the React hook implementation, or the hook can wrap this utility.

## Preview Grid Requirements
Enhance `scripts/preview-image-generator.ts` or move it into a reusable CLI module.

Required:
- Preserve readable section-grouped grid.
- Accept `overflowSlideIndices` and warning metadata.
- Add a visible warning outline/badge on slides with overflow.
- Optionally print line numbers under affected slides.
- Emit stable dimensions enough for multimodal agents to inspect.

Nice-to-have:
- `--preview-grid-columns 2|3|4`
- `--preview-slide-width 480`
- `--preview-format png|html`

## Node-Safe Asset Handling
Fix browser assumptions for CLI:
- Replace `FileReader` usage for Node paths with `fs.readFile` plus base64 data URLs.
- Resolve public paths like `/images/background/greenScreenWithBlackCover_v2.png` relative to project `public/`.
- Preserve browser behavior for web app uploads/URLs.

This matters most for live/online presets.

## Suggested File Structure
Keep `scripts/generate-ppt-from-lyrics.ts` as a compatibility wrapper initially, but move real logic into modules.

Candidate files:
- `scripts/khen-ppt.ts`: new subcommand entry point.
- `scripts/cli/args.ts`: argument parsing and help text.
- `scripts/cli/settings.ts`: preset/config loading and default settings.
- `scripts/cli/workflow.ts`: shared analyze/generate/batch pipeline.
- `scripts/cli/report.ts`: JSON report construction.
- `scripts/cli/presets.ts`: preset alias mapping.
- `lib/utils/ppt-generator/text-overflow-detection.ts`: shared overflow detection utility.
- `lib/utils/ppt-generator/node-assets.ts`: Node-safe image/font asset helpers, if not kept under scripts.

## Implementation Plan

### Phase 1: Stabilize Existing CLI
- Confirm `generate-ppt-from-lyrics.ts` remains functional.
- Add output directory creation.
- Pass `LineToSlideMapper` into preview generation.
- Emit basic report JSON with summary and mappings.
- Add smoke tests around sample lyrics.

### Phase 2: Structured Analyze Mode
- Add subcommand parser.
- Implement `analyze` as the core pipeline.
- Return syntax/settings warnings and line-count warnings.
- Add `--report`, `--json`, `--fail-on-warning`.

### Phase 3: CLI Overflow Detection
- Extract/port the DOM measurement algorithm.
- Use Playwright to measure text in Node.
- Add overflow warnings and slide indices to the report.
- Add preview warning overlays.

### Phase 4: Batch Variants
- Implement `batch` variants for onsite/live outputs.
- Support variant-specific reports and previews.
- Add preset alias mapping and optional section-preset helper.

### Phase 5: Node-Safe Assets and Docs
- Fix public image path handling for live presets.
- Update CLI docs and `scripts/AGENTS.md`.
- Add acceptance tests for onsite Chinese, onsite English, mixed Chinese/English, live Chinese, and long-line overflow.

### Phase 6: Golden Verification Fixture
- Add a deterministic fixture test using `.planning/cli-redo/verification/test-input.txt`.
- Generate with global preset `Default Onsite Chinese` and a section-specific override for the second song to `Default Onsite English`.
- Compare the output against `.planning/cli-redo/verification/20240101 PNW.pptx`.
- Prefer byte-for-byte equality once the generator can produce deterministic PPTX output; until then, compare normalized PPTX structure and rendered slide images.

## Acceptance Criteria
- A single command can analyze lyrics and emit a JSON report with slide count, section info, line mappings, and warnings.
- A long lyric line produces a `TEXT_WRAP` warning with line number, content type, slide index, and source text.
- Preview PNG highlights slides with overflow warnings.
- Mixed Mandarin/English sections can use Chinese global preset plus English section override.
- Preset control supports both:
  - applying one preset to all songs, and
  - overriding the preset for a specific song section.
- Golden fixture verification passes:
  - input: `.planning/cli-redo/verification/test-input.txt`
  - global/default preset for all songs: `Default Onsite Chinese` (`onsiteChinesePreset`)
  - second song override: `Default Onsite English` (`onsiteEnglishPreset`)
  - expected PPTX: `.planning/cli-redo/verification/20240101 PNW.pptx`
  - expected SHA-256 for the current reference PPTX: `2b0f4990dd88765b40d7fe30b4c050d69530217e6b1df1d0c34b4e5a11221501`
  - primary pass condition: generated PPTX is byte-for-byte identical to the expected PPTX.
  - fallback diagnostic condition, only while determinism is being implemented: generated PPTX has equivalent normalized OOXML structure and rendered slide images match visually.
- Batch command can generate onsite and live/online variants from the same lyric file.
- Existing CLI usage either remains supported or has a documented migration wrapper.
- No generation logic is duplicated in a way that can drift from the web app.

## Open Questions
- Should user-facing naming be `live` or `online`, or should both be aliases?
- Should AI agents edit inline overwrite JSON directly, or should CLI provide `--section-preset` helpers as the preferred interface?
- Should `analyze` default to generating a preview PNG, or should preview generation be explicit because it is slower?
- Should `TEXT_WRAP` be a warning only, or should CLI support strict mode where it becomes an error?
- Should line numbers in reports be 1-based only? Recommendation: yes for user/agent output, while preserving 0-based internally.
- Can PPTX generation be made deterministic enough for byte-for-byte golden comparison, including metadata timestamps, generated IDs, relationship ordering, and zip entry metadata?
