import { FormLabel } from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import Image from "next/image";

type Props = {
  displayLabel: string;
  tips?: string;
  tipsImagePath?: string;
};

const SettingLabel = ({ displayLabel, tips, tipsImagePath }: Props) => {
  return (
    <>
      <FormLabel className="text-left text-sm">{displayLabel}</FormLabel>
      {(tips || tipsImagePath) && (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-5 w-5 shrink-0" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex max-w-52 flex-col">
                  {tips && <p>{tips}</p>}
                  {tipsImagePath && (
                    <Image
                      src={tipsImagePath}
                      alt="tipsImage"
                      className="self-center rounded border"
                      width="250"
                      height="250"
                    />
                  )}
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
