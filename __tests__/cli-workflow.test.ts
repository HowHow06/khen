/**
 * @jest-environment node
 */

import { mkdtemp, readFile } from "fs/promises";
import os from "os";
import path from "path";
import { analyzeWorkflow } from "../scripts/cli/workflow";

const noOverflowDetector = async () => ({
  warnings: [],
  overflowSlideIndices: [],
});

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
      textOverflowDetector: noOverflowDetector,
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

  it("reports wrapped lyric lines for the error fixture", async () => {
    const outputDir = await mkdtemp(path.join(os.tmpdir(), "khen-cli-test-"));
    const reportPath = path.join(outputDir, "report.json");

    const report = await analyzeWorkflow({
      main: path.join(
        process.cwd(),
        ".planning/cli-redo/verification/test-error.txt",
      ),
      autoPinyin: true,
      output: outputDir,
      preset: "Default Onsite Chinese",
      report: reportPath,
      sectionPresets: ["2=Default Onsite English"],
      textOverflowDetector: async () => ({
        overflowSlideIndices: [2, 9],
        warnings: [
          {
            type: "warning",
            code: "TEXT_WRAP",
            message: "Line 4 may wrap on slide 2",
            lineNumber: 4,
            contentType: "main",
            slideIndex: 2,
            text: "奇异恩典 何等甘甜 我罪已得赦免 前我失丧 今被寻回",
          },
          {
            type: "warning",
            code: "TEXT_WRAP",
            message: "Line 4 may wrap on slide 2",
            lineNumber: 4,
            contentType: "secondary",
            slideIndex: 2,
            text: "qi yi en dian   he deng gan tian   wo zui yi de she mian   qian wo shi sang   jin bei xun hui",
          },
          {
            type: "warning",
            code: "TEXT_WRAP",
            message: "Line 21 may wrap on slide 9",
            lineNumber: 21,
            contentType: "main",
            slideIndex: 9,
            lineType: "cover",
            text: "What a friend we have in Jesus",
            sourceText: "# What a friend we have in Jesus",
          },
        ],
      }),
    });

    expect(report.summary.slideCount).toBe(18);
    expect(report.overflowSlideIndices).toContain(2);
    expect(report.overflowSlideIndices).toContain(9);
    expect(report.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "TEXT_WRAP",
          lineNumber: 4,
          contentType: "main",
          slideIndex: 2,
          text: "奇异恩典 何等甘甜 我罪已得赦免 前我失丧 今被寻回",
        }),
        expect.objectContaining({
          code: "TEXT_WRAP",
          lineNumber: 4,
          contentType: "secondary",
          slideIndex: 2,
        }),
        expect.objectContaining({
          code: "TEXT_WRAP",
          lineNumber: 21,
          contentType: "main",
          slideIndex: 9,
          lineType: "cover",
          text: "What a friend we have in Jesus",
        }),
      ]),
    );

    const savedReport = JSON.parse(await readFile(reportPath, "utf-8"));
    expect(savedReport.warnings).toEqual(report.warnings);
  });
});
