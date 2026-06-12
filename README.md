# Khen

Khen is a Next.js tool suite focused on creating PowerPoint presentations for praise and worship songs. The main feature is the PPT Generator, which turns formatted lyrics into `.pptx` files with configurable layouts for onsite projection and online/live use.

## PPT Generator

The PPT Generator supports:

- Multi-song medleys using `----` song sections
- Cover slides using `# Title ## Subtitle`
- Verse/chorus/bridge subsections using `---`
- Mandarin lyrics with pinyin secondary lyrics
- English songs that ignore secondary lyrics
- Presets for onsite and online/live decks
- Preview grid images for checking slide layout before generating the PPTX
- JSON reports that agents can read to understand slide counts, section presets, line mappings, warnings, and output paths

## For AI Agents

Use the CLI when automating the worship lyric workflow. The agent-facing entry point is:

```bash
npx tsx scripts/khen-ppt.ts <command> [options]
```

Common analyze command:

```bash
npx tsx scripts/khen-ppt.ts analyze \
  --main .planning/cli-redo/verification/test-input.txt \
  --preset "Default Onsite Chinese" \
  --section-preset "2=Default Onsite English" \
  --auto-pinyin \
  --preview-grid /private/tmp/khen-cli-redo/preview.png \
  --report /private/tmp/khen-cli-redo/analyze-report.json
```

Read `/private/tmp/khen-cli-redo/analyze-report.json` to understand the result. When `--report` is set, the CLI writes JSON to the file and keeps terminal output quiet, even if `--json` is passed.

Use `warnings[]` in the report to find text that needs inspection. `TEXT_WRAP` warnings identify source lyric, secondary lyric, translation, or cover lines that may wrap in the generated slide layout, and preview grids mark affected slides with a `WRAP` badge.

For full CLI behavior, presets, report schema, preview-grid usage, fixture verification, sectioning guidance for new lyrics, and inline override examples for long cover titles, read [CLI PPT Generator Guide](./docs/CLI_PPT_GENERATOR_GUIDE.md).

To verify the real agent workflow end to end, run:

```bash
npm run test:cli
```

This smoke test shells out to the CLI, runs the real Playwright-backed text-wrap detector, writes ignored outputs under `tmp/khen-cli-redo/test-cli`, and checks report JSON plus generated PPTX files.

## Getting Started

**Node.js requirement:** `>=20.9.0`

Setting up Khen is straightforward, ensuring you can get up and running with minimal fuss:

1. **Clone the Repository**

```bash
git clone https://github.com/HowHow06/khen.git
```

2. **Installation**

Navigate to the project directory and install the necessary dependencies:

```bash
# Install dependencies
npm install
```

3. **Environment Configuration**

Copy the `.env.example` file to a new file named `.env.local` and update it with your specific configurations:

```bash
cp .env.example .env.local
```

4. **Running the Application**

Launch Khen with the following command:

```bash
npm run dev
```

The application will be available at `http://localhost:3000` or the port specified in your `.env` file.

## Documentation

For more detailed information on each tool within Khen, including walkthroughs and tips, refer to:

- [PPT Generator User Guide](./docs/PPT_GENERATOR_USER_GUIDE.md) - Comprehensive guide for the web application
- [CLI PPT Generator Guide](./docs/CLI_PPT_GENERATOR_GUIDE.md) - Agent-friendly command-line interface for analysis, preview grids, reports, and PPTX generation
- [External Guide](https://season-breeze-210.notion.site/PPT-Control-and-Making-Training-a5a2e6329d5b4e5e871910024d6c6a2e?pvs=4) - Additional training materials

## Development Commands

```bash
npm run dev          # Start the Next.js dev server
npm run build        # Build static export
npm test             # Run Jest tests
npm run test:cli     # Run real CLI smoke tests with Playwright
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run check        # Run lint and type-check
```

## Contributing

Khen is a personal passion project, but collaboration is the key to improvement. Whether it's suggesting new features, improving existing tools, or fixing bugs, your contributions are welcome. Feel free to fork the repository and submit pull requests.

---

## Troubleshooting

## Error faced in using jest

- When using yarn v1 with jest, it might be fine on the first `yarn install`. However, when new dependencies are added, the `yarn test` will no longer works.
- As workaround, the code below is added to the `package.json` file
  ```
  "resolutions": {
    "wrap-ansi": "7.0.0",
    "string-width": "4.2.3"
  }
  ```
- OR another workaround is to use `npm` instead of yarn
- OR another workaround is to delete the `yarn.lock` file
- Refer to
  - [\[Bug?\]: Error [ERR_REQUIRE_ESM]: require() of ES Module string-width/index.js](https://github.com/yarnpkg/yarn/issues/8994)
  - [Jest fails to run after installing selenium-webdriver](https://stackoverflow.com/questions/77592704/jest-fails-to-run-after-installing-selenium-webdriver/77592734#77592734)
  - [Error [ERR_REQUIRE_ESM]: require() of ES Module, node_modules\wrap-ansi\index.js not supported](https://stackoverflow.com/questions/77406363/error-err-require-esm-require-of-es-module-node-modules-wrap-ansi-index-js)
