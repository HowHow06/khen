import {
  CONTENT_TYPE,
  DEFAULT_GROUPING_NAME,
  DEFAULT_LINE_COUNT,
  PPT_GENERATION_CONTENT_SETTINGS,
  SETTING_CATEGORY,
  TEXTBOX_GROUPING_PREFIX,
} from "../constant";
import {
  GroupedSettingsValueType,
  PptGenerationSettingMetaType,
  PptSettingsStateType,
} from "../types";

export const generatePptSettingsInitialState = (
  settings: PptGenerationSettingMetaType,
): PptSettingsStateType => {
  const initialState: PptSettingsStateType = {
    [SETTING_CATEGORY.GENERAL]: {},
    [SETTING_CATEGORY.CONTENT]: {
      [CONTENT_TYPE.MAIN]: {},
      [CONTENT_TYPE.SECONDARY]: {},
    },
    [SETTING_CATEGORY.COVER]: {
      [CONTENT_TYPE.MAIN]: {},
      [CONTENT_TYPE.SECONDARY]: {},
    },
    [SETTING_CATEGORY.FILE]: {},
  };

  Object.entries(settings).forEach(([category, settingsMeta]) => {
    if (
      category == SETTING_CATEGORY.GENERAL ||
      category == SETTING_CATEGORY.FILE
    ) {
      Object.entries(settingsMeta).forEach(([key, setting]) => {
        if (setting.isHidden) {
          return;
        }
        if (setting.defaultValue !== undefined) {
          initialState[category] = {
            ...initialState[category],
            [setting.fieldKey]: setting.defaultValue,
          };
        }
      });
    }
    if (category == SETTING_CATEGORY.CONTENT) {
      Object.values(CONTENT_TYPE).forEach((contentType) => {
        initialState[category][contentType] = {};
        Object.entries(settingsMeta).forEach(([key, setting]) => {
          if (setting.isHidden || setting.defaultValue === undefined) {
            return;
          }
          const groupingName = setting.groupingName || DEFAULT_GROUPING_NAME;
          // // TODO: consider remove this checking
          // if (!(groupingName in initialState[category][contentType])) {
          //   initialState[category][contentType] = {
          //     ...initialState[category][contentType],
          //     [groupingName]: {},
          //   };
          // }
          const originalGroupingObject =
            initialState[category][contentType][
              groupingName as keyof GroupedSettingsValueType<
                typeof PPT_GENERATION_CONTENT_SETTINGS
              >
            ];
          initialState[category][contentType] = {
            ...initialState[category][contentType],
            [groupingName]: {
              ...originalGroupingObject,
              [setting.fieldKey]: setting.defaultValue,
            },
          };
        });
        Array.from({ length: DEFAULT_LINE_COUNT }).forEach((_, index) => {
          Object.entries(settings.contentTextbox).forEach(([key, setting]) => {
            if (setting.isHidden || setting.defaultValue === undefined) {
              return;
            }

            const groupingName = `${TEXTBOX_GROUPING_PREFIX}${index + 1}`;
            // if (!initialState[category][contentType][groupingName]) {
            //   initialState[category][contentType][groupingName] = {};
            // }
            const originalGroupingObject =
              initialState[category][contentType][
                groupingName as keyof GroupedSettingsValueType<
                  typeof PPT_GENERATION_CONTENT_SETTINGS
                >
              ];
            initialState[category][contentType] = {
              ...initialState[category][contentType],
              [groupingName]: {
                ...originalGroupingObject,
                [setting.fieldKey]: setting.defaultValue,
              },
            };
          });
        });
      });
    }
    if (category == SETTING_CATEGORY.COVER) {
      Object.values(CONTENT_TYPE).forEach((contentType) => {
        const categoryName = category;
        initialState[categoryName][contentType] = {};
        Object.entries(settingsMeta).forEach(([key, setting]) => {
          if (setting.isHidden || setting.defaultValue === undefined) {
            return;
          }
          initialState[categoryName][contentType] = {
            ...initialState[categoryName][contentType],
            [setting.fieldKey]: setting.defaultValue,
          };
        });
      });
    }
    // TODO: implement initial value for content
    // TODO: define for other categories
  });

  return initialState;
};

// export const generatePpt = ({
//   settingValues,
// }: {
//   settingValues: PptSettingsFormValueType;
// }) => {
//   settingValues;
// };
