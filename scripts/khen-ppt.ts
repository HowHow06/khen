#!/usr/bin/env npx tsx

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { parseCliArgs, showHelp } from "./cli/args";
import { buildVariantWorkflowOptions, parseVariant } from "./cli/batch";
import { shouldPrintReportToStdout } from "./cli/output";
import {
  analyzeWorkflow,
  generateWorkflow,
  getInlineOverrideSchema,
  listPresets,
} from "./cli/workflow";
import type { WorkflowOptions } from "./cli/workflow";

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

  if (options.command === "override-schema") {
    const schema = getInlineOverrideSchema({ detailed: options.detail });
    if (options.report) {
      await mkdir(path.dirname(options.report), { recursive: true });
      await writeFile(options.report, JSON.stringify(schema, null, 2));
      return;
    }

    console.log(JSON.stringify(schema, null, 2));
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
        await generateWorkflow(
          buildVariantWorkflowOptions(workflowOptions, variant),
        ),
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
