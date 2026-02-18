"use client";
import { SCREEN_SIZE } from "@/lib/constant/general";
import useCursorPosition from "@/lib/hooks/use-cursor-position";
import { useScreenSize } from "@/lib/hooks/use-screen-size";
import { TextareaRefType } from "@/lib/types";
import { useRef } from "react";
import ClearTextButton from "../ClearTextButton";
import CopyToClipboardButton from "../CopyToClipboardButton";
import FindAndReplaceButton from "../FindAndReplaceButton";
import TextTransformDropdown from "../TextTransformDropdown";
import { useLineToSlideMapperContext } from "../context/LineToSlideMapperContext";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";
import { LineNumberedTextarea } from "../ui/line-numbered-textarea";

type SecondaryLyricSectionProps = {};

const SecondaryLyricSection = ({}: SecondaryLyricSectionProps) => {
  const { secondaryText, setSecondaryText } = usePptGeneratorFormContext();

  const { scrollPreviewToCursorPosition } = useLineToSlideMapperContext();
  const screenSize = useScreenSize();
  const isExtraSmallScreen = screenSize === SCREEN_SIZE.XS;

  const textAreaRef = useRef<TextareaRefType>(null);
  const {
    cursorPosition,
    handleSelect: cursorHandleSelect,
    handleTextChange: cursorHandleTextChange,
  } = useCursorPosition();

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSecondaryText(event.target.value);
    // Only enable scroll behavior on non-mobile devices
    if (textAreaRef.current && !isExtraSmallScreen) {
      const selectionStart = textAreaRef.current.selectionStart || 0;
      scrollPreviewToCursorPosition(event.target.value, selectionStart);
    }
    cursorHandleTextChange(event);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/30 p-1.5">
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
        <div className="mx-1 h-6 w-px bg-border" />
        <FindAndReplaceButton
          text={secondaryText}
          setText={setSecondaryText}
          align="start"
        />
        <CopyToClipboardButton text={secondaryText} />
        <ClearTextButton text={secondaryText} setText={setSecondaryText} />
      </div>

      {/* Textarea */}
      <LineNumberedTextarea
        placeholder="Insert the secondary lyrics here (e.g., pinyin, translations)."
        className="min-h-72 resize-y border-2 focus-visible:ring-1 md:min-h-[14rem]"
        ref={textAreaRef}
        value={secondaryText}
        onChange={handleTextChange}
        onSelect={cursorHandleSelect}
        noWrap
      />
    </div>
  );
};

export default SecondaryLyricSection;
