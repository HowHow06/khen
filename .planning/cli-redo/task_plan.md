# Task Plan: Khen PPT Generator CLI Spec

## Goal

Build and document an AI-agent-friendly CLI version of Khen's PPT generator that can analyze lyrics, generate preview grids, apply global and section presets, and generate PPTX files.

## Current Phase

Phase 12

## Phases

### Phase 1: Requirements & Discovery

- [x] Capture user workflow and constraints
- [x] Identify existing CLI attempts and reusable frontend/PPT modules
- [x] Inspect sample PPTX enough to understand expected output shape
- [x] Document findings in findings.md
- **Status:** complete

### Phase 2: Architecture Mapping

- [x] Map current browser-only dependencies and state flows
- [x] Identify which logic can be reused directly in Node
- [x] Identify required extraction/refactor points for CLI use
- **Status:** complete

### Phase 3: CLI Specification

- [x] Define AI-agent workflow commands and inputs
- [x] Define validation and preview-grid behavior
- [x] Define preset/section override behavior
- [x] Define machine-readable outputs
- **Status:** complete

### Phase 4: Implementation Plan

- [x] Break work into phases with files/modules to touch
- [x] Define test strategy and acceptance criteria
- [x] Note risks, open questions, and migration choices
- **Status:** complete

### Phase 5: Delivery

- [x] Review planning files for completeness
- [x] Summarize deliverables to user
- **Status:** complete

### Phase 6: Add Golden Verification Acceptance

- [x] Read verification input and reference PPTX metadata
- [x] Add golden fixture acceptance criteria
- [x] Capture deterministic PPTX comparison caveat
- **Status:** complete

### Phase 7: Build First CLI Slice

- [x] Create a new CLI entrypoint with `analyze`, `generate`, `batch`, and `presets`
- [x] Add shared workflow for preset resolution, secondary lyric generation, preview config, line mappings, and reports
- [x] Support global preset plus section-specific preset overrides
- [x] Smoke test against the verification fixture
- **Status:** complete

### Phase 8: Agent Documentation and Quiet Reports

- [x] Update CLI behavior so `--report` writes JSON to file without noisy stdout
- [x] Document the new `scripts/khen-ppt.ts` commands, options, presets, reports, and fixture workflow
- [x] Update the repository README so agents start with the new CLI guide
- [x] Verify quiet report behavior and run project checks
- **Status:** complete

### Phase 9: Regression Tests

- [x] Add focused Jest tests for CLI argument parsing
- [x] Add focused Jest tests for preset alias resolution
- [x] Add focused Jest tests for report stdout policy
- [x] Add fixture workflow test for mixed Chinese/English analyze behavior
- [x] Keep Playwright preview generation lazy so report-only tests do not load browser code
- [x] Run TypeScript and Jest checks
- **Status:** complete

### Phase 10: CLI Text-Wrap Detection

- [x] Confirm `test-error.txt` currently misses the wrapped Mandarin line warning
- [x] Add CLI-safe overflow/wrap detector based on the web UI measurement logic
- [x] Include `TEXT_WRAP` warnings in `analyze` and `generate` reports
- [x] Update CLI docs/report schema to explain `TEXT_WRAP`
- [x] Add regression tests for `test-error.txt`
- [x] Run TypeScript, Jest, and fixture smoke checks
- **Status:** complete

### Phase 11: Lint, Overflow Scope, Repair Docs, Batch Tests

- [x] Preserve user's decision that overflow detection should report all wrapped text, including cover text
- [x] Fix the lint script for the installed Next/ESLint versions
- [x] Extend `TEXT_WRAP` warnings to cover text and other line-mapped special text, not only normal lyric lines
- [x] Document how agents should repair wrapped lyrics/cover text by inserting manual line breaks or accepting visually OK wraps
- [x] Record normalized PPTX comparison as a future TODO, not current priority
- [x] Add regression tests for `batch`
- [x] Run lint, TypeScript, Jest, and CLI smoke checks
- **Status:** complete

### Phase 12: Playwright-Backed CLI Smoke Test Script

