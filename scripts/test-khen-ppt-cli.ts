import { execFile } from "child_process";
import { mkdir, readFile, stat } from "fs/promises";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

type CliReport = {
  summary?: {
    slideCount?: number;
  };
  outputs?: {
    pptx?: string;
    previewGrid?: string;
    report?: string;
  };
  overflowSlideIndices?: number[];
  warnings?: Array<Record<string, any>>;
  errors?: Array<Record<string, any>>;
  sections?: Array<Record<string, any>>;
};

const rootDir = process.cwd();
const npxBinary = process.platform === "win32" ? "npx.cmd" : "npx";
const runId = new Date().toISOString().replace(/[:.]/g, "-");
const outputDir = path.join("tmp", "khen-cli-redo", "test-cli", runId);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function runCli(args: string[]) {
  try {
    const result = await execFileAsync(
      npxBinary,
      ["tsx", "scripts/khen-ppt.ts", ...args],
      {
        cwd: rootDir,
        encoding: "utf-8",
        maxBuffer: 20 * 1024 * 1024,
      },
    );

    assert(
      result.stdout.trim() === "",
      `Expected quiet stdout when --report is set, but got:\n${result.stdout}`,
    );

    return result;
  } catch (error) {
    const command = `npx tsx scripts/khen-ppt.ts ${args.join(" ")}`;
    if (error && typeof error === "object") {
      const detail = error as {
        message?: string;
        stdout?: string;
        stderr?: string;
      };
      throw new Error(
        [
          `CLI smoke command failed: ${command}`,
          detail.message,
          detail.stdout ? `stdout:\n${detail.stdout}` : "",
          detail.stderr ? `stderr:\n${detail.stderr}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
    throw error;
  }
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf-8")) as T;
}

async function assertNonEmptyFile(filePath: string) {
  const fileStat = await stat(filePath);
  assert(fileStat.size > 0, `Expected ${filePath} to be non-empty.`);
}

function hasTextWrapWarning(
  report: CliReport,
  expected: {
    lineNumber: number;
    contentType: string;
    lineType?: string;
    slideIndex?: number;
  },
) {
  return (report.warnings ?? []).some((warning) => {
    return (
      warning.code === "TEXT_WRAP" &&
      warning.lineNumber === expected.lineNumber &&
      warning.contentType === expected.contentType &&
      (expected.lineType === undefined ||
        warning.lineType === expected.lineType) &&
      (expected.slideIndex === undefined ||
        warning.slideIndex === expected.slideIndex)
    );
  });
}

async function runAnalyzeSmoke() {
  const previewPath = path.join(outputDir, "preview.png");
  const reportPath = path.join(outputDir, "analyze-report.json");

  await runCli([
    "analyze",
    "--main",
    ".planning/cli-redo/verification/test-error.txt",
    "--preset",
    "Default Onsite Chinese",
    "--section-preset",
    "2=Default Onsite English",
    "--auto-pinyin",
    "--preview-grid",
    previewPath,
    "--report",
    reportPath,
    "--json",
  ]);

  await assertNonEmptyFile(previewPath);
  await assertNonEmptyFile(reportPath);

  const report = await readJson<CliReport>(reportPath);
  assert((report.errors ?? []).length === 0, "Analyze report has errors.");
  assert(
    report.outputs?.previewGrid === previewPath,
    "Analyze report did not record the preview grid path.",
  );
  assert(
    report.outputs?.report === reportPath,
    "Analyze report did not record the report path.",
  );
  assert(
    hasTextWrapWarning(report, {
      lineNumber: 4,
      contentType: "main",
      slideIndex: 2,
    }),
    "Expected TEXT_WRAP warning for line 4 main lyrics.",
  );
  assert(
    hasTextWrapWarning(report, {
      lineNumber: 4,
      contentType: "secondary",
      slideIndex: 2,
    }),
    "Expected TEXT_WRAP warning for line 4 secondary lyrics.",
  );
  assert(
    hasTextWrapWarning(report, {
      lineNumber: 21,
      contentType: "main",
      lineType: "cover",
      slideIndex: 9,
    }),
    "Expected TEXT_WRAP warning for line 21 cover text.",
  );
  assert(
    (report.overflowSlideIndices ?? []).includes(2) &&
      (report.overflowSlideIndices ?? []).includes(9),
    "Expected overflowSlideIndices to include slides 2 and 9.",
  );
}

async function runBatchSmoke() {
  const reportPath = path.join(outputDir, "batch-report.json");

  await runCli([
    "batch",
    "--main",
    ".planning/cli-redo/verification/test-input.txt",
    "--auto-pinyin",
    "--section-preset",
    "2=Default Onsite English",
    "--variant",
    "onsite=onsite-chinese",
    "--variant",
    "live=live-chinese",
    "--output",
    outputDir,
    "--filename",
    "batch-fixture",
    "--report",
    reportPath,
    "--json",
  ]);

  await assertNonEmptyFile(reportPath);

  const reports = await readJson<CliReport[]>(reportPath);
  assert(Array.isArray(reports), "Batch report should be an array.");
  assert(reports.length === 2, "Batch report should contain two variants.");

  reports.forEach((report, index) => {
    assert(
      (report.errors ?? []).length === 0,
      `Batch variant ${index + 1} has errors.`,
    );
    assert(
      report.outputs?.pptx,
      `Batch variant ${index + 1} did not record a PPTX output path.`,
    );
    assert(
      (report.summary?.slideCount ?? 0) > 0,
      `Batch variant ${index + 1} should generate at least one slide.`,
    );
  });

  for (const report of reports) {
    await assertNonEmptyFile(report.outputs!.pptx!);
  }
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  await runAnalyzeSmoke();
  await runBatchSmoke();
  console.log(`CLI smoke tests passed. Outputs: ${outputDir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
