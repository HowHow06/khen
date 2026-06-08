import { resolvePresetId } from "../scripts/cli/presets";

describe("khen-ppt preset aliases", () => {
  it("resolves display names and aliases to internal preset IDs", () => {
    expect(resolvePresetId("Default Onsite Chinese")).toBe(
      "onsiteChinesePreset",
    );
    expect(resolvePresetId("onsite-english")).toBe("onsiteEnglishPreset");
    expect(resolvePresetId("default online chinese")).toBe("liveChinesePreset");
  });

  it("throws with available choices for an unknown preset", () => {
    expect(() => resolvePresetId("unknown preset")).toThrow(
      /Available presets:/,
    );
  });
});
