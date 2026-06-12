import { execFile } from "child_process";
import { mkdir, readFile, stat } from "fs/promises";
import path from "path";
import { promisify } from "util";
import { inflateSync } from "zlib";

const execFileAsync = promisify(execFile);

type CliReport = {
  input?: {
    preset?: string | null;
  };
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
const pngSignature = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

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

function paethPredictor(left: number, up: number, upperLeft: number) {
  const estimate = left + up - upperLeft;
  const distanceLeft = Math.abs(estimate - left);
  const distanceUp = Math.abs(estimate - up);
  const distanceUpperLeft = Math.abs(estimate - upperLeft);

  if (distanceLeft <= distanceUp && distanceLeft <= distanceUpperLeft) {
    return left;
  }
  if (distanceUp <= distanceUpperLeft) {
    return up;
  }
  return upperLeft;
}

function decodePngRgb(buffer: Buffer) {
  assert(
    buffer.subarray(0, pngSignature.length).equals(pngSignature),
    "Expected a PNG file.",
  );

  let offset = pngSignature.length;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks: Buffer[] = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }

    offset += length + 12;
  }

  assert(bitDepth === 8, `Unsupported PNG bit depth: ${bitDepth}.`);
  assert(
    colorType === 2 || colorType === 6,
    `Unsupported PNG color type: ${colorType}.`,
  );

  const bytesPerPixel = colorType === 6 ? 4 : 3;
  const stride = width * bytesPerPixel;
  const inflated = inflateSync(Buffer.concat(idatChunks));
  const pixels = Buffer.alloc(width * height * bytesPerPixel);
  let sourceOffset = 0;

  for (let y = 0; y < height; y++) {
    const filter = inflated[sourceOffset++];
    const rowStart = y * stride;
    const previousRowStart = rowStart - stride;

    for (let x = 0; x < stride; x++) {
      const raw = inflated[sourceOffset++];
      const left =
        x >= bytesPerPixel ? pixels[rowStart + x - bytesPerPixel] : 0;
      const up = y > 0 ? pixels[previousRowStart + x] : 0;
      const upperLeft =
        y > 0 && x >= bytesPerPixel
          ? pixels[previousRowStart + x - bytesPerPixel]
          : 0;

      switch (filter) {
        case 0:
          pixels[rowStart + x] = raw;
          break;
        case 1:
          pixels[rowStart + x] = (raw + left) & 0xff;
          break;
        case 2:
          pixels[rowStart + x] = (raw + up) & 0xff;
          break;
        case 3:
          pixels[rowStart + x] = (raw + Math.floor((left + up) / 2)) & 0xff;
          break;
        case 4:
          pixels[rowStart + x] =
            (raw + paethPredictor(left, up, upperLeft)) & 0xff;
          break;
        default:
          throw new Error(`Unsupported PNG filter type: ${filter}.`);
      }
    }
  }

  return {
    width,
    height,
    getPixel: (x: number, y: number) => {
      const pixelOffset = (y * width + x) * bytesPerPixel;
      return {
        r: pixels[pixelOffset],
        g: pixels[pixelOffset + 1],
        b: pixels[pixelOffset + 2],
      };
    },
  };
}

async function assertLivePreviewHasBlackBand(filePath: string) {
  const png = decodePngRgb(await readFile(filePath));
  let firstGreenX = Number.POSITIVE_INFINITY;
  let firstGreenY = Number.POSITIVE_INFINITY;

  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const pixel = png.getPixel(x, y);
      if (pixel.r < 10 && pixel.g > 240 && pixel.b < 10) {
        firstGreenX = Math.min(firstGreenX, x);
        firstGreenY = Math.min(firstGreenY, y);
      }
    }
  }

  assert(
    Number.isFinite(firstGreenX) && Number.isFinite(firstGreenY),
    "Expected live preview to contain green-screen slide pixels.",
  );

  const blackBandPixel = png.getPixel(firstGreenX + 80, firstGreenY + 220);
  assert(
    blackBandPixel.r < 20 && blackBandPixel.g < 20 && blackBandPixel.b < 20,
    "Expected live preview to render the black lower-band background image.",
  );
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
  const previewPath = path.join(outputDir, "batch-preview.png");

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
    "--preview-grid",
    previewPath,
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
      report.outputs?.previewGrid,
      `Batch variant ${index + 1} did not record a preview grid output path.`,
    );
    assert(
      (report.summary?.slideCount ?? 0) > 0,
      `Batch variant ${index + 1} should generate at least one slide.`,
    );
  });

  for (const report of reports) {
    await assertNonEmptyFile(report.outputs!.pptx!);
    await assertNonEmptyFile(report.outputs!.previewGrid!);
  }

  const liveReport = reports.find(
    (report) => report.input?.preset === "liveChinesePreset",
  );
  assert(liveReport?.outputs?.previewGrid, "Expected a live variant report.");
  await assertLivePreviewHasBlackBand(liveReport.outputs.previewGrid);
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
