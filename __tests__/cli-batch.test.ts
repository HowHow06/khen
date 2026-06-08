import {
  buildVariantWorkflowOptions,
  parseVariant,
  suffixPath,
} from "../scripts/cli/batch";
import type { WorkflowOptions } from "../scripts/cli/workflow";

describe("khen-ppt batch helpers", () => {
  it("parses variant names and preset aliases", () => {
    expect(parseVariant("onsite=onsite-chinese")).toEqual({
      name: "onsite",
      preset: "onsite-chinese",
    });
    expect(parseVariant(" live = Default Live Chinese ")).toEqual({
      name: "live",
      preset: "Default Live Chinese",
    });
  });

  it("rejects invalid variant syntax", () => {
    expect(() => parseVariant("onsite")).toThrow(/Expected format/);
  });

  it("suffixes preview-grid paths for each variant", () => {
    expect(suffixPath("tmp/preview.png", "onsite")).toBe(
      "tmp/preview-onsite.png",
    );
    expect(suffixPath(undefined, "onsite")).toBeUndefined();
  });

  it("builds variant workflow options without per-variant report paths", () => {
    const workflowOptions: WorkflowOptions = {
      main: "lyrics.txt",
      autoPinyin: true,
      output: "out",
      filename: "sunday",
      preset: "onsite-chinese",
      previewGrid: "tmp/preview.png",
      report: "tmp/batch-report.json",
      sectionPresets: ["2=onsite-english"],
    };

    expect(
      buildVariantWorkflowOptions(workflowOptions, {
        name: "live",
        preset: "live-chinese",
      }),
    ).toEqual({
      ...workflowOptions,
      preset: "live-chinese",
      filename: "sunday-live",
      previewGrid: "tmp/preview-live.png",
      report: undefined,
    });
  });
});
