# Sample Files for CLI PPT Generator

This folder contains sample files to help you get started with the CLI PPT Generator.

## Files

| File | Description |
|------|-------------|
| `sample-lyrics-chinese.txt` | Chinese lyrics example (奇异恩典 / Amazing Grace) |
| `sample-settings.json` | Sample configuration file with common settings |

## Quick Start

Run from the project root directory:

```bash
# Generate PPT with sample lyrics
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main scripts/samples/sample-lyrics-chinese.txt \
  --output scripts/samples \
  --filename "奇异恩典"

# Generate PPT with custom settings
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main scripts/samples/sample-lyrics-chinese.txt \
  --config scripts/samples/sample-settings.json \
  --output scripts/samples

# Generate preview JSON
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main scripts/samples/sample-lyrics-chinese.txt \
  --preview \
  --output scripts/samples
```

## Customizing Settings

The `sample-settings.json` file contains commonly used settings. You can modify:

- **Background color**: Change `general.mainBackgroundColor`
- **Font settings**: Modify values in `content.main.text` and `content.secondary.text`
- **Shadow effects**: Adjust `content.main.shadow` settings
- **Cover slide**: Customize `cover.main` for title slides

For a complete list of available settings, export settings from the web application or refer to the [CLI PPT Generator Guide](../../docs/CLI_PPT_GENERATOR_GUIDE.md).
