"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SCREEN_SIZE } from "@/lib/constant/general";
import useCursorPosition from "@/lib/hooks/use-cursor-position";
import { useScreenSize } from "@/lib/hooks/use-screen-size";
import useUndoStack from "@/lib/hooks/use-undo-stack";
import { TextareaRefType } from "@/lib/types";
import { AlertTriangle, FileText, Lightbulb } from "lucide-react";
import { KeyboardEvent, useCallback, useRef, useState } from "react";
import AutoGeneratePinyinSwitch from "../AutoGeneratePinyinSwitch";
import ClearTextButton from "../ClearTextButton";
import CopyToClipboardButton from "../CopyToClipboardButton";
import FindAndReplaceButton from "../FindAndReplaceButton";
import GeneratePinyinDropdown from "../GeneratePinyinDropdown";
import LyricSectionCommand from "../LyricSectionCommand";
import SectionInsertDropdown from "../SectionInsertDropdown";
import TextTransformDropdown from "../TextTransformDropdown";
import { useLineToSlideMapperContext } from "../context/LineToSlideMapperContext";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";
import LyricFormatterDialogButton from "../lyric-formatter/LyricFormatterDialogButton";

// Example template for empty state
// Syntax: # Title ## Subtitle = Cover, ---- = Song section, --- = Subsection, *** = Empty slide
const EXAMPLE_TEMPLATE = `---- 奇异恩典
# 奇异恩典 ## Amazing Grace
--- Verse 1
奇异恩典 何等甘甜
我罪已得赦免
前我失丧 今被寻回
瞎眼今得看见
--- Verse 2
如此恩典 使我敬畏
使我心得安慰
初信之时 即蒙恩惠
真是何等宝贵
--- Chorus
赞美主 赞美主
全地都当赞美主
从日出之地 到日落之处
赞美主名
--- Ending
奇异恩典 何等甘甜
我罪已得赦免
***`;

type MainLyricSectionProps = {};

