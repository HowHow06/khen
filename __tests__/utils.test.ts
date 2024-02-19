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
        singleLineMode: false,
      },
      [SETTING_CATEGORY.FILE]: {},
      [SETTING_CATEGORY.CONTENT]: {
        [CONTENT_TYPE.MAIN]: {},
        [CONTENT_TYPE.SECONDARY]: {},
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
