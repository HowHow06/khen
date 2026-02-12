# CLI PPT Generator Guide

This guide explains how to use the command-line interface (CLI) script to generate PowerPoint presentations from lyrics files without using the web application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Command Line Options](#command-line-options)
- [Usage Examples](#usage-examples)
- [Configuration File](#configuration-file)
- [Lyrics File Format](#lyrics-file-format)
- [Preview Mode](#preview-mode)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before using the CLI script, ensure you have:

1. **Node.js** version 20.9.0 or higher installed
2. **Dependencies installed** - Run `npm install` in the project root

You can verify your Node.js version with:

```bash
node --version  # Should output v20.x.x or higher
```

---

## Quick Start

The simplest way to generate a PPT from a lyrics file:

```bash
npx tsx scripts/generate-ppt-from-lyrics.ts --main path/to/lyrics.txt
```

This will:

- Read the lyrics from the specified file
- Generate a PowerPoint presentation with default settings
- Save the `.pptx` file in the current directory

---

## Command Line Options

| Option        | Short | Required | Default                       | Description                                               |
| ------------- | ----- | -------- | ----------------------------- | --------------------------------------------------------- |
| `--main`      | `-m`  | Yes      | -                             | Path to the main lyrics file                              |
| `--secondary` | `-s`  | No       | Same as main                  | Path to secondary lyrics file (e.g., pinyin, translation) |
| `--config`    | `-c`  | No       | Default settings              | Path to a settings JSON file                              |
| `--output`    | `-o`  | No       | Current directory (`.`)       | Output directory for generated files                      |
| `--filename`  | `-f`  | No       | Auto-generated with timestamp | Output filename (without extension)                       |
| `--preview`   | `-p`  | No       | `false`                       | Generate preview JSON instead of PPT                      |
| `--help`      | `-h`  | No       | -                             | Display help message                                      |

### View Help

To see all available options:

```bash
npx tsx scripts/generate-ppt-from-lyrics.ts --help
```

---

## Usage Examples

### Basic Usage

Generate a PPT from a single lyrics file:

```bash
npx tsx scripts/generate-ppt-from-lyrics.ts --main songs/amazing-grace.txt
```

### With Secondary Lyrics

Generate a PPT with main lyrics and secondary content (e.g., pinyin or translation):

```bash
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main songs/chinese-song.txt \
  --secondary songs/chinese-song-pinyin.txt
```

### Custom Output Location

Save the generated PPT to a specific directory:

```bash
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main songs/worship.txt \
  --output ./generated-ppts
```

### Custom Filename

Specify a custom filename for the output:

```bash
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main songs/worship.txt \
  --filename "Sunday Worship Songs"
```

### With Custom Settings

Use a custom configuration file:

```bash
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main songs/worship.txt \
  --config my-settings.json
```

### Full Example

Combining all options:

```bash
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main songs/chinese-hymn.txt \
  --secondary songs/chinese-hymn-pinyin.txt \
  --config church-settings.json \
  --output ./sunday-service \
  --filename "2024-01-07 Hymns"
```

---

## Configuration File

You can export settings from the web application and use them with the CLI script.

### Exporting Settings from Web App

1. Open the PPT Generator web application
2. Configure your desired settings (fonts, colors, layout, etc.)
3. Click the export settings button to download a JSON file
4. Use this JSON file with the `--config` option

### Settings File Structure

A settings JSON file has the following structure:

```json
{
  "general": {
    "mainBackgroundColor": "#000000",
    "sectionsAutoNumbering": true,
    "lineCountPerTextbox": 1,
    "textboxCountPerContentPerSlide": 2
  },
  "file": {
    "filename": "My Presentation",
    "filenamePrefix": "",
    "filenameSuffix": ""
  },
  "content": {
    "main": {
      "text": {
        "mainFontFace": "Microsoft YaHei",
        "mainFontSize": 44,
        "mainFontColor": "#FFFFFF"
      }
    }
  },
  "cover": {
    "main": {
      "coverTitleFont": "Microsoft YaHei",
      "coverTitleFontSize": 80
    }
  }
}
```

> **Note:** You don't need to specify all settings. Any missing settings will use default values.

---

## Lyrics File Format

The lyrics file uses a simple text format with special markers for sections and formatting.

### Basic Format

```
---- Song Title
# 奇异恩典
--- Verse 1
奇异恩典 何等甘甜
我罪已得赦免
--- Chorus
赞美主 赞美主
全地都当赞美主
***
```

### Special Markers

| Marker | Description |
|--------|-------------|
| `----` | Section marker - creates a new song section (4 dashes) |
| `---` | Subsection marker - marks verse, chorus, bridge, etc. (3 dashes) |
| `# Title` | Cover slide main title |
| `# Title ## Subtitle` | Cover slide with main and secondary title |
| `***` | Creates an empty/blank slide |
| `**` | Page break - starts a new slide |

### Example Structure

```
---- 奇异恩典
# 奇异恩典
--- 第一节
奇异恩典 何等甘甜
我罪已得赦免
前我失丧 今被寻回
瞎眼今得看见
--- 副歌
赞美主 赞美主
全地都当赞美主
--- 结尾
奇异恩典 何等甘甜
我罪已得赦免
***
```

### Inline Settings Override

You can override settings for specific sections using JSON blocks placed immediately after a section marker (`----`):

```
---- Song Section
{"general":{"presetChosen":"Preset1"}}
--- Verse 1
Lyrics go here...
```

For more details on lyrics formatting, see the [PPT Generator User Guide](./PPT_GENERATOR_USER_GUIDE.md).

---

## Preview Mode

Preview mode generates a JSON file containing information about the slides that would be created, without generating the actual PPT file. This is useful for:

- Verifying your lyrics file is structured correctly
- Checking how many slides will be generated
- Debugging issues with your configuration

### Generate Preview

```bash
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main songs/worship.txt \
  --preview
```

### Preview Output

The preview JSON contains:

```json
{
  "layout": "LAYOUT_16x9",
  "slideCount": 12,
  "sections": [
    { "title": "Verse 1", "slideCount": 3 },
    { "title": "Chorus", "slideCount": 2 }
  ],
  "slides": [
    { "index": 1, "name": "Slide 1", "objectCount": 2, "hasBackground": false },
    { "index": 2, "name": "Slide 2", "objectCount": 4, "hasBackground": false }
  ],
  "settings": {
    "general": {
      "useDifferentSettingForEachSection": false,
      "sectionsAutoNumbering": true
    },
    "file": {
      "filename": "worship",
      "filenamePrefix": "",
      "filenameSuffix": ""
    }
  }
}
```

---

## Troubleshooting

### Common Issues

#### "Main lyrics file is required"

You must provide a lyrics file using the `--main` option:

```bash
# Wrong
npx tsx scripts/generate-ppt-from-lyrics.ts

# Correct
npx tsx scripts/generate-ppt-from-lyrics.ts --main lyrics.txt
```

#### "Could not load config file"

The configuration file path is incorrect or the file contains invalid JSON:

1. Verify the file path is correct
2. Validate your JSON using a JSON validator
3. Ensure the file is readable

#### Output directory doesn't exist

The script does not create directories automatically. Create the output directory first:

```bash
mkdir -p ./output
npx tsx scripts/generate-ppt-from-lyrics.ts --main lyrics.txt --output ./output
```

#### Node.js version error

Ensure you're using Node.js 20.9.0 or higher:

```bash
# Check version
node --version

# If using nvm
nvm use 22

# If using nvs
nvs use 22
```

### Debug Output

The script may output some debug information during generation (like `parsedOverwrites` and `logging mergedSettings`). This is normal behavior from the underlying library and can be ignored.

---

## Sample Files

Sample files are provided to help you get started:

```
scripts/samples/
├── sample-lyrics-chinese.txt  # Chinese lyrics example (奇异恩典)
├── sample-settings.json       # Sample configuration file
└── README.md                  # Quick start guide for samples
```

Try generating a PPT with the sample files:

```bash
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main scripts/samples/sample-lyrics-chinese.txt \
  --config scripts/samples/sample-settings.json \
  --output scripts/samples \
  --filename "奇异恩典"
```

---

## See Also

- [Sample Files README](../scripts/samples/README.md) - Quick start with sample files
- [PPT Generator User Guide](./PPT_GENERATOR_USER_GUIDE.md) - Full documentation for the web application
- [AGENTS.md](../AGENTS.md) - Development guidelines and project overview
