/**
 * Maps internal preset IDs to the visible content-box width as a percentage
 * of the full slide width.
 *
 * For live presets the background image contains a black bar for lyrics.
 * The bar spans roughly x=6%…94% of the slide (88% effective width).
 *
 * This is the single source of truth for both the CLI and web overflow
 * detectors — background images are always converted to base64 data URLs
 * before the preview config is built, so the preset ID is the only stable
 * identifier available at detection time.
 */
export const PRESET_CONTENT_BOUNDS: Record<string, { widthPercent: number }> = {
  liveChinesePreset: { widthPercent: 88 },
  liveEnglishPreset: { widthPercent: 88 },
};

/**
 * Fraction of the content-box width at which a TEXT_NEAR_BOUNDARY warning is
 * emitted.  0.9 means "warn when the single-line text fills more than 90% of
 * the visible content area", giving roughly a 4–5% slide-width margin before
 * the hard edge.
 */
export const CONTENT_BOUNDS_WARNING_THRESHOLD = 0.97;
