import {
  CONTENT_BOUNDS_WARNING_THRESHOLD,
  PRESET_CONTENT_BOUNDS,
} from "../lib/constant/content-bounds";

describe("content bounds config", () => {
  it("defines bounds for live Chinese preset", () => {
    const bounds = PRESET_CONTENT_BOUNDS["liveChinesePreset"];
    expect(bounds).toBeDefined();
    expect(bounds.widthPercent).toBeGreaterThan(0);
    expect(bounds.widthPercent).toBeLessThan(100);
  });

  it("defines bounds for live English preset", () => {
    const bounds = PRESET_CONTENT_BOUNDS["liveEnglishPreset"];
    expect(bounds).toBeDefined();
    expect(bounds.widthPercent).toBeGreaterThan(0);
    expect(bounds.widthPercent).toBeLessThan(100);
  });

  it("live preset content width is narrower than full slide (has left/right margins)", () => {
    const bounds = PRESET_CONTENT_BOUNDS["liveChinesePreset"];
    // Black bar has ~6% margin on each side → effective width ~88%
    expect(bounds.widthPercent).toBeLessThanOrEqual(92);
  });

  it("warning threshold is between 0 and 1", () => {
    expect(CONTENT_BOUNDS_WARNING_THRESHOLD).toBeGreaterThan(0);
    expect(CONTENT_BOUNDS_WARNING_THRESHOLD).toBeLessThanOrEqual(1);
  });

  it("computes content width px correctly for measurement slide width", () => {
    const MEASUREMENT_SLIDE_WIDTH = 800;
    const bounds = PRESET_CONTENT_BOUNDS["liveChinesePreset"];
    const contentWidthPx = (bounds.widthPercent / 100) * MEASUREMENT_SLIDE_WIDTH;
    const warningThresholdPx = contentWidthPx * CONTENT_BOUNDS_WARNING_THRESHOLD;

    // At 88% content width and 0.9 threshold: warning fires at 79.2% of slide
    expect(contentWidthPx).toBe((bounds.widthPercent / 100) * MEASUREMENT_SLIDE_WIDTH);
    expect(warningThresholdPx).toBeLessThan(MEASUREMENT_SLIDE_WIDTH);
    // Warning threshold must be meaningfully less than full slide width
    expect(warningThresholdPx).toBeLessThan(MEASUREMENT_SLIDE_WIDTH * 0.95);
  });
});
