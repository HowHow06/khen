"use client";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import usePromptImportSettings from "@/lib/hooks/use-prompt-import-settings";
import { PresetsType } from "@/lib/types";
import {
  combineWithDefaultSettings,
  generateFullSettings,
  getIsTouchDevice,
  getPreset,
} from "@/lib/utils";
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  presets: PresetsType;
  useIcon?: boolean;
  currentSectionName: string;
  hasSectionSettings: boolean;
};

const PresetsDropdown = ({
  presets,
  useIcon = true,
  currentSectionName,
  hasSectionSettings,
  ...restProps
}: Props &
  Pick<DropdownMenuContentProps, "side" | "sideOffset" | "alignOffset">) => {
  const { form, settingsValues } = usePptGeneratorFormContext();
  const { reset: formReset } = form;
  const { promptToGetFullSettingsImportOptions } = usePromptImportSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isTouchDevice = getIsTouchDevice();

  const applyPreset = (
    presetName: string,
    isApplyToSection: boolean = false,
    isPreserveUseDifferentSetting: boolean = false,
    isToPreserveExistingSectionSetting: boolean = true,
  ) => {
    const preset = getPreset(presetName);
    if (preset) {
      const finalValues = generateFullSettings({
        newSettings: combineWithDefaultSettings(preset),
        originalSettings: settingsValues,
        targetSectionName: currentSectionName,
        isApplyToSection: isApplyToSection,
        isPreserveUseDifferentSetting: isPreserveUseDifferentSetting,
        isPreserveExistingSectionSetting: isToPreserveExistingSectionSetting,
      });
      formReset(finalValues);
      toast.success("Preset applied.");
    }
  };

  const onPresetClick = async (presetName: string) => {
    const options = await promptToGetFullSettingsImportOptions({
      hasSectionSettings,
      currentSectionName,
    });

    if (options === undefined) {
      // user clicked cancel
      return;
    }

    const {
      isApplyToSection,
      isPreserveUseDifferentSetting,
      isToPreserveExistingSectionSetting,
    } = options;

    applyPreset(
      presetName,
      isApplyToSection,
      isPreserveUseDifferentSetting,
      isToPreserveExistingSectionSetting,
    );
  };

  return (
    <>
      {" "}
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        {/* Bug in scrolling, refer to https://github.com/radix-ui/primitives/issues/2418#issuecomment-1926605763 */}
        <DropdownMenuTrigger
          {...(isTouchDevice
            ? {
                onPointerDown: (e) => e.preventDefault(),
                onClick: () => setIsMenuOpen(!isMenuOpen),
              }
            : undefined)}
          asChild
        >
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
