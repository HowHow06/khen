# CLI PPT Generator Guide

This guide explains how AI agents and humans should use the Khen PPT CLI to analyze lyrics, generate preview grids, and create PowerPoint files without opening the web app.

The current agent-facing entry point is:

```bash
npx tsx scripts/khen-ppt.ts <command> [options]
```

The older `scripts/generate-ppt-from-lyrics.ts` script is kept for compatibility, but new automation should use `scripts/khen-ppt.ts`.

## Prerequisites

- Node.js `>=20.9.0`
- Project dependencies installed with `npm install`
- Run commands from the repository root

Check the runtime:

```bash
node --version
npm install
```

If `npx tsx` fails with `listen EPERM` inside an agent sandbox, rerun with the sandbox permission needed for `tsx`. That error is the sandbox blocking the runner, not the PPT CLI failing.

## Commands

### `presets`

Lists preset IDs, display names, aliases, and whether the preset ignores secondary lyrics.

```bash
npx tsx scripts/khen-ppt.ts presets
```

Use this when an agent needs to resolve a human preset name such as `Default Onsite Chinese` or a short alias such as `onsite-chinese`.

### `analyze`

Builds the same slide model used for generation, writes an optional JSON report, and can render an optional preview grid image. It does not write a PPTX.

```bash
npx tsx scripts/khen-ppt.ts analyze \
  --main .planning/cli-redo/verification/test-input.txt \
  --preset "Default Onsite Chinese" \
  --section-preset "2=Default Onsite English" \
  --auto-pinyin \
  --preview-grid /private/tmp/khen-cli-redo/preview.png \
  --report /private/tmp/khen-cli-redo/analyze-report.json
```

Use this before generating when an agent needs to inspect slide count, section preset assignment, line mappings, warnings, or preview layout.

### `generate`

Creates a PPTX and can also write the same report and preview grid as `analyze`.

```bash
npx tsx scripts/khen-ppt.ts generate \
  --main .planning/cli-redo/verification/test-input.txt \
  --preset "Default Onsite Chinese" \
  --section-preset "2=Default Onsite English" \
  --auto-pinyin \
  --output /private/tmp/khen-cli-redo \
  --filename "20240101 PNW" \
  --report /private/tmp/khen-cli-redo/generate-report.json
```

Use this when the lyrics and presets are ready enough to create the final deck.

### `batch`

Generates multiple PPTX variants from the same lyrics. Each `--variant` is `name=preset`. The `name` becomes a suffix on the output filename and preview grid path.

```bash
npx tsx scripts/khen-ppt.ts batch \
  --main lyrics.txt \
  --auto-pinyin \
  --variant onsite=onsite-chinese \
  --variant live=live-chinese \
  --output /private/tmp/khen-cli-redo \
  --filename sunday-songs \
  --report /private/tmp/khen-cli-redo/batch-report.json
```

Use this for the normal Khen workflow of generating both onsite and online/live decks from the same lyrics.

## Options

| Option                | Applies To                     | What It Does                                                                                                   |
| --------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `--main`, `-m`        | `analyze`, `generate`, `batch` | Required path to the primary lyrics file.                                                                      |
| `--secondary`, `-s`   | `analyze`, `generate`, `batch` | Optional secondary lyrics file, usually pinyin or translation.                                                 |
| `--auto-pinyin`, `-y` | `analyze`, `generate`, `batch` | Generates secondary pinyin from the primary lyrics. Use for Mandarin songs when no secondary file is supplied. |
| `--preset`            | `analyze`, `generate`          | Applies one preset to the whole deck. Accepts display names, IDs, or aliases.                                  |
| `--section-preset`    | `analyze`, `generate`          | Overrides one song section. Format: `2=Default Onsite English` or `Song Name=onsite-english`. May be repeated. |
| `--variant`           | `batch`                        | Adds one generated variant. Format: `onsite=onsite-chinese`. May be repeated.                                  |
| `--config`, `-c`      | `analyze`, `generate`, `batch` | Merges a settings JSON file after the preset. Useful for exported web-app settings.                            |
| `--output`, `-o`      | `generate`, `batch`            | Output directory for PPTX files. Created automatically.                                                        |
| `--filename`, `-f`    | `generate`, `batch`            | Base filename without extension. Khen filename prefix/suffix settings still apply.                             |
| `--preview-grid`      | `analyze`, `generate`, `batch` | Writes a PNG contact-sheet preview of all generated slides.                                                    |
| `--report`            | `analyze`, `generate`, `batch` | Writes the JSON report to this file. Created parent directories automatically.                                 |
| `--json`              | all report commands            | Prints JSON to stdout only when `--report` is not set. When `--report` is set, stdout stays quiet.             |
| `--fail-on-warning`   | `analyze`, `generate`, `batch` | Exits with code `2` when warnings exist. Errors exit with code `1`.                                            |
| `--help`, `-h`        | all                            | Prints command help.                                                                                           |

