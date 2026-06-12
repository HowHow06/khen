import { parseCliArgs } from "../scripts/cli/args";

describe("khen-ppt CLI args", () => {
  it("parses the mixed preset analyze command", () => {
    const parsed = parseCliArgs([
      "analyze",
      "--main",
      ".planning/cli-redo/verification/test-input.txt",
      "--preset",
      "Default Onsite Chinese",
      "--section-preset",
      "2=Default Onsite English",
      "--auto-pinyin",
      "--preview-grid",
      "/private/tmp/khen-cli-redo/preview.png",
      "--report",
      "/private/tmp/khen-cli-redo/analyze-report.json",
      "--json",
    ]);

    expect(parsed).toMatchObject({
      command: "analyze",
      main: ".planning/cli-redo/verification/test-input.txt",
      preset: "Default Onsite Chinese",
      sectionPresets: ["2=Default Onsite English"],
      autoPinyin: true,
      previewGrid: "/private/tmp/khen-cli-redo/preview.png",
      report: "/private/tmp/khen-cli-redo/analyze-report.json",
      json: true,
    });
  });

  it("defaults to generate when command is omitted", () => {
    const parsed = parseCliArgs(["--main", "lyrics.txt"]);

    expect(parsed.command).toBe("generate");
    expect(parsed.main).toBe("lyrics.txt");
    expect(parsed.output).toBe(".");
  });

  it("parses the override-schema command without a main file", () => {
    const parsed = parseCliArgs([
      "override-schema",
      "--report",
      "tmp/override-schema.json",
    ]);

    expect(parsed.command).toBe("override-schema");
    expect(parsed.report).toBe("tmp/override-schema.json");
    expect(parsed.main).toBeUndefined();
    expect(parsed.detail).toBe(false);
  });

  it("parses override-schema --detail flag", () => {
    const parsed = parseCliArgs(["override-schema", "--detail"]);

    expect(parsed.command).toBe("override-schema");
    expect(parsed.detail).toBe(true);
  });
});