- [x] Add a real CLI smoke script that shells out to `npx tsx scripts/khen-ppt.ts`
- [x] Verify `analyze --report --json` keeps stdout quiet, writes report JSON, writes preview PNG, and detects real `TEXT_WRAP` warnings through Playwright
- [x] Verify `batch --report --json` keeps stdout quiet, writes combined JSON, and creates variant PPTX files
- [x] Add `npm run test:cli` for future agents and maintainers
- [x] Document when to use Jest versus `test:cli`
- [x] Run the new smoke test outside the sandbox when `tsx` or Chromium is blocked by sandbox permissions
- **Status:** complete

## Key Questions

1. What CLI work already exists, and should it be continued or replaced?
2. Which PPT generation modules are reusable outside React/browser state?
3. How can a CLI detect overlong/wrapped lyric lines before generating the final PPT?
4. What command set best supports AI agents repeating the onsite/online workflow?
5. How should per-section preset overrides and ignored secondary lyrics be expressed?

## Decisions Made

| Decision                                                             | Rationale                                                                                                                                        |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Keep work limited to planning files for this turn                    | User explicitly asked to investigate, gather specs, and not modify implementation yet                                                            |
| Put planning output under `.planning/cli-redo`                       | User requested this exact destination                                                                                                            |
| Continue and refactor the existing CLI rather than restart from zero | Existing CLI already generates PPTX and preview PNG successfully; missing pieces are structured report, validation, overflow, and batch workflow |
| Make report JSON the primary AI-agent interface                      | Agents need deterministic line/slide/warning data instead of relying only on pixels                                                              |
| Add provided PPTX as a golden verification fixture                   | It directly captures the mixed Chinese/English preset workflow the CLI must reproduce                                                            |
| Build the new CLI alongside the old script                           | Keeps existing `generate-ppt-from-lyrics.ts` behavior available while the agent-focused CLI matures                                              |
| Suppress stdout when `--report` is provided                          | Report files are easier for agents to consume than noisy terminal JSON                                                                           |
| Port web wrap detection into a CLI utility                           | The web UI already flags overlong lines; CLI reports need the same signal for agents                                                             |
| Report all wrapped text, including cover text                        | User wants agents/users to decide whether to manually break or accept each wrap                                                                  |
| Add a real `test:cli` script outside Jest                            | Jest mocks the overflow detector because sandboxed Chromium is unreliable; the CLI smoke proves the actual terminal + Playwright path works      |

## Errors Encountered

| Error                                                           | Attempt | Resolution                                                                                                                                      |
| --------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Bundled Python has no `markitdown` module                       | 1       | Used direct PPTX OOXML/zip parsing instead                                                                                                      |
| Local `soffice`, `libreoffice`, and `pdftoppm` were unavailable | 1       | Captured text/style metadata from OOXML and noted visual render limitation                                                                      |
| `tsx` failed in sandbox with `listen EPERM` on IPC pipe         | 1       | Reran smoke tests outside sandbox with approval                                                                                                 |
| Golden fixture PPTX hash does not match byte-for-byte yet       | 1       | Confirmed slide count and extracted slide text match; byte determinism remains future work                                                      |
| `npm run lint` fails because `next lint` is not supported here  | 1       | TypeScript and Jest checks passed; lint script needs a future package-script update                                                             |
| Playwright `page.evaluate` saw `__name is not defined`          | 1       | Switched browser-side detector to raw JavaScript string evaluation                                                                              |
| Jest sandbox cannot launch Chromium                             | 1       | Added test-only detector injection and kept real browser verification as CLI smoke                                                              |
| ESLint 9/Next 16 flat config surfaced React Compiler errors     | 1       | Kept Next lint rules but disabled compiler-only rules that block existing legacy patterns                                                       |
| Jest does not prove real Playwright text measurement            | 1       | Added `npm run test:cli`, a separate smoke test that shells out to the CLI and runs the real browser-backed detector                            |
| New `test:cli` initially assumed all variants have 19 slides    | 1       | Relaxed batch smoke to require successful non-empty PPTX outputs and positive slide counts because live presets legitimately change slide count |

## Notes

- Do not modify app/source code during this planning pass.
- Use repository evidence for the plan rather than designing from memory.
- Capture multimodal/PPTX observations in findings.md promptly.
