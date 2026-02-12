# PPT Generator Presets

This folder contains pre-configured settings presets for the CLI PPT generator.

## Available Presets

| Preset | File | Description |
|--------|------|-------------|
| Onsite Chinese | `onsite-chinese.json` | Full-screen presentation for Chinese songs with pinyin, 2 textboxes per slide |
| Live Chinese | `live-chinese.json` | Green screen overlay for live streaming Chinese songs, positioned at bottom |
| Onsite English | `onsite-english.json` | Full-screen presentation for English songs, single textbox with 2 lines |
| Live English | `live-english.json` | Green screen overlay for live streaming English songs, positioned at bottom |

## Usage

Use these presets with the `--config` option:

```bash
# Chinese song for onsite projection
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main lyrics.txt \
  --config scripts/presets/onsite-chinese.json

# Chinese song for live streaming
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main lyrics.txt \
  --config scripts/presets/live-chinese.json

# English song for onsite projection
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main lyrics.txt \
  --config scripts/presets/onsite-english.json

# English song for live streaming
npx tsx scripts/generate-ppt-from-lyrics.ts \
  --main lyrics.txt \
  --config scripts/presets/live-english.json
```

## Preset Details

### Onsite Presets
- **Background**: Solid black (`#000000`)
- **Text**: White with drop shadow
- **Position**: Centered on screen
- **Use case**: Direct projection in venue

### Live Presets
- **Background**: Green screen with black cover overlay
- **Text**: White with drop shadow, positioned at bottom
- **Filename**: Automatically appends `(live)` suffix
- **Use case**: Overlay on live stream video

### Chinese vs English
- **Chinese**: Uses Microsoft YaHei font, includes secondary textbox for pinyin
- **English**: Uses Ebrima/Segoe Print fonts, ignores secondary content by default

## Customization

You can copy any preset and modify it to create your own configuration. See the [CLI Guide](../../docs/CLI_PPT_GENERATOR_GUIDE.md) for details on all available settings.
