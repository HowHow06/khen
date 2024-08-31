"use client";
import useCursorPosition from "@/lib/hooks/use-cursor-position";
import { TextareaRefType } from "@/lib/types";
import { useRef } from "react";
import ClearTextButton from "../ClearTextButton";
import CopyToClipboardButton from "../CopyToClipboardButton";
import FindAndReplaceButton from "../FindAndReplaceButton";
import TextTransformDropdown from "../TextTransformDropdown";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";
import { Textarea } from "../ui/textarea";

type SecondaryLyricSectionProps = {};

const SecondaryLyricSection = ({}: SecondaryLyricSectionProps) => {
  const { secondaryText, setSecondaryText } = usePptGeneratorFormContext();
  const textAreaRef = useRef<TextareaRefType>(null);
  const {
    cursorPosition,
    handleSelect: cursorHandleSelect,
    handleTextChange: cursorHandleTextChange,
  } = useCursorPosition();
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSecondaryText(event.target.value);
    cursorHandleTextChange(event);
  };

  return (
    <>
      <div className="">
        <div className="my-2 flex flex-wrap gap-2">
          <TextTransformDropdown
            text={secondaryText}
            setText={setSecondaryText}
            cursorPosition={cursorPosition}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (textAreaRef.current && cursorPosition) {
                textAreaRef.current.setSelectionRange(
                  cursorPosition.start,
                  cursorPosition.end,
                );
                textAreaRef.current.focus();
              }
            }}
          />
          <FindAndReplaceButton
            text={secondaryText}
            setText={setSecondaryText}
            align="start"
          />
          <CopyToClipboardButton text={secondaryText} />
          <ClearTextButton text={secondaryText} setText={setSecondaryText} />
        </div>
        <Textarea
          placeholder="Insert the secondary lyrics here."
          className="min-h-96 md:min-h-[15rem]"
          ref={textAreaRef}
          value={secondaryText}
          onChange={handleTextChange}
          onSelect={cursorHandleSelect}
        />
      </div>
    </>
  );
};

export default SecondaryLyricSection;
