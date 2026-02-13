import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TooltipButton from "@/components/ui/tooltip-button";
import { cn } from "@/lib/utils/general";
import debounce from "lodash/debounce";
import { Download } from "lucide-react";
import { ReactNode } from "react";
import FileNameSettings from "./FileNameSettings";

type Props = {
  children?: ReactNode;
  className?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
};

const GeneratePptWithPromptButton = ({
  children,
  className,
  size,
  variant = "default",
}: Props) => {
  const { submit } = usePptGeneratorFormContext();

  const debouncedSubmit = debounce(submit, 300);

  // If children are provided, use a full button style
  const hasCustomChildren = !!children;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {hasCustomChildren ? (
          <Button
            variant={variant}
            type="button"
            size={size}
            className={cn(className)}
            aria-label="save ppt"
          >
            {children}
          </Button>
        ) : (
          <TooltipButton
            variant="outline"
            type="button"
            size={"icon"}
            tooltipText={"Save PPT"}
            aria-label="save ppt"
          >
            <Download />
          </TooltipButton>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-96" align={"end"}>
        <FileNameSettings />
        <Button onClick={() => debouncedSubmit()} className="mt-3 w-full">
          Generate
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default GeneratePptWithPromptButton;
