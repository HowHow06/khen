import React from "react";
import { Button, ButtonProps } from "./button";
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

const TooltipButton = React.forwardRef<HTMLButtonElement, ButtonProps & Props>(
  ({ tooltipText, tooltipTextClassName, ...restProps }, ref) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button ref={ref} {...restProps} />
          </TooltipTrigger>
          <TooltipContent className={tooltipTextClassName}>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

TooltipButton.displayName = "Button";

export default TooltipButton;
