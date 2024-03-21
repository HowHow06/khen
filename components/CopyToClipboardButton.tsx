import { ClipboardCopy } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import TooltipButton from "./ui/tooltip-button";

type Props = {
  text: string;
  isIconButton?: boolean;
};

const CopyToClipboardButton = ({ text, isIconButton = true }: Props) => {
  const onCopyToClipboardClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          toast.success("Text copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          toast.error("Failed to copy text");
        });
      return;
    }

    toast.info("The field is empty.");
  };
  return (
    <>
      <TooltipButton
        variant="outline"
        onClick={onCopyToClipboardClick}
        type="button"
        size={isIconButton ? "icon" : "default"}
        tooltipText="Copy to Clipboard"
        aria-label="Copy to clipboard"
      >
        {isIconButton ? <ClipboardCopy /> : "Copy to clipboard"}
      </TooltipButton>
    </>
  );
};

export default CopyToClipboardButton;
