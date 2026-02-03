# PPT Generator User Guide

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Main Lyric Input](#main-lyric-input)
4. [Secondary Lyric Input](#secondary-lyric-input)
5. [Lyric Syntax and Special Markers](#lyric-syntax-and-special-markers)
6. [Advanced Features](#advanced-features)
7. [Toolbar Functions](#toolbar-functions)
8. [Settings](#settings)
9. [Generating Your Presentation](#generating-your-presentation)
10. [Tips and Best Practices](#tips-and-best-practices)

---

## Overview

The **Khen PPT Generator** is a specialized tool designed to simplify the creation of PowerPoint presentations for church praise and worship songs. It automatically formats lyrics with dual language support (typically Chinese with Pinyin), making it ideal for multilingual worship services.

### Key Features

- Dual lyric input (main and secondary languages)
- Automatic Pinyin generation for Chinese lyrics
- Special syntax for covers, sections, and page breaks
- Customizable formatting and styling settings
- Live preview of slides
- Export to PowerPoint (.pptx) format

---

## Getting Started

When you first access the PPT Generator page, you'll see five main sections:

1. **Search Lyrics** (Coming Soon)
2. **Insert Main Lyric** - Your primary lyrics input field
3. **Insert Secondary Lyric** - Your translation/romanization input field
4. **Settings** - Customize the appearance and layout
5. **Generate PPT!** - Create and download your presentation

---

## Main Lyric Input

The main lyric input field is where you'll paste or type your primary lyrics (typically Chinese characters for Chinese songs).

### Main Lyric Toolbar

The main lyric section includes several helpful buttons:

- **Section Insert** - Quickly insert special markers (covers, sections, page breaks)
- **Text Transform** - Apply text transformations
- **Generate Pinyin** - Manually generate Pinyin for selected text or the entire lyric
- **Find and Replace** - Search and replace text throughout your lyrics
- **Copy to Clipboard** - Copy the entire lyric text
- **Clear Text** - Clear all text from the input field
- **Lyric Formatter** - Format lyrics with advanced options
- **Auto Generate Pinyin Switch** - Toggle automatic Pinyin generation on/off

### Quick Commands

Press `/` (forward slash) in the main lyric field to open the quick insert command menu for fast access to special markers.

---

## Secondary Lyric Input

The secondary lyric input field is designed for translations or romanizations (typically Pinyin for Chinese songs).

### Auto-Generated Pinyin

**For Chinese songs (90% of use cases):**

- The secondary field will automatically generate Pinyin from your Chinese lyrics when you enable the "Auto Generate Pinyin" switch
- The Pinyin appears with proper tone marks (e.g., "nǐ shì xíng shén jì de shén")
- This feature saves significant time and ensures accurate romanization

### Secondary Lyric Toolbar

The secondary lyric section includes:

- **Text Transform** - Apply text transformations
- **Find and Replace** - Search and replace text
- **Copy to Clipboard** - Copy the entire secondary lyric text
- **Clear Text** - Clear all text from the input field

---

## Lyric Syntax and Special Markers

The PPT Generator uses special syntax markers to control slide layout and structure. These markers should be placed on their own lines in the **main lyric field**.

### Cover Slides

Use these markers to create cover/title slides. **Both the main title (`#`) and secondary title (`##`) must be on the same line:**

```
# <Main Title> ## <Secondary Title>
```

**Example:**

```
# 行神迹的神 ## God of Miracles
```

This creates a cover slide with:

- Chinese title: 行神迹的神
- English subtitle: God of Miracles

### Empty Slides

```
***
```

Creates a completely empty/blank slide. Useful for transitions or pauses.

### Page Breaks (Fill Slides)

```
**
```

Creates a page break, starting a new slide without any specific content marker.

### Song Sections

```
----
```

Creates a new song section. Use this to separate different songs in a medley or to mark major divisions in your presentation.

**Example:**

```
---- Song 1: Amazing Grace
Amazing grace how sweet the sound
...
---- Song 2: How Great Thou Art
O Lord my God, when I in awesome wonder
...
```

### Subsections

```
---
```

Creates a subsection within a song, typically used to mark verses, choruses, bridges, etc.

**Example:**

```
--- Verse 1
你是行神迹的神
绝望中赐下盼望
```

### Metadata

```
@<key>: <value>
```

Add metadata to control slide-specific settings. Metadata is optional and provides additional control over individual slides or sections.

---

## Advanced Features

### Inline JSON Settings Overwrites

**This is an advanced feature** for power users who need precise control over settings for specific sections without using the UI.

> ⚠️ **Important:** The inline JSON overwrite feature is not yet stable and may have bugs. **The preferred method for adjusting settings is through the UI Settings panel.** Only use inline overwrites if you have specific advanced use cases that require them.

#### What are Inline JSON Overwrites?

Inline JSON overwrites allow you to embed JSON configuration directly in your lyrics to override settings for specific sections. This is useful when:

- You want version-controlled settings that travel with your lyrics
- You need different configurations for different sections that go beyond the UI
- You're sharing lyrics with teammates and want settings to be included
- You want to quickly switch between configurations without manually adjusting UI settings

#### Syntax

Place a JSON object on a single line **immediately after a section marker** (`----`):

```
---- Section Name
{"general":{"presetChosen":"Preset1"},"content":{"main":{"fontSize":24}}}
--- Verse 1
Lyrics go here...
```

The JSON line must:

- Be a complete JSON object starting with `{` and ending with `}`
- Appear on its own line
- Come right after a section header (`----`)
- Use valid JSON syntax (quoted keys and values)

#### Global Overwrites

You can also add global settings that apply to the entire presentation by placing JSON **before the first section**:

```
{"general":{"sectionsAutoNumbering":true,"useDifferentSettingForEachSection":false}}
---- Song 1
...
```

#### What Can Be Overwritten?

**Global Properties:**

- `general.presetChosen` - Apply a specific preset
- `general.useDifferentSettingForEachSection` - Enable/disable per-section settings
- `general.sectionsAutoNumbering` - Enable/disable automatic numbering
- `general.mainBackgroundColor` - Main background color
- `general.mainBackgroundImage` - Main background image path

**Section-Specific Properties:**

- `general.presetChosen` - Use a different preset for this section
- `general.useMainSectionSettings` - Inherit from main settings (true/false)
- `general.sectionBackgroundColor` - Custom background color for this section
- `general.sectionBackgroundImage` - Custom background image for this section
- `content.main.fontSize` - Main lyric font size
- `content.main.fontFace` - Main lyric font
- `content.main.color` - Main lyric color
- `content.secondary.fontSize` - Secondary lyric font size
- `cover.coverTitlePositionY` - Cover title vertical position
- And many more... (any setting visible in the UI can be overridden)

#### Example: Different Presets per Section

```
---- Verse Section
{"general":{"presetChosen":"Default"}}
--- Verse 1
你是行神迹的神
绝望中赐下盼望
---- Chorus Section
{"general":{"presetChosen":"LargeVenue"}}
--- Chorus
你是行神迹的神
绝望中赐下盼望
```

#### Example: Custom Font Size for One Section

```
---- Special Emphasis Section
{"content":{"main":{"fontSize":48},"secondary":{"fontSize":32}}}
--- Bridge
This section will have larger text
To emphasize this part of the song
```

#### Example: Custom Background for a Section

```
---- Song 2
{"general":{"useMainSectionSettings":false,"sectionBackgroundColor":"#1a1a2e"}}
--- Verse 1
This section has a custom dark blue background
```

#### Auto-Generate Overwrites

There's a setting in General Settings called **"Add Overwrite Syntax to Lyrics Automatically"** (`autoOutputOverwrite`):

- When **enabled**: The tool automatically inserts JSON overwrites into your lyrics based on your current UI settings
- This is useful for:
  - Saving your current UI configuration directly into the lyrics
  - Sharing lyrics with embedded settings
  - Version controlling your presentation settings
- When **disabled**: You manage overwrites manually or remove all auto-generated JSON

**How to use it:**

1. Configure your settings in the UI as desired
2. Enable "Add Overwrite Syntax to Lyrics Automatically"
3. The tool will insert JSON overwrites after each section marker
4. Copy the lyrics (now with embedded settings) to save or share

#### Priority of Settings

Settings are applied in this priority order (lowest to highest):

1. **Default settings** - Built-in defaults
2. **Preset settings** - Settings from selected preset
3. **UI settings** - Manual adjustments in the settings panel
4. **Global JSON overwrites** - JSON before first section
5. **Section-specific JSON overwrites** - JSON after section markers (highest priority)

This means section-specific JSON overwrites will always take precedence over all other settings.

#### Tips for Using Inline Overwrites

1. **Prefer the UI Settings panel** - This is the recommended and stable way to adjust settings. Only use inline overwrites for advanced use cases
2. **Start with UI, then export** - Configure in the UI first, then enable auto-output to generate JSON
3. **Keep it minimal** - Only override settings that differ from your preset
4. **Use comments in separate notes** - JSON doesn't support comments, so keep a separate note file for documentation
5. **Validate JSON** - Use a JSON validator if you're writing overwrites manually
6. **Test with preview** - Always generate a preview to verify your overwrites work as expected
7. **Be aware of instability** - This feature may have bugs; report any issues you encounter

#### Troubleshooting JSON Overwrites

**Overwrites not working?**

- Ensure JSON is valid (use a JSON validator)
- Check that JSON line is immediately after a section marker
- Verify property paths match the settings structure (e.g., `content.main.fontSize`, not `content.fontSize`)

**Unexpected behavior?**

- Check the priority order - section overwrites have highest priority
- Look for multiple JSON lines that might conflict
- Ensure boolean values are lowercase (`true`/`false`, not `True`/`False`)

**Want to remove all overwrites?**

- Disable "Add Overwrite Syntax to Lyrics Automatically"
- The tool will strip all JSON overwrite lines from your lyrics

---

## Toolbar Functions

### Section Insert Dropdown

Click this button to access a dropdown menu with all special markers:

- Section (`----`)
- Sub Section (`---`)
- Main Title (`#`)
- Secondary Title (`##`)
- Empty Slide (`***`)
- Fill Slide (`**`)

Select one to insert it at your cursor position.

**Note:** For cover slides, Main Title (`#`) and Secondary Title (`##`) must be on the same line: `# Title ## Subtitle`

### Text Transform Dropdown

Apply various text transformations to selected text or the entire lyric:

- Convert to uppercase
- Convert to lowercase
- Convert to title case
- Convert to simplified Chinese
- Convert to traditional Chinese
- And more...

### Generate Pinyin Dropdown

Options for generating Pinyin from Chinese text:

- Generate for entire text
- Generate for selected text only
- Choose tone mark style (with or without)

### Find and Replace

Open a search bar to:

- Find specific words or phrases
- Replace them with alternative text
- Navigate through matches
- Replace all occurrences at once

### Copy to Clipboard

Quickly copy all text from the current input field to your clipboard.

### Clear Text

Remove all text from the input field. Use with caution as this action cannot be undone easily.

### Lyric Formatter

Access advanced formatting options to clean up and structure your lyrics.

### Auto Generate Pinyin Switch

**For Chinese lyrics users:**

- Toggle this switch ON to automatically generate Pinyin in the secondary field as you type
- The system will detect Chinese characters and create proper Pinyin romanization
- Custom pinyin mappings are included for common worship terms
- This is typically kept ON for 90% of use cases (Chinese songs)

---

## Settings

Click **"Open Settings"** to access the comprehensive settings panel. Settings are organized into tabs:

### General Settings

Controls global presentation settings:

- **Use Different Settings for Each Section** - Enable this to have unique formatting for different song sections (e.g., different colors for verse vs chorus)
  - **Common use case:** When ONE song has lyrics that are too long and needs a smaller font size while other songs are fine with the default settings
  - Allows you to customize settings per section without affecting the entire presentation
- Slide dimensions and layout
- Default fonts and sizes
- Transition effects
- Background settings
- And more...

### Content Settings

Controls how lyric content appears on slides:

- **Main Lyric Formatting** - Font, size, color, alignment, spacing
- **Secondary Lyric Formatting** - Font, size, color, alignment, spacing
- **Line Count per Textbox** - How many lines appear in each textbox
- **Textbox Count per Content per Slide** - How many textboxes per slide
- Text positioning
- Shadow and outline effects
- And more...

#### Understanding Lines Per Slide

The number of lyric lines displayed per slide is calculated as:

**Total Lines per Slide = Line Count per Textbox × Textbox Count per Content per Slide**

**Examples:**

1. **Default Configuration:**
   - Line Count per Textbox: `1`
   - Textbox Count per Content per Slide: `2`
   - **Result:** 2 lines per slide (1 × 2 = 2)

2. **More Lines per Slide:**
   - Line Count per Textbox: `2`
   - Textbox Count per Content per Slide: `2`
   - **Result:** 4 lines per slide (2 × 2 = 4)

3. **Single Line per Slide:**
   - Line Count per Textbox: `1`
   - Textbox Count per Content per Slide: `1`
   - **Result:** 1 line per slide (1 × 1 = 1)

**How to determine what a slide will look like:**

- If you set Line Count per Textbox to `2` and Textbox Count to `2`, each slide will display 4 lyric lines total
- The tool creates separate textboxes for visual layout control
- Each textbox contains the specified number of lines
- This applies to both main lyrics (Chinese) and secondary lyrics (Pinyin) independently

**Practical Tips:**

- Start with the default (1 line per textbox, 2 textboxes per slide = 2 lines total)
- Increase Line Count per Textbox if you want more compact slides
- Adjust Textbox Count to change the overall density of text on slides
- Preview your changes to see how lyrics are distributed across slides

### Cover Settings

Controls how cover/title slides appear:

- **Main Title Formatting** - Font, size, color, alignment
- **Secondary Title Formatting** - Font, size, color, alignment
- Background image or color
- Title positioning
- And more...

### Section-Specific Settings

When "Use Different Settings for Each Section" is enabled:

- Click on a section name in the sidebar
- Customize settings specifically for that section
- Choose to use main settings or override with custom settings per section

### Presets

The tool includes preset configurations for common scenarios:

- Default preset
- Large venue preset
- Minimalist preset
- Custom presets (if you've saved any)

Select a preset to quickly apply a complete set of settings.

**Important Note:**
Presets work well for the **majority of use cases** and you typically won't need to adjust individual settings. The main exceptions are:

- **Long titles on cover slides** - You may need to adjust the cover title position Y (move it up or down) or reduce the font size to fit longer song titles
- **Title positioning tweaks** - When titles don't align perfectly with your background image or design
- **Font size adjustments** - When text is slightly too large or small for your specific venue/screen

For most presentations, simply select a preset and generate - only dive into detailed settings when you need these specific tweaks.

### Import/Export Settings

- **Export Settings** - Save your current configuration as a JSON file
- **Import Settings** - Load a previously saved configuration
- Share settings with team members for consistent presentation styles

---

## Generating Your Presentation

Once you've entered your lyrics and configured your settings:

1. **Generate Preview** - Click this button to see a preview of your slides
   - Review the layout and formatting
   - Check that lyrics are properly split across slides
   - Verify special markers are working correctly

2. **Adjust if Needed** - Make any necessary changes to:
   - Lyric text
   - Settings
   - Section markers

3. **Generate PPT** - Click the final generate button to:
   - Create your PowerPoint presentation
   - Download the .pptx file
   - Open it in PowerPoint, Google Slides, or compatible software

---

## Tips and Best Practices

### For Chinese Songs

1. **Enable Auto Generate Pinyin** early to save time
2. Paste Chinese lyrics first, let Pinyin generate automatically
3. Review generated Pinyin for accuracy (especially for worship-specific terms)
4. Use the **Generate Pinyin** button if auto-generation is off

### Structuring Your Lyrics

1. **Use consistent subsection markers** (`---`) for verses and choruses:

   ```
   --- Verse 1
   [lyrics]
   --- Chorus
   [lyrics]
   --- Verse 2
   [lyrics]
   --- Chorus
   [lyrics]
   ```

2. **Separate multiple songs** with section markers (`----`):

   ```
   ---- Song Title 1
   [lyrics]
   ---- Song Title 2
   [lyrics]
   ```

3. **Add covers for each song** in a medley:

   ```
   # Song Title 1 ## Song Alternative Title
   [lyrics]
   # Song Title 2 ## Song Alternative Title
   [lyrics]
   ```

### Using Empty Slides

- Place `***` between songs for a visual break
- Use before prayer segments
- Insert for instrumental breaks where lyrics aren't needed

### Preview Before Generating

- Always click "Generate Preview" before final PPT generation
- Check that text fits within slides
- Verify colors are readable against backgrounds
- Ensure fonts display correctly

### Settings Management

1. **Use the UI Settings panel** for all configuration (recommended and stable)
2. **Save your favorite configurations** as presets
3. **Export settings** for backup before major changes
4. **Use section-specific settings** when you need:
   - Different colors for verse vs chorus
   - Larger text for specific emphasized sections
   - Alternative fonts for different songs
5. **Use inline JSON overwrites** (advanced, not stable) when you need:
   - Version-controlled settings that travel with lyrics
   - To share lyrics with embedded configurations
   - Precise control over individual section settings
   - Quick switching between configurations without UI adjustments
   - Note: This feature may have bugs; use with caution

### Font Recommendations

- **Chinese lyrics**: Microsoft YaHei (微软雅黑) - included by default
- **Pinyin/English**: Calibri, Arial, or Ebrima - for clean readability
- **Ensure fonts are installed** on the computer that will present the PPT

### Understanding Lines Per Slide

- The tool automatically handles line breaks based on your settings
- **Total lines per slide** = Line Count per Textbox × Textbox Count per Content per Slide
- Default is 2 lines per slide (1 line per textbox × 2 textboxes)
- Adjust these settings if lyrics are too crowded or too sparse:
  - **Increase Line Count per Textbox** for more compact slides
  - **Increase Textbox Count** for higher text density
  - **Decrease either value** for more spacious, easier-to-read slides
- Manual line breaks in your input text are respected
- Always preview after changing these settings to see the distribution

### Handling Long Lyrics

When lyrics are too long and the slide format breaks or text overflows:

**Step-by-step approach:**

1. **Break lines into smaller phrases** - Split long lyric lines into shorter, meaningful phrases that are easier to read
2. **Split content across slides** - Add line breaks to distribute lyrics across 2 or more slides naturally
3. **Reduce font size** - As a last resort, decrease the font size in Content Settings

**For individual problematic songs:**

If only **one song** in your presentation has formatting issues:

1. Enable **"Use Different Settings for Each Section"** in General Settings
2. Click on that specific song section in the settings sidebar
3. Customize the font size or other settings for that section only
4. Other songs will maintain their original formatting

This approach prevents you from making everything smaller when only one song needs adjustment.

### Troubleshooting

**Pinyin not generating?**

- Check that Auto Generate Pinyin switch is ON
- Verify your text contains Chinese characters
- Try manual generation with the "Generate Pinyin" button

**Text too large or small on slides?**

- Adjust font size in Content Settings
- Check lines per slide setting
- Consider using section-specific settings for problematic sections

**Lyrics too long and breaking the format?**

If your lyrics are too long and the slide format breaks, try these solutions in order:

1. **Break lines into smaller, meaningful phrases** - Edit your lyrics to split long lines into shorter, natural phrases
2. **Split into 2 slides** - Add a blank line or adjust line breaks to distribute lyrics across multiple slides
3. **Reduce font size** - If the above doesn't work, make the font size smaller in Content Settings

**If this happens to only ONE specific song:**

1. Enable **"Use Different Settings for Each Section"** in General Settings
2. Navigate to that specific song section in the settings sidebar
3. Adjust the font size or other settings for that section only
4. This way, other songs maintain their original formatting while the problematic song gets custom settings

**Cover not appearing?**

- Ensure you're using `#` and `##` on the **same line** (e.g., `# Title ## Subtitle`)
- Check that there's text after both markers
- Verify Cover settings are properly configured

**Cover title too long or poorly positioned?**

- Go to Cover Settings and adjust **"Position Y (%)"** to move the title up or down
- Reduce the **title font size** if the text is too large for the slide
- Adjust **title alignment** (left, center, right) for better positioning
- These are the most common adjustments needed beyond preset defaults

**Preview not updating?**

- Make sure to click "Generate Preview" after making changes
- Wait for processing to complete (large presentations may take a moment)

---

## Example Workflow

Here's a complete example of creating a PPT for a Chinese worship song:

### Step 1: Paste Main Lyrics

```
# 行神迹的神 ## God of Miracles
--- Verse 1
你是行神迹的神
绝望中赐下盼望
--- Chorus
你是行神迹的神
绝望中赐下盼望
```

### Step 2: Enable Auto-Generate Pinyin

The secondary field automatically populates:

```
# xíng shén jì de shén ## God of Miracles
--- Verse 1
nǐ shì xíng shén jì de shén
jué wàng zhōng cì xià pàn wàng
--- Chorus
nǐ shì xíng shén jì de shén
jué wàng zhōng cì xià pàn wàng
```

### Step 3: Configure Settings

- Open Settings
- Select appropriate preset or customize
- Set fonts, colors, background
- Adjust text sizes

### Step 4: Generate Preview

- Click "Generate Preview"
- Review slides
- Make adjustments if needed

### Step 5: Generate PPT

- Click "Generate PPT!"
- Download your presentation
- Present with confidence!

---

## Summary

The Khen PPT Generator streamlines the creation of multilingual worship presentations by:

1. **Automating Pinyin generation** for Chinese lyrics
2. **Providing special syntax** for structure and formatting
3. **Offering comprehensive customization** through settings
4. **Enabling preview and iteration** before final generation
5. **Exporting professional PowerPoint** presentations ready for worship services

Whether you're preparing for weekly services, special events, or teaching sessions, this tool helps you create polished, readable lyrics presentations efficiently.

---

**Need Help?** If you encounter issues or have questions not covered in this guide, please reach out to the development team or consult the project documentation.

**Happy Presenting! 🎵**
