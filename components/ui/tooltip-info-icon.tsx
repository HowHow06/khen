import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

type Props = {
  tooltipText: string;
  tooltipTextClassName?: string;
};

const TooltipInfoIcon = ({ tooltipText, tooltipTextClassName }: Props) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info />
        </TooltipTrigger>
        <TooltipContent className={tooltipTextClassName}>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipInfoIcon;
