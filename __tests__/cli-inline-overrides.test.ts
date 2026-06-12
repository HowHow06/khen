import { mkdtemp, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import {
  buildInlineOverrideSchema,
  validateInlineOverrides,
} from "../scripts/cli/inline-overrides";
import { analyzeWorkflow } from "../scripts/cli/workflow";

const noOverflowDetector = async () => ({
  warnings: [],
  overflowSlideIndices: [],
});

describe("khen-ppt inline override validation", () => {
  it("reports invalid inline override keys and preset ids", () => {
    const warnings = validateInlineOverrides(`---- Song
{"general":{"presetChosen":"Default Onsite English"},"nonsense":true}
# Song ## Test
--- Verse
Line one`);

    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "INLINE_OVERRIDE_PRESET_INVALID",
          lineNumber: 2,
          path: "general.presetChosen",
        }),
        expect.objectContaining({
          code: "INLINE_OVERRIDE_KEY_UNKNOWN",
          lineNumber: 2,
          path: "nonsense",
        }),
      ]),
    );
  });

  it("reports JSON-like overrides that Khen will not apply", () => {
    const warnings = validateInlineOverrides(`---- Song
# Song ## Test
{"general":{"presetChosen":"onsiteChinesePreset"}}
--- Verse
Line one`);

    expect(warnings).toEqual([
      expect.objectContaining({
        code: "INLINE_OVERRIDE_LOCATION_INVALID",
        lineNumber: 3,
      }),
    ]);
  });

  it("warns when section override is missing useMainSectionSettings key", () => {
    const cases = [
      // No general key at all
      '{"cover":{"main":{"coverTitleFontSize":58}}}',
      // general present but useMainSectionSettings key is absent
      '{"general":{"presetChosen":"onsiteChinesePreset"}}',
    ];

    for (const json of cases) {
      const warnings = validateInlineOverrides(`---- Song\n${json}\n# Song ## Test\n--- Verse\nLine one`);
      expect(warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "INLINE_OVERRIDE_MISSING_REQUIRED_FIELD",
            path: "general.useMainSectionSettings",
          }),
        ]),
      );
    }
  });

  it("does not warn when useMainSectionSettings is explicitly set regardless of value", () => {
    const cases = [
      '{"general":{"useMainSectionSettings":false,"presetChosen":"onsiteChinesePreset"}}',
      '{"general":{"useMainSectionSettings":true,"presetChosen":"onsiteChinesePreset"}}',
    ];

    for (const json of cases) {
      const warnings = validateInlineOverrides(`---- Song\n${json}\n# Song ## Test\n--- Verse\nLine one`);
      expect(warnings).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: "INLINE_OVERRIDE_MISSING_REQUIRED_FIELD" }),
        ]),
      );
    }
  });

  it("keeps valid section overrides quiet", () => {
    const warnings = validateInlineOverrides(`---- Song
{"general":{"useMainSectionSettings":false,"presetChosen":"onsiteChinesePreset"},"cover":{"main":{"coverTitlePositionY":33,"coverTitleFontSize":74}}}
# Song ## Test
--- Verse
Line one`);

    expect(warnings).toHaveLength(0);
  });

  it("includes inline override warnings in analyze reports", async () => {
    const outputDir = await mkdtemp(path.join(os.tmpdir(), "khen-cli-test-"));
    const lyricPath = path.join(outputDir, "lyrics.txt");
    await writeFile(
      lyricPath,
      `---- Song
{"general":{"presetChosen":"Default Onsite English"},"nonsense":true}
# Song ## Test
--- Verse
Line one
***`,
    );

    const report = await analyzeWorkflow({
      main: lyricPath,
      autoPinyin: false,
      output: outputDir,
      preset: "Default Onsite Chinese",
      report: path.join(outputDir, "report.json"),
      sectionPresets: [],
      textOverflowDetector: noOverflowDetector,
    });

    expect(report.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "INLINE_OVERRIDE_PRESET_INVALID",
          lineNumber: 2,
        }),
        expect.objectContaining({
          code: "INLINE_OVERRIDE_KEY_UNKNOWN",
          lineNumber: 2,
          path: "nonsense",
        }),
      ]),
    );
  });

  it("dumps a simplified inline override schema by default", () => {
    const schema = buildInlineOverrideSchema() as any;

    expect(schema.presetChosen.enum).toContain("onsiteChinesePreset");
    expect(schema.sectionOverride.general.useMainSectionSettings).toBe(
      "boolean",
    );
    expect(schema.sectionOverride.cover.main.coverTitleFontSize).toBe("number");
    expect(schema.sectionOverride.content.main.text.fontSize).toBe("number");
    expect(
      schema.sectionOverride.content.main.textbox["textbox<number>"]
        .textboxPositionY,
    ).toBe("percentage");
  });

  it("dumps detailed field metadata when detail flag is set", () => {
    const schema = buildInlineOverrideSchema({ detailed: true }) as any;

    expect(schema.presetChosen.enum).toContain("onsiteChinesePreset");
    expect(schema.sectionOverride.general.useMainSectionSettings.type).toBe(
      "boolean",
    );
    expect(schema.sectionOverride.cover.main.coverTitleFontSize.type).toBe(
      "number",
    );
    expect(schema.sectionOverride.content.main.text.fontSize.type).toBe(
      "number",
    );
    expect(
      schema.sectionOverride.content.main.textbox["textbox<number>"]
        .textboxPositionY.type,
    ).toBe("percentage");
  });
});
