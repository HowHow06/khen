/**
 * @jest-environment node
 */

import { CONTENT_TYPE, SETTING_CATEGORY } from "@/lib/constant";
import { onsiteChinesePreset } from "@/lib/presets/ppt-generator";
import { generatePreviewConfig } from "@/lib/utils/ppt-generator/ppt-preview";
import { LineToSlideMapper } from "@/lib/utils/ppt-generator/line-to-slide-mapper";
import { combineWithDefaultSettings } from "@/lib/utils/ppt-generator/settings-generator";
import {
  isSlideOverrideLine,
  stripSlideOverridesFromLyrics,
} from "@/lib/utils/ppt-generator/slide-overwrite";

describe("inline per-slide overrides", () => {
  it("detects and strips slide override directives", () => {
    const lyrics = `第一行
{"$scope":"slide","preset":"onsiteEnglishPreset"}
So we say`;

    expect(isSlideOverrideLine('{"$scope":"slide","preset":"onsiteEnglishPreset"}')).toBe(
      true,
    );
    expect(stripSlideOverridesFromLyrics(lyrics)).toBe(`第一行
So we say`);
  });

  it("applies a slide preset to the next generated slide only", async () => {
    const primaryLyric = `---- Song
# Song ## Test
--- Verse
第一行
{"$scope":"slide","preset":"onsiteEnglishPreset"}
So we say
"Merry Christmas" Today
第二行
第三行
***`;
    const secondaryLyric = primaryLyric;
    const settings = combineWithDefaultSettings(onsiteChinesePreset);
    settings[SETTING_CATEGORY.GENERAL].presetChosen = "onsiteChinesePreset";

    const lineMapper = new LineToSlideMapper();
    const preview = await generatePreviewConfig({
      settingValues: settings,
      primaryLyric,
      secondaryLyric,
      lineMapper,
    });

    const mappings = lineMapper.getAllMappings();
    const directiveMapping = mappings.find((mapping) => mapping.lineNumber === 4);
    const englishMapping = mappings.find((mapping) => mapping.lineNumber === 5);
    const secondEnglishMapping = mappings.find(
      (mapping) => mapping.lineNumber === 6,
    );
    const nextChineseMapping = mappings.find((mapping) => mapping.lineNumber === 7);

    expect(directiveMapping).toEqual(
      expect.objectContaining({
        lineType: "slide_override",
        isSpecialLine: true,
      }),
    );
    expect(englishMapping?.slideIndex).toBeGreaterThan(0);
    expect(secondEnglishMapping).toEqual(
      expect.objectContaining({
        lineType: "skipped",
        slideIndex: englishMapping?.slideIndex,
      }),
    );
    expect(nextChineseMapping?.slideIndex).toBeGreaterThan(
      englishMapping?.slideIndex ?? 0,
    );

    const englishSlide = preview.slides[(englishMapping?.slideIndex ?? 1) - 1];
    const englishTextObjects = englishSlide.objects.filter(
      (object) => object.kind === "text",
    );
    const englishTexts = englishTextObjects.flatMap((object) =>
      object.kind === "text" ? object.text.map((part) => part.text) : [],
    );

    expect(englishTextObjects).toHaveLength(1);
    expect(englishTexts).toContain("So we say");
    expect(englishTexts).toContain('"Merry Christmas" Today');

    const nextChineseSlide =
      preview.slides[(nextChineseMapping?.slideIndex ?? 1) - 1];
    const nextChineseTextObjects = nextChineseSlide.objects.filter(
      (object) => object.kind === "text",
    );

    expect(nextChineseTextObjects.length).toBeGreaterThan(1);
    expect(settings[SETTING_CATEGORY.CONTENT][CONTENT_TYPE.SECONDARY]).toBeDefined();
  });
});
