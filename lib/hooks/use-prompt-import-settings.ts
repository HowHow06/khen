import { useOptionsDialog } from "@/components/context/OptionsDialogContext";
import {
  MAIN_SECTION_NAME,
  PPT_GENERATION_GENERAL_SETTINGS,
} from "../constant";
import { DIALOG_RESULT } from "../constant/general";

const usePromptImportSettings = () => {
  const { showOptionsDialog } = useOptionsDialog();
  const promptToGetFullSettingsImportOptions = async ({
    hasSectionSettings,
    currentSectionName,
  }: {
    hasSectionSettings: boolean;
    currentSectionName: string;
  }) => {
    let isApplyToSection = false;
    let isPreserveUseDifferentSetting = true;
    let isToPreserveExistingSectionSetting = true;

    if (hasSectionSettings && currentSectionName !== MAIN_SECTION_NAME) {
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

    if (
      hasSectionSettings &&
      (currentSectionName === MAIN_SECTION_NAME || !isApplyToSection)
    ) {
      let result = await showOptionsDialog(
        `Override the value of "${PPT_GENERATION_GENERAL_SETTINGS.useDifferentSettingForEachSection.fieldDisplayName}" field?`,
        {
          optionItems: [
            {
              text: "Yes",
              value: "yes",
            },
            {
              text: `No`,
              value: "no",
            },
          ],
        },
      );
      if (result === DIALOG_RESULT.CANCEL) {
        return;
      }
      isPreserveUseDifferentSetting = result === "no";

      result = await showOptionsDialog(`Preserve section settings values?`, {
        optionItems: [
          {
            text: "Yes",
            value: "yes",
          },
          {
            text: `No`,
            value: "no",
          },
        ],
      });
      if (result === DIALOG_RESULT.CANCEL) {
        return;
      }
      isToPreserveExistingSectionSetting = result === "yes";
    }

    return {
      isApplyToSection,
      isPreserveUseDifferentSetting,
      isToPreserveExistingSectionSetting,
    };
  };

  return { promptToGetFullSettingsImportOptions };
};

export default usePromptImportSettings;
