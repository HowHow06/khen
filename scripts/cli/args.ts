import { parseArgs } from "util";

export type CliCommand = "analyze" | "generate" | "batch" | "presets";

export type ParsedCliArgs = {
  command: CliCommand;
  main?: string;
  secondary?: string;
  autoPinyin: boolean;
  config?: string;
  output: string;
  filename?: string;
  preset?: string;
  previewGrid?: string;
  report?: string;
  sectionPresets: string[];
  variants: string[];
  json: boolean;
  failOnWarning: boolean;
  help: boolean;
};

const commands = new Set<CliCommand>([
  "analyze",
  "generate",
  "batch",
  "presets",
]);

export function parseCliArgs(argv: string[]): ParsedCliArgs {
  const [maybeCommand, ...rest] = argv;
  const command = commands.has(maybeCommand as CliCommand)
    ? (maybeCommand as CliCommand)
    : "generate";
  const args = commands.has(maybeCommand as CliCommand) ? rest : argv;

  const { values } = parseArgs({
    args,
    options: {
      main: { type: "string", short: "m" },
      secondary: { type: "string", short: "s" },
      "auto-pinyin": { type: "boolean", short: "y", default: false },
      config: { type: "string", short: "c" },
      output: { type: "string", short: "o", default: "." },
      filename: { type: "string", short: "f" },
      preset: { type: "string" },
      "preview-grid": { type: "string" },
      report: { type: "string" },
      "section-preset": { type: "string", multiple: true, default: [] },
      variant: { type: "string", multiple: true, default: [] },
      json: { type: "boolean", default: false },
      "fail-on-warning": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: true,
  });

  return {
    command,
    main: values.main as string | undefined,
    secondary: values.secondary as string | undefined,
    autoPinyin: values["auto-pinyin"] as boolean,
    config: values.config as string | undefined,
    output: values.output as string,
    filename: values.filename as string | undefined,
    preset: values.preset as string | undefined,
    previewGrid: values["preview-grid"] as string | undefined,
    report: values.report as string | undefined,
    sectionPresets: values["section-preset"] as string[],
    variants: values.variant as string[],
    json: values.json as boolean,
    failOnWarning: values["fail-on-warning"] as boolean,
    help: values.help as boolean,
  };
}

export function showHelp(): void {
  console.log(`
Khen PPT Generator CLI

Usage:
  npx tsx scripts/khen-ppt.ts <command> [options]

Commands:
  analyze     Generate report data and optional preview grid without PPTX output
  generate    Generate a PPTX, with optional report and preview grid
  batch       Generate multiple preset variants from the same lyrics
  presets     List available preset aliases

Options:
  --main, -m              Path to main lyrics file
  --secondary, -s         Path to secondary lyrics file
  --auto-pinyin, -y       Auto-generate secondary pinyin from main lyrics
  --preset                Preset for all sections, e.g. "Default Onsite Chinese"
  --section-preset        Section override, e.g. 2=Default Onsite English
  --config, -c            Settings JSON file
  --output, -o            Output directory (default: current directory)
  --filename, -f          Output filename without extension
  --preview-grid          Path to write preview PNG
  --report                Path to write report JSON
  --json                  Print report JSON to stdout only when --report is not set
  --fail-on-warning       Exit non-zero when warnings are present
  --help, -h              Show this help

Examples:
  npx tsx scripts/khen-ppt.ts analyze \\
    --main lyrics.txt \\
    --preset "Default Onsite Chinese" \\
    --section-preset "2=Default Onsite English" \\
    --auto-pinyin \\
    --report out/report.json

  npx tsx scripts/khen-ppt.ts generate \\
    --main lyrics.txt \\
    --preset onsite-chinese \\
    --section-preset 2=onsite-english \\
    --auto-pinyin \\
    --output out \\
    --filename "20240101 PNW"
`);
}