## Presets

Run `presets` for the canonical list. Current built-in CLI presets:

| Display Name             | ID                    | Common Aliases                             | Secondary Lyrics |
| ------------------------ | --------------------- | ------------------------------------------ | ---------------- |
| `Default Onsite Chinese` | `onsiteChinesePreset` | `onsite-chinese`, `default-onsite-chinese` | Used for pinyin. |
| `Default Onsite English` | `onsiteEnglishPreset` | `onsite-english`, `default-onsite-english` | Ignored.         |
| `Default Live Chinese`   | `liveChinesePreset`   | `live-chinese`, `online-chinese`           | Used for pinyin. |
| `Default Live English`   | `liveEnglishPreset`   | `live-english`, `online-english`           | Ignored.         |

Preset names are case-insensitive and can be written with spaces or dashes.

## Section Preset Overrides

The primary use case is a mixed-language medley:

```bash
--preset "Default Onsite Chinese" \
--section-preset "2=Default Onsite English"
```

This means:

- Section 1 uses `Default Onsite Chinese`.
- Section 2 uses `Default Onsite English`.
- Section numbering is based on `----` song section markers in the main lyrics.
- English preset sections ignore secondary lyrics, so auto-generated pinyin does not render for that song.

You can also target by section name:

```bash
--section-preset "What a friend we have in Jesus=Default Onsite English"
```

When an override is applied, the CLI injects the same lyrics-overwrite JSON that the web app uses internally. Existing inline JSON overwrite lines after `----` are preserved and merged.

## Lyrics Format

The CLI uses the same syntax as the web PPT generator.

```text
---- 奇异恩典
# 奇异恩典 ## Amazing Grace
--- Verse 1
奇异恩典 何等甘甜
我罪已得赦免
***
---- What a friend we have in Jesus
# What a friend we have in Jesus
--- 1
What a friend we have in Jesus
all our sins and griefs to bear
***
```

Important markers:

| Marker                | Meaning                                                                     |
| --------------------- | --------------------------------------------------------------------------- |
| `---- Song Name`      | Starts a song section. Section preset overrides count these markers.        |
| `# Title ## Subtitle` | Creates a cover slide. The title and subtitle must be on the same line.     |
| `--- Verse`           | Starts a subsection such as verse, chorus, bridge, or ending.               |
| `**`                  | Starts a new slide.                                                         |
| `***`                 | Creates an empty slide.                                                     |
| `@key: value`         | Metadata line, not rendered.                                                |
| `{...}`               | JSON settings overwrite, usually immediately after a `----` section marker. |

For deeper lyric syntax details, see [PPT Generator User Guide](./PPT_GENERATOR_USER_GUIDE.md).

## How To Section New Lyrics

When formatting a brand-new song for the CLI, prefer this workflow:

1. Start each song with `---- 中文标题 English Title`.
2. Add the cover line as `# 中文标题 ## English Title`.
3. Add confirmed metadata lines immediately after the cover when available.
4. Split the song into musical sections using `--- Verse`, `--- Chorus`, `--- Bridge`, `--- Coda`, `--- Ending`, or numbered variants such as `--- Verse 2`.
5. Let the preset auto-split most lyric slides. Do not add `**` every two lines by default.
6. Only introduce manual line breaks when:
   - the meaning reads more naturally as two stacked lines on one slide, or
   - `analyze` / preview shows wrapping or visual imbalance.

### Practical segmentation rules

- Prefer section boundaries that match the actual song structure, not arbitrary fixed line counts.
- Within a section, keep adjacent lines together when they form one lyrical thought.
- For Mandarin onsite slides, a common good result is two short lyric lines per slide after auto-splitting.
- When one long lyric thought should stay on the same slide, split it into two physical lines instead of forcing a new slide.

