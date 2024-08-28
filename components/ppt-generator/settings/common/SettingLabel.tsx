"use client";
import { FormLabel } from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useHasTouchSupport from "@/lib/hooks/use-has-touch-support";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type Props = {
  displayLabel: string;
  tips?: string;
  tipsImagePath?: string;
};

const SettingLabel = ({ displayLabel, tips, tipsImagePath }: Props) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const hasTouchSupport = useHasTouchSupport();

  return (
    <>
      <FormLabel className="text-left text-sm">{displayLabel}</FormLabel>
      {(tips || tipsImagePath) && (
        <>
          <TooltipProvider>
            <Tooltip
              {...(hasTouchSupport
                ? { open: showTooltip }
                : { open: undefined })}
            >
              <TooltipTrigger asChild>
                <Info
                  className={cn(
                    "h-5 w-5 shrink-0",
                    hasTouchSupport && "cursor-pointer",
                  )}
                  {...(hasTouchSupport
                    ? { onClick: () => setShowTooltip(!showTooltip) }
                    : {})}
                />
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
