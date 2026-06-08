#!/usr/bin/env npx tsx

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { parseCliArgs, showHelp } from "./cli/args";
import { shouldPrintReportToStdout } from "./cli/output";
import { analyzeWorkflow, generateWorkflow, listPresets } from "./cli/workflow";
import type { WorkflowOptions } from "./cli/workflow";

function parseVariant(value: string): { name: string; preset: string } {
  const separatorIndex = value.indexOf("=");
  if (separatorIndex === -1) {
    throw new Error(
      `Invalid --variant "${value}". Expected format: onsite=onsite-chinese`,
    );
  }

  return {
    name: value.slice(0, separatorIndex).trim(),
    preset: value.slice(separatorIndex + 1).trim(),
  };
}

function suffixPath(
  filePath: string | undefined,
  suffix: string,
): string | undefined {
  if (!filePath) return undefined;
  const extension = path.extname(filePath);
  const base = filePath.slice(0, filePath.length - extension.length);
  return `${base}-${suffix}${extension}`;
}

async function main() {
  const options = parseCliArgs(process.argv.slice(2));

  if (options.help) {
    showHelp();
    return;
  }

  if (options.command === "presets") {
    console.log(JSON.stringify(listPresets(), null, 2));
    return;
  }

  if (!options.main) {
    throw new Error("--main is required.");
  }

  const workflowOptions: WorkflowOptions = {
    main: options.main,
    secondary: options.secondary,
    autoPinyin: options.autoPinyin,
    config: options.config,
    output: options.output,
    filename: options.filename,
    preset: options.preset,
    previewGrid: options.previewGrid,
    report: options.report,
    sectionPresets: options.sectionPresets,
  };

  if (options.command === "batch") {
    if (options.variants.length === 0) {
      throw new Error(
        "batch requires at least one --variant name=preset option.",
      );
    }

    const reports = [];
    for (const variant of options.variants.map(parseVariant)) {
      reports.push(
        await generateWorkflow({
          ...workflowOptions,
          preset: variant.preset,
          filename: workflowOptions.filename
            ? `${workflowOptions.filename}-${variant.name}`
            : undefined,
          report: undefined,
          previewGrid: suffixPath(workflowOptions.previewGrid, variant.name),
        }),
      );
    }

    if (options.report) {
      await mkdir(path.dirname(options.report), { recursive: true });
      await writeFile(options.report, JSON.stringify(reports, null, 2));
    }

    if (shouldPrintReportToStdout(options.report)) {
      console.log(JSON.stringify(reports, null, 2));
    }

    if (
      options.failOnWarning &&
      reports.some((report) => report.warnings.length > 0)
    ) {
      process.exitCode = 2;
    }

    if (reports.some((report) => report.errors.length > 0)) {
      process.exitCode = 1;
    }
    return;
  }

  const report =
    options.command === "analyze"
      ? await analyzeWorkflow(workflowOptions)
      : await generateWorkflow(workflowOptions);

  if (shouldPrintReportToStdout(options.report)) {
    console.log(JSON.stringify(report, null, 2));
  }

  if (options.failOnWarning && report.warnings.length > 0) {
    process.exitCode = 2;
  }

  if (report.errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
