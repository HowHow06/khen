import { mkdtemp, readFile } from "fs/promises";
import os from "os";
import path from "path";
import { analyzeWorkflow } from "../scripts/cli/workflow";

describe("khen-ppt analyze workflow", () => {
  it("analyzes the mixed Chinese and English fixture with section preset override", async () => {
    const outputDir = await mkdtemp(path.join(os.tmpdir(), "khen-cli-test-"));
    const reportPath = path.join(outputDir, "report.json");

    const report = await analyzeWorkflow({
      main: path.join(
        process.cwd(),
        ".planning/cli-redo/verification/test-input.txt",
      ),
      autoPinyin: true,
      output: outputDir,
      preset: "Default Onsite Chinese",
      report: reportPath,
      sectionPresets: ["2=Default Onsite English"],
    });

    expect(report.summary.slideCount).toBe(19);
    expect(report.warnings).toHaveLength(0);
    expect(report.errors).toHaveLength(0);
    expect(report.outputs.report).toBe(reportPath);
    expect(report.sections).toEqual([
      expect.objectContaining({
        index: 1,
        name: "奇异恩典",
        preset: "onsiteChinesePreset",
      }),
      expect.objectContaining({
        index: 2,
        name: "What a friend we have in Jesus",
        preset: "onsiteEnglishPreset",
      }),
    ]);

    const savedReport = JSON.parse(await readFile(reportPath, "utf-8"));
    expect(savedReport.outputs.report).toBe(reportPath);
    expect(savedReport.summary.slideCount).toBe(19);
  });
});
