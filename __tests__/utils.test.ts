import {
  CONTENT_TYPE,
  PPT_GENERATION_SETTINGS_META,
  SETTING_CATEGORY,
} from "@/lib/constant";
import { PptSettingsStateType } from "@/lib/types";
import { deepMerge, generatePptSettingsInitialState } from "@/lib/utils";

describe("deepMerge Functionality", () => {
  it("should merge nested values", () => {
    const initialState = generatePptSettingsInitialState(
      PPT_GENERATION_SETTINGS_META,
    );
    const testPreset: PptSettingsStateType = {
      [SETTING_CATEGORY.GENERAL]: {
        mainBackgroundImage: null,
        mainBackgroundColor: "#F12345",
        separateSectionsToFiles: false,
        useBackgroundColorWhenEmpty: true,
        ignoreSubcontent: false,
        // ignoreSubcontentWhenIdentical: true, // default is true
        sectionsAutoNumbering: false, // default is true
        textboxCountPerContentPerSlide: 2,
      },
      [SETTING_CATEGORY.FILE]: {},
      [SETTING_CATEGORY.CONTENT]: {
        [CONTENT_TYPE.MAIN]: {
          textbox: {},
        },
        [CONTENT_TYPE.SECONDARY]: {
          textbox: {},
        },
      },
      [SETTING_CATEGORY.COVER]: {
        [CONTENT_TYPE.MAIN]: {},
        [CONTENT_TYPE.SECONDARY]: {},
      },
    };
    const result = deepMerge(initialState, testPreset) as PptSettingsStateType;

    expect(result.general.ignoreSubcontentWhenIdentical).toEqual(true);
    expect(result.general.mainBackgroundColor).toEqual("#F12345");
    expect(result.general.sectionsAutoNumbering).toEqual(false);
  });
});

// describe("generatePptSettingsInitialState Functionality", () => {
//   it("should produce the same output for original and optimized functions", () => {
//     const input = PPT_GENERATION_SETTINGS_META;
//     const originalOutput = generatePptSettingsInitialState(input);
//     const optimizedOutput = generatePptSettingsInitialStateOptimized(input); // Assuming you have an optimized version

//     expect(optimizedOutput).toEqual(originalOutput);
//   });

//   // Add more tests as necessary
// });
