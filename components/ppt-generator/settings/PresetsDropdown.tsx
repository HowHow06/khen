"use client";
import { useOptionsDialog } from "@/components/context/OptionsDialogContext";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MAIN_SECTION_NAME,
  PPT_GENERATION_GENERAL_SETTINGS,
  SETTING_CATEGORY,
} from "@/lib/constant";
import { DIALOG_RESULT } from "@/lib/constant/general";
import { pptPresets } from "@/lib/presets";
import {
  PptSettingsStateType,
  PresetsType,
  SectionSettingsKeyType,
} from "@/lib/types";
import { getPreset, getSectionSettingsFromSettings } from "@/lib/utils";
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

type Props = {
  presets: PresetsType;
  useIcon?: boolean;
} & (
  | {
      hasSectionSettings?: false;
      currentSectionName?: string;
    }
  | {
      hasSectionSettings: true;
      currentSectionName: string;
    }
);

const PresetsDropdown = ({
  presets,
  useIcon = true,
  hasSectionSettings,
  currentSectionName,
  ...restProps
}: Props &
  Pick<DropdownMenuContentProps, "side" | "sideOffset" | "alignOffset">) => {
  const { form } = usePptGeneratorFormContext();
  const { reset: formReset, getValues } = form;
  const { showOptionsDialog } = useOptionsDialog();

  const applyPreset = (
    presetName: string,
    isApplyToSection: boolean = false,
    isPreserveUseDifferentSetting: boolean = false,
  ) => {
    const preset = getPreset(presetName, pptPresets);
    if (preset) {
      const currentValues = getValues();
      let presetToUse = preset;
      presetToUse[SETTING_CATEGORY.FILE] = {
        ...presetToUse[SETTING_CATEGORY.FILE],
        filename: currentValues.file.filename,
      };

      if (isPreserveUseDifferentSetting) {
        presetToUse[SETTING_CATEGORY.GENERAL] = {
          ...presetToUse[SETTING_CATEGORY.GENERAL],
          useDifferentSettingForEachSection:
            currentValues.general.useDifferentSettingForEachSection,
        };
      }

      if (isApplyToSection && currentSectionName !== MAIN_SECTION_NAME) {
        const sectionSettings = getSectionSettingsFromSettings(preset);
        const currentSectionValues = currentValues[SETTING_CATEGORY.SECTION];

        presetToUse = {
          ...currentValues,
          [SETTING_CATEGORY.SECTION]: {
            ...currentSectionValues,
            [currentSectionName as SectionSettingsKeyType]: sectionSettings,
          },
        } as PptSettingsStateType;
      }

      formReset(presetToUse);
      toast.success("Preset applied.");
    }
  };

  const onPresetClick = async (presetName: string) => {
    let isApplyToSection = false;
    let isPreserveUseDifferentSetting = true;
    if (hasSectionSettings && currentSectionName == MAIN_SECTION_NAME) {
      const result = await showOptionsDialog(
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
    }

    if (hasSectionSettings && currentSectionName !== MAIN_SECTION_NAME) {
      const result = await showOptionsDialog("Apply presets to:", {
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

    applyPreset(presetName, isApplyToSection, isPreserveUseDifferentSetting);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"outline"}>
            Presets
            {useIcon && <ChevronDown className="ml-1" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" {...restProps}>
          {presets.map(({ presetDisplayName, presetName }, index) => {
            return (
              <DropdownMenuItem
                key={index}
                onSelect={() => onPresetClick(presetName)}
              >
                {presetDisplayName}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default PresetsDropdown;
