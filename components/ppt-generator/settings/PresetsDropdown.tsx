import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pptPresets } from "@/lib/presets";
import { PresetsType } from "@/lib/types";
import { getPreset } from "@/lib/utils";
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";
import { FieldValues, UseFormReset } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  formReset: UseFormReset<FieldValues>;
  presets: PresetsType;
  useButton?: boolean;
  useIcon?: boolean;
  title?: string;
};

const PresetsDropdown = ({
  formReset,
  presets,
  useButton = true,
  useIcon = true,
  title = "Presets",
  ...restProps
}: Props &
  Pick<DropdownMenuContentProps, "side" | "sideOffset" | "alignOffset">) => {
  const TriggerWrapper = ({ children }: { children: ReactNode }) => {
    return useButton ? (
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"}>{children}</Button>
      </DropdownMenuTrigger>
    ) : (
      <DropdownMenuTrigger>
        <div className="flex">{children}</div>
      </DropdownMenuTrigger>
    );
  };
  return (
    <DropdownMenu>
      <TriggerWrapper>
        {title}
        {useIcon && <ChevronDown className="ml-1" />}
      </TriggerWrapper>
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
