"use client";
import { TextareaRefType } from "@/lib/type";
import { MutableRefObject } from "react";
import { Button } from "../ui/button";
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
          <Button variant="outline">Copy to clipboard</Button>
          <Button variant="outline">Clear</Button>
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
