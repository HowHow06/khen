import { FormLabel } from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type Props = {
  displayLabel: string;
  tips?: string;
};

const SettingLabel = ({ displayLabel, tips }: Props) => {
  return (
    <>
      <FormLabel className="text-left text-sm">{displayLabel}</FormLabel>
      {tips && (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-5 w-5 shrink-0" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-52">
                  <p>{tips}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </>
  );
};

export default SettingLabel;
