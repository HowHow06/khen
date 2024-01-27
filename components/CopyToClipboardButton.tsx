import { TextareaRefType } from "@/lib/type";
import { MutableRefObject } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

type Props = {
  targetRef: MutableRefObject<TextareaRefType>;
};

const CopyToClipboardButton = ({ targetRef }: Props) => {
  const onCopyToClipboardClick = () => {
    if (targetRef.current?.value) {
      navigator.clipboard
        .writeText(targetRef.current.value)
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
      <Button variant="outline" onClick={onCopyToClipboardClick}>
        Copy to clipboard
      </Button>
    </>
  );
};

export default CopyToClipboardButton;
