"use client";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MAIN_SECTION_NAME, SETTING_CATEGORY } from "@/lib/constant";
import { pptPresets } from "@/lib/presets";
import { PresetsType, SectionSettingsKeyType } from "@/lib/types";
import { getPreset, getSectionSettingsFromPreset } from "@/lib/utils";
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

type Props = {
  presets: PresetsType;
  useIcon?: boolean;
} & (
  | {
      isSectionPreset?: false;
      sectionName?: string;
    }
  | {
      isSectionPreset: true;
      sectionName: string;
    }
);

const PresetsDropdown = ({
  presets,
  useIcon = true,
  isSectionPreset,
  sectionName,
  ...restProps
}: Props &
  Pick<DropdownMenuContentProps, "side" | "sideOffset" | "alignOffset">) => {
  const { form } = usePptGeneratorFormContext();
  const { reset: formReset, getValues } = form;
  return (
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
              onSelect={() => {
                const preset = getPreset(presetName, pptPresets);
                if (preset) {
                  if (isSectionPreset && sectionName !== MAIN_SECTION_NAME) {
                    const sectionSettings =
                      getSectionSettingsFromPreset(preset);
                    const currentValues = getValues();
                    const currentSectionValues =
                      currentValues[SETTING_CATEGORY.SECTION];

                    const newValues = {
                      ...currentValues,
                      [SETTING_CATEGORY.SECTION]: {
                        ...currentSectionValues,
                        [sectionName as SectionSettingsKeyType]:
                          sectionSettings,
                      },
                    };
                    formReset(newValues);
                  } else {
                    formReset(preset);
                  }
                  toast.success("Preset applied.");
                }
              }}
            >
              {presetDisplayName}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PresetsDropdown;
