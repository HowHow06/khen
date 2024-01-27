"use client";
import { TextareaRefType } from "@/lib/type";
import { MutableRefObject } from "react";
import ClearTextButton from "../ClearTextButton";
import CopyToClipboardButton from "../CopyToClipboardButton";
import { Textarea } from "../ui/textarea";

type SecondaryLyricSectionProps = {
  secondaryTextareaRef: MutableRefObject<TextareaRefType>;
  secondaryText: string;
  setSecondaryText: (text: string) => void;
};

const SecondaryLyricSection = ({
  secondaryTextareaRef,
  secondaryText,
  setSecondaryText,
}: SecondaryLyricSectionProps) => {
  console.log("secondary render");

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSecondaryText(event.target.value);
  };

  return (
    <>
      <div className="">
        <div className="my-2 flex space-x-2">
          <CopyToClipboardButton targetRef={secondaryTextareaRef} />
          <ClearTextButton text={secondaryText} setText={setSecondaryText} />
        </div>
        <Textarea
          ref={secondaryTextareaRef}
          placeholder="Insert the secondary lyrics here."
          className="min-h-60"
          value={secondaryText}
          onChange={handleTextChange}
        />
      </div>
    </>
  );
};

export default SecondaryLyricSection;
