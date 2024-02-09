import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PresetsType } from "@/lib/types";
import { getPreset } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { FieldValues, UseFormReset } from "react-hook-form";

type Props = {
  formReset: UseFormReset<FieldValues>;
  presets: PresetsType;
};

const PresetsDropdown = ({ formReset, presets }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Presets
          <ChevronDown className="ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {presets.map(({ presetDisplayName, presetName }, index) => {
          return (
            <DropdownMenuItem
              key={index}
              onSelect={() => {
                const preset = getPreset(presetName);
                if (preset) {
                  formReset();
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
