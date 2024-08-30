import { useAlertDialog } from "@/components/context/AlertDialogContext";
import { useOptionsDialog } from "@/components/context/OptionsDialogContext";
import { MAIN_SECTION_NAME, PPT_GENERATION_SETTINGS_META } from "../constant";
import { DIALOG_RESULT } from "../constant/general";

const usePromptImportSettings = () => {
  const { showOptionsDialog } = useOptionsDialog();
  const { showDialog: showAlertDialog } = useAlertDialog();
  const promptToGetFullSettingsImportOptions = async ({
    currentSectionName,
  }: {
    currentSectionName: string;
  }) => {
    let isApplyToSection = false;
    let isPreserveUseDifferentSetting = true;
    let isToPreserveExistingSectionSetting = true;

    if (currentSectionName !== MAIN_SECTION_NAME) {
      const result = await showOptionsDialog("Apply settings to:", {
        optionItems: [
          {
            text: "Main Section",
            value: "main-section",
          },
          {
            text: `Current Section`,
            value: "current-section",
          },
        ],
      });
      if (result === DIALOG_RESULT.CANCEL) {
        return;
      }
      isApplyToSection = result === "current-section";
    }

    if (currentSectionName === MAIN_SECTION_NAME || !isApplyToSection) {
      let result = await showOptionsDialog(
        `Override the value of "${PPT_GENERATION_SETTINGS_META.general.useDifferentSettingForEachSection.fieldDisplayName}" field?`,
        {
          optionItems: [
            {
              text: "Yes",
              value: "yes",
            },
            {
              text: `No`,
              value: "no",
              variant: "default",
            },
          ],
        },
      );
      if (result === DIALOG_RESULT.CANCEL) {
        return;
      }
      isPreserveUseDifferentSetting = result === "no";

      // result = await showOptionsDialog(`Preserve section settings values?`, {
      //   optionItems: [
      //     {
      //       text: "Yes",
      //       value: "yes",
      //       variant: "default",
      //     },
      //     {
      //       text: `No`,
      //       value: "no",
      //     },
      //   ],
      // });
      // if (result === DIALOG_RESULT.CANCEL) {
      //   return;
      // }
      // isToPreserveExistingSectionSetting = result === "yes"; // default to preserve existing section setting
    }

    return {
      isApplyToSection,
      isPreserveUseDifferentSetting,
      isToPreserveExistingSectionSetting,
    };
  };

  const promptToGetSettingsExportOptions = async ({
    hasSectionSettings,
    currentSectionName,
  }: {
    hasSectionSettings: boolean;
    currentSectionName: string;
  }) => {
    const result = await showAlertDialog("Please be informed.", {
      description: "The background image will not be exported.",
    });
    if (result === DIALOG_RESULT.CANCEL) {
      return;
    }

    let isIncludeSectionSettings = false;
    let isExportSectionSettings = false;

    if (currentSectionName !== MAIN_SECTION_NAME) {
      const result = await showOptionsDialog(
        `Export which of the following? `,
        {
          optionItems: [
            {
              text: "Main Section",
              value: "main-section",
            },
            {
              text: `Current Section`,
              value: "current-section",
            },
          ],
        },
      );

      if (result === DIALOG_RESULT.CANCEL) {
        return;
      }
      isExportSectionSettings = result === "current-section";
    }

    // if (
    //   hasSectionSettings &&
    //   (currentSectionName === MAIN_SECTION_NAME ||
    //     (currentSectionName !== MAIN_SECTION_NAME && !isExportSectionSettings))
    // ) {
    //   const result = await showOptionsDialog(
    //     `To include sections settings in the export?`,
    //     {
    //       optionItems: [
    //         {
    //           text: "Yes",
    //           value: "yes",
    //         },
    //         {
    //           text: `No`,
    //           value: "no",
    //           variant: "default",
    //         },
    //       ],
    //     },
    //   );
    //   if (result === DIALOG_RESULT.CANCEL) {
    //     return;
    //   }
    //   isIncludeSectionSettings = result === "yes"; // default to not to include section settings
    // }

    return {
      isIncludeSectionSettings,
      isExportSectionSettings,
    };
  };

  return {
    promptToGetFullSettingsImportOptions,
    promptToGetSettingsExportOptions,
  };
};

export default usePromptImportSettings;