Example:

```text
--- Verse
大山可以挪开
小山可以迁移
但主的慈爱
却永远不离开
尝尽祢的美善
深知与我同在
因主的慈爱
比生命更美好
```

In this example, `但主的慈爱 / 却永远不离开` and `因主的慈爱 / 比生命更美好` read more naturally as two stacked lines on the same slide than as one long line.

## Inline Override Rules

Inline JSON overwrite lines are usually placed immediately after a `---- Song Name` section marker.

### Recommended minimum template for section-specific overrides

When the goal is to override a specific song section while preserving the correct base preset, use this minimum pattern:

```text
{"general":{"useMainSectionSettings":false,"presetChosen":"onsiteChinesePreset"}}
```

Why this matters:

- `useMainSectionSettings:false` tells Khen not to keep inheriting the main section settings blindly for that song.
- `presetChosen:"onsiteChinesePreset"` makes the base preset explicit, so the override has a clear settings base to merge onto.
- Without those fields, a partial overwrite can become ambiguous: the CLI may not know whether the song should continue using the main section settings as-is, and humans reading the lyric file cannot tell which preset the override is intended to modify.

### When to use inline override vs `--config`

- Use inline override when only one song or one section needs custom behavior.
- Use `--config` when the whole deck needs a different settings baseline.
- It is valid to combine a global preset with a section-local inline override.

### Long cover title example

This is a concrete example of a good section-local cover fix for a long Chinese title with an English subtitle:

```text
---- 我的心祢要称颂耶和华 Praise The Lord, O My Soul
{"general":{"useMainSectionSettings":false,"presetChosen":"onsiteChinesePreset"},"cover":{"main":{"coverTitlePositionY":33,"coverTitleFontSize":74},"secondary":{"coverTitlePositionY":66,"coverTitleFontSize":46}}}
# 我的心\\n祢要称颂耶和华 ## Praise The Lord, O My Soul
```

Why this works:

- `\\n` splits the long Chinese title into two visual lines on the same cover slide.
- `cover.main` reduces crowding by controlling the main title size and vertical position.
- `cover.secondary` moves the English subtitle lower so it does not clash with the Chinese title.

### Important preview note

`analyze` may still report zero warnings even when a cover is visually suboptimal. Always inspect the preview grid for:

- title and subtitle collision,
- missing or clipped subtitle text,
- unexpected pinyin or secondary text on the cover,
- semantically awkward long lines that technically fit but read poorly.

## Preview Grid

`--preview-grid` writes a PNG image containing the rendered slide previews in a grid.

Use the preview grid when an agent needs visual feedback before creating the final deck:

- Check whether long lyric lines wrap unexpectedly.
- Verify Mandarin lyrics and pinyin appear together.
- Verify English songs ignore pinyin when an English preset is applied.
- Locate the slide number that needs lyric edits.

When `analyze` detects wrapped text, the preview grid marks affected slides with an amber outline and `WRAP` badge. The JSON report remains the source of truth for the exact line numbers.

The preview grid is an inspection aid, not a byte-for-byte substitute for PowerPoint rendering. For final acceptance, inspect the generated PPTX as well.

## Report JSON

`--report` writes structured JSON for agents. When `--report` is present, the CLI does not print the report to the terminal, even if `--json` is also passed.

Top-level fields:

| Field                  | How To Read It                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `version`              | Report schema version. Currently `1`.                                                                               |
| `input`                | The resolved input paths and preset arguments. `preset` is the resolved internal preset ID.                         |
| `summary`              | High-level counts: lyric lines, song sections, subsections, generated slide count, and whether a cover exists.      |
| `outputs`              | Paths written by the command, such as `pptx`, `previewGrid`, and `report`.                                          |
| `sections`             | One entry per `----` song section. Shows the section name, resolved preset ID, and slide indices.                   |
| `lineMappings`         | 1-based lyric line numbers mapped to generated slides. Useful for tracing problematic lyrics back to source lines.  |
| `overflowSlideIndices` | Slide indices where text wrapping was detected. This includes lyric, pinyin, translation, and cover text.           |
| `warnings`             | Non-fatal issues, including lyric syntax warnings, secondary lyric line-count mismatches, and `TEXT_WRAP` warnings. |
| `errors`               | Fatal validation issues copied from warnings whose type is `error`.                                                 |