const MainLyricSection = ({}: MainLyricSectionProps) => {
  const { mainText, setMainText, setSecondaryText, overflowWarnings } =
    usePptGeneratorFormContext();
  const mainTextareaRef = useRef<TextareaRefType>(null);
  const { scrollPreviewToCursorPosition } = useLineToSlideMapperContext();

  const {
    cursorPosition,
    setCursorPosition,
    handleTextChange: cursorHandleTextChange,
    handleSelect: cursorHandleSelect,
  } = useCursorPosition();
  const [showCommand, setShowCommand] = useState<boolean>(false);
  const screenSize = useScreenSize();
  const isExtraSmallScreen = screenSize === SCREEN_SIZE.XS;

  const { saveToUndoStack } = useUndoStack<string>({
    ref: mainTextareaRef,
    textValue: mainText,
    onTextUpdate: setMainText,
    disableShortcut: true,
  });

  const setMainTextHandler = useCallback(
    (newText: string) => {
      saveToUndoStack(mainText);
      setMainText(newText);
      // Trigger scroll based on the position where the text change occurs
      // Only enable scroll behavior on non-mobile devices
      if (mainTextareaRef.current && !isExtraSmallScreen) {
        const selectionStart = mainTextareaRef.current.selectionStart || 0;
        scrollPreviewToCursorPosition(newText, selectionStart);
      }
    },
    [
      mainText,
      saveToUndoStack,
      setMainText,
      scrollPreviewToCursorPosition,
      isExtraSmallScreen,
    ],
  );

  const setMainTextForSectionInsertion = useCallback(
    (newText: string) => {
      setMainTextHandler(newText);
      const insertedTextLength = newText.length - mainText.length;
      setCursorPosition(
        cursorPosition.start + insertedTextLength,
        cursorPosition.start + insertedTextLength,
      );
    },
    [
      cursorPosition.start,
      mainText.length,
      setCursorPosition,
      setMainTextHandler,
    ],
  );

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMainTextHandler(event.target.value);
    cursorHandleTextChange(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "/") {
      setShowCommand(true);
    }

    if (event.ctrlKey && !event.altKey) {
      if (event.key === "h") {
        event.preventDefault();
        // const selectedText = getTextByCursorPosition(cursorPosition, mainText);
        // open replace bar
      }
    }
  };

  const setTextareaSelectionOnDropdownClose = (event: Event) => {
    event.preventDefault(); // to disable autofocus, refer to https://www.radix-ui.com/primitives/docs/components/dropdown-menu/0.0.17#content
    if (!isExtraSmallScreen && mainTextareaRef.current && cursorPosition.end) {
      mainTextareaRef.current.selectionStart = cursorPosition.end;
      mainTextareaRef.current.focus();
    }
  };

  // Handle loading example template
  const loadExampleTemplate = useCallback(() => {
    setMainTextHandler(EXAMPLE_TEMPLATE);
  }, [setMainTextHandler]);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/30 p-1.5">
        <SectionInsertDropdown
          text={mainText}
          setText={setMainTextForSectionInsertion}
          cursorPosition={cursorPosition}
          onCloseAutoFocus={setTextareaSelectionOnDropdownClose}
        />
        <TextTransformDropdown
          text={mainText}
          setText={setMainTextHandler}
          cursorPosition={cursorPosition}
          onCloseAutoFocus={setTextareaSelectionOnDropdownClose}
        />
        <GeneratePinyinDropdown setText={setSecondaryText} text={mainText} />
        <div className="mx-1 h-6 w-px bg-border" />
        <FindAndReplaceButton text={mainText} setText={setMainTextHandler} />
        <CopyToClipboardButton text={mainText} />
        <ClearTextButton text={mainText} setText={setMainTextHandler} />
        <div className="mx-1 h-6 w-px bg-border" />
        <LyricFormatterDialogButton />
      </div>

      {/* Auto-generate toggle */}
      <AutoGeneratePinyinSwitch text={mainText} setText={setSecondaryText} />

      {/* Empty state with template */}
      {!mainText.trim() && (
        <div className="rounded-xl border-2 border-dashed bg-muted/20 p-6 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <h4 className="mb-2 font-medium">No lyrics yet</h4>
          <p className="mb-4 text-sm text-muted-foreground">
            Paste your lyrics below or start with an example template
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadExampleTemplate}
              className="gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              Load Example Template
            </Button>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Quick syntax:</span>{" "}
              <code className="rounded bg-muted px-1 py-0.5"># Title ## Subtitle</code>{" "}
              Cover slide{" "}
              <code className="rounded bg-muted px-1 py-0.5">----</code> New
              song{" "}
              <code className="rounded bg-muted px-1 py-0.5">---</code>{" "}
              Subsection{" "}
              <code className="rounded bg-muted px-1 py-0.5">***</code> Empty
              slide
            </div>
          </div>
        </div>
      )}

      {/* Textarea */}
      <Textarea
        ref={mainTextareaRef}
        placeholder={`Insert the main lyrics here. ${isExtraSmallScreen ? "" : `Press '/' for quick commands.`}`}
        className="min-h-96 resize-y border-2 focus-visible:ring-1 md:min-h-[28rem]"
        value={mainText}
        onChange={handleTextChange}
        onSelect={cursorHandleSelect}
        onKeyDown={handleKeyDown}
      />

      {/* Overflow warnings */}
      {overflowWarnings.length > 0 && (
        <div className="space-y-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>
              {overflowWarnings.length} line{overflowWarnings.length > 1 ? "s" : ""} may wrap on slide
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {overflowWarnings.map((warning) => (
              <span
                key={warning.lineNumber}
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

      <LyricSectionCommand
        open={showCommand}
        onOpenChange={setShowCommand}
        onCloseAutoFocus={setTextareaSelectionOnDropdownClose}
        cursorPosition={cursorPosition}
        text={mainText}
        setText={setMainTextForSectionInsertion}
      />
    </div>
  );
};

export default MainLyricSection;
