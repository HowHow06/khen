import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pptPresets } from "@/lib/presets";
import { PptSettingsStateType, PresetsType } from "@/lib/types";
import { getPreset } from "@/lib/utils";
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { UseFormReset } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  formReset: UseFormReset<PptSettingsStateType>;
  presets: PresetsType;
  useIcon?: boolean;
  title?: string;
};

const PresetsDropdown = ({
  formReset,
  presets,
  useIcon = true,
  title = "Presets",
  ...restProps
}: Props &
  Pick<DropdownMenuContentProps, "side" | "sideOffset" | "alignOffset">) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"}>
          {title}
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
                  formReset(preset);
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