Example checks an agent can perform:

```text
summary.slideCount == expected slide count
sections[1].preset == "onsiteEnglishPreset"
warnings.length == 0
outputs.previewGrid exists before asking a vision model to inspect it
```

`lineMappings[].slideIndex`, `warnings[].slideIndex`, and `overflowSlideIndices[]` use the same slide index convention as the line mapper. `sections[].slideIndices` are human-facing one-based slide numbers.

### `TEXT_WRAP` Warnings

`TEXT_WRAP` means a slide text part rendered taller than its single-line measurement, which is the same kind of warning surfaced by the web UI line-number highlighting. It can point to normal lyrics, secondary lyrics, or cover text.

Example:

```json
{
  "type": "warning",
  "code": "TEXT_WRAP",
  "message": "Line 4 may wrap on slide 2",
  "lineNumber": 4,
  "contentType": "main",
  "slideIndex": 2,
  "lineType": "normal",
  "text": "奇异恩典 何等甘甜 我罪已得赦免 前我失丧 今被寻回",
  "sourceText": "奇异恩典 何等甘甜 我罪已得赦免 前我失丧 今被寻回"
}
```

Agents should use `lineNumber`, `lineType`, `contentType`, `text`, and `sourceText` to decide whether to edit the source lyrics. A Mandarin line may produce both a `main` warning and a `secondary` pinyin warning for the same source line. Cover warnings use `lineType: "cover"` and point to the `# ... ## ...` source line.

### Repair Loop For Agents

When `warnings[]` contains `TEXT_WRAP`:

1. Read `lineNumber`, `lineType`, `contentType`, `text`, and `sourceText`.
2. Inspect the preview grid slide if `outputs.previewGrid` exists.
3. If the wrap is visually bad, edit the source line by adding a manual line break.
4. For normal lyrics, split the long lyric line into two lyric lines.
5. For cover text, split the title/subtitle in the cover source line, for example by inserting `\n` where the title should break.
6. Rerun `analyze`.
7. Repeat until warnings are gone or the remaining wraps are visually acceptable.

`TEXT_WRAP` is a warning, not an automatic failure. It tells the user or agent where to inspect; the correct action can be “fix it” or “leave it because it looks fine.”

### Repair Loop For Long Titles And Cover Slides

Cover tuning often needs one or more of these changes together:

1. Insert `\\n` inside the cover title source line to create a deliberate two-line title.
2. Add a section-local inline override with explicit `general.useMainSectionSettings:false` and `general.presetChosen`.
3. Adjust `cover.main.coverTitlePositionY` and `cover.main.coverTitleFontSize`.
4. Adjust `cover.secondary.coverTitlePositionY` and `cover.secondary.coverTitleFontSize`.
5. Rerun `analyze` with `--preview-grid` and inspect the cover visually, even if `warnings[]` is empty.

### Strict Mode

Keep `--fail-on-warning`, but treat it as a deliberate strict-mode gate. It exits with code `2` when any warning exists, including `TEXT_WRAP`, secondary line-count mismatch, and syntax warnings.

Recommended use:

- Use plain `analyze` while repairing lyrics because some wraps may be visually acceptable.
- Use `--fail-on-warning` only when a workflow requires zero warnings before proceeding.
- Do not use it as the default for mixed-language or cover-heavy decks unless the agent is expected to fix every reported wrap.

For normal agent operation, read `warnings[]`, inspect `outputs.previewGrid`, decide whether each warning matters, edit the source when needed, then rerun `analyze`.

## Acceptance Fixture

The current CLI verification fixture is:

```bash
npx tsx scripts/khen-ppt.ts analyze \
  --main .planning/cli-redo/verification/test-input.txt \
  --preset "Default Onsite Chinese" \
  --section-preset "2=Default Onsite English" \
  --auto-pinyin \
  --preview-grid /private/tmp/khen-cli-redo/preview.png \
  --report /private/tmp/khen-cli-redo/analyze-report.json \
  --json
```

Expected behavior:

