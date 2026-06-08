import path from "path";
import type { WorkflowOptions } from "./workflow";

export type BatchVariant = {
  name: string;
  preset: string;
};

export function parseVariant(value: string): BatchVariant {
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

export function suffixPath(
  filePath: string | undefined,
  suffix: string,
): string | undefined {
  if (!filePath) return undefined;
  const extension = path.extname(filePath);
  const base = filePath.slice(0, filePath.length - extension.length);
  return `${base}-${suffix}${extension}`;
}

export function buildVariantWorkflowOptions(
  workflowOptions: WorkflowOptions,
  variant: BatchVariant,
): WorkflowOptions {
  return {
    ...workflowOptions,
    preset: variant.preset,
    filename: workflowOptions.filename
      ? `${workflowOptions.filename}-${variant.name}`
      : undefined,
    report: undefined,
    previewGrid: suffixPath(workflowOptions.previewGrid, variant.name),
  };
}
