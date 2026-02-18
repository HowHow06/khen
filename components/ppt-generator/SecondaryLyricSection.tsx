"use client";
import { SCREEN_SIZE } from "@/lib/constant/general";
import useCursorPosition from "@/lib/hooks/use-cursor-position";
import { useScreenSize } from "@/lib/hooks/use-screen-size";
import { TextareaRefType } from "@/lib/types";
import { AlertTriangle } from "lucide-react";
import { useMemo, useRef } from "react";
import ClearTextButton from "../ClearTextButton";
import CopyToClipboardButton from "../CopyToClipboardButton";
import FindAndReplaceButton from "../FindAndReplaceButton";
import TextTransformDropdown from "../TextTransformDropdown";
import { useLineToSlideMapperContext } from "../context/LineToSlideMapperContext";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";
import { LineNumberedTextarea } from "../ui/line-numbered-textarea";

type SecondaryLyricSectionProps = {};

const SecondaryLyricSection = ({}: SecondaryLyricSectionProps) => {
  const { secondaryText, setSecondaryText, secondaryOverflowWarnings } =
    usePptGeneratorFormContext();

  const { scrollPreviewToCursorPosition } = useLineToSlideMapperContext();
  const screenSize = useScreenSize();
  const isExtraSmallScreen = screenSize === SCREEN_SIZE.XS;

  const textAreaRef = useRef<TextareaRefType>(null);
  const {
    cursorPosition,
    handleSelect: cursorHandleSelect,
    handleTextChange: cursorHandleTextChange,
  } = useCursorPosition();

  // Build highlight set from overflow warnings for the line number gutter
  const overflowLineNumbers = useMemo(
    () =>
      new Set(
        secondaryOverflowWarnings
          .map((w) => w.lineNumber)
          .filter((n): n is number => n !== undefined),
      ),
    [secondaryOverflowWarnings],
  );

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
        highlightLines={overflowLineNumbers}
        noWrap
      />

      {/* Overflow warnings */}
      {secondaryOverflowWarnings.length > 0 && (
        <div className="space-y-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>
              {secondaryOverflowWarnings.length} secondary lyric line
              {secondaryOverflowWarnings.length > 1 ? "s" : ""} may wrap on
              slide
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {secondaryOverflowWarnings.map((warning) => (
              <span
                key={`secondary-${warning.lineNumber}`}
                className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300"
              >
                Line {warning.lineNumber}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">
            Consider splitting long lines for better slide readability
          </p>
        </div>
      )}
    </div>
  );
};

export default SecondaryLyricSection;