- The command writes `/private/tmp/khen-cli-redo/analyze-report.json`.
- The command writes `/private/tmp/khen-cli-redo/preview.png`.
- The terminal does not print the JSON report because `--report` is present.
- Section 1 uses `onsiteChinesePreset`.
- Section 2 uses `onsiteEnglishPreset`.
- The generated slide model matches the referenced `20240101 PNW.pptx` look for the fixture lyrics.

To generate the corresponding PPTX:

```bash
npx tsx scripts/khen-ppt.ts generate \
  --main .planning/cli-redo/verification/test-input.txt \
  --preset "Default Onsite Chinese" \
  --section-preset "2=Default Onsite English" \
  --auto-pinyin \
  --output /private/tmp/khen-cli-redo \
  --filename "20240101 PNW" \
  --report /private/tmp/khen-cli-redo/generate-report.json
```

## Error Fixture

The wrapped-line regression fixture is:

```bash
npx tsx scripts/khen-ppt.ts analyze \
  --main .planning/cli-redo/verification/test-error.txt \
  --preset "Default Onsite Chinese" \
  --section-preset "2=Default Onsite English" \
  --auto-pinyin \
  --preview-grid tmp/khen-cli-redo/preview.png \
  --report tmp/khen-cli-redo/analyze-report.json
```

Expected behavior:

- `warnings[]` contains `TEXT_WRAP` for line 4 main lyrics.
- `warnings[]` also contains `TEXT_WRAP` for line 4 secondary pinyin when `--auto-pinyin` is used.
- `warnings[]` contains `TEXT_WRAP` for wrapped cover text, including line 21 in this fixture.
- `overflowSlideIndices[]` includes slides with wrapped lyric or cover text.
- The preview grid marks wrapped slides with the amber `WRAP` badge.

## Testing The CLI

Use the fast test suite while editing parser, report, preset, or workflow logic:

```bash
npm test -- --runInBand
```

Use the real CLI smoke test before relying on the tool end to end:

```bash
npm run test:cli
```

`npm run test:cli` shells out to `npx tsx scripts/khen-ppt.ts` instead of importing workflow functions. It verifies:

- `analyze --report --json` writes report JSON and preview PNG while keeping stdout quiet.
- The real Playwright-backed detector reports `TEXT_WRAP` warnings for the wrapped-line fixture.
- `batch --report --json` writes a combined report while keeping stdout quiet.
- Batch variants create non-empty PPTX files.

The smoke test writes ignored files under `tmp/khen-cli-redo/test-cli/<timestamp>`. If it fails with `listen EPERM` or a Chromium launch error inside an agent sandbox, rerun it with permission for `tsx`/Playwright. That sandbox failure is different from a CLI logic failure.

## Future TODOs

- Add normalized PPTX comparison for generated decks: slide count, text, fonts, sizes, colors, and layout. Byte-for-byte PPTX equality is still not the priority because zip metadata and generated IDs can differ even when the deck is visually equivalent.

## Troubleshooting

### No JSON Appears In Terminal

If `--report` is set, this is expected. Read the report file instead:

```bash
less /private/tmp/khen-cli-redo/analyze-report.json
```

### Unknown Preset

Run:

```bash
npx tsx scripts/khen-ppt.ts presets
```

Then use one of the display names, IDs, or aliases from the output.

### Secondary Line Count Mismatch

This warning means rendered main and secondary lyrics may not align. Use `--auto-pinyin` for Mandarin lyrics, provide a matching `--secondary` file, or apply an English preset override to sections that should ignore secondary lyrics.

### Text Wrap Warning

`TEXT_WRAP` means a lyric, secondary lyric, translation, or cover text part is too long for the current preset/textbox. Split that source line manually and rerun `analyze`. If the warning is for `contentType: "secondary"`, the pinyin or translation generated from that same source line is also too long.

### Preview Grid Missing

Confirm the path was passed to `--preview-grid` and check `outputs.previewGrid` in the report. Parent directories are created automatically.

### Wrong Section Uses English Or Chinese Settings

Check `sections[]` in the report. Section indices are based on `----` markers, not `---` verse markers.

### Final PPTX Looks Different From Preview

The preview grid is produced from the same slide model, but browser image rendering and PowerPoint rendering are not identical. Use the preview grid for line wrapping and layout triage, then inspect the PPTX for final acceptance.
