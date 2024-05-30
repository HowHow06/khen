"use client";

import { Textarea } from "@/components/ui/textarea";
import useCursorPosition from "@/lib/hooks/use-cursor-position";
import useUndoStack from "@/lib/hooks/use-undo-stack";
import { TextareaRefType } from "@/lib/types";
import { KeyboardEvent, useCallback, useRef, useState } from "react";
import ClearTextButton from "../ClearTextButton";
import CopyToClipboardButton from "../CopyToClipboardButton";
import FindAndReplaceButton from "../FindAndReplaceButton";
import GeneratePinyinDropdown from "../GeneratePinyinDropdown";
import LyricSectionCommand from "../LyricSectionCommand";
import SectionInsertDropdown from "../SectionInsertDropdown";
import TextTransformDropdown from "../TextTransformDropdown";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";

type MainLyricSectionProps = {};

const MainLyricSection = ({}: MainLyricSectionProps) => {
  const { mainText, setMainText, setSecondaryText } =
    usePptGeneratorFormContext();
  const mainTextareaRef = useRef<TextareaRefType>(null);
  const {
    cursorPosition,
    setCursorPosition,
    handleTextChange: cursorHandleTextChange,
    handleSelect: cursorHandleSelect,
  } = useCursorPosition();
  const [showCommand, setShowCommand] = useState<boolean>(false);
  const onUndoCallback = useCallback(
    (lastText: string) => setMainText(lastText),
    [setMainText],
  );

  const { saveToUndoStack } = useUndoStack<string>({
    ref: mainTextareaRef,
    onUndo: onUndoCallback,
    disableUndoShortcut: false,
  });

  const setMainTextHandler = useCallback(
    (newText: string) => {
      saveToUndoStack(mainText);
      setMainText(newText);
    },
    [mainText, saveToUndoStack, setMainText],
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
  };

  const setTextareaSelectionOnDropdownClose = (event: Event) => {
    event.preventDefault(); // to disable autofocus, refer to https://www.radix-ui.com/primitives/docs/components/dropdown-menu/0.0.17#content
    if (mainTextareaRef.current && cursorPosition.end) {
      mainTextareaRef.current.selectionStart = cursorPosition.end;
      mainTextareaRef.current.focus();
    }
  };

  return (
    <div className="">
      <div className="my-2 flex flex-wrap gap-2">
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
        <FindAndReplaceButton text={mainText} setText={setMainTextHandler} />
        <CopyToClipboardButton text={mainText} />
        <ClearTextButton text={mainText} setText={setMainTextHandler} />
      </div>
      <Textarea
        ref={mainTextareaRef}
        placeholder="Insert the main lyrics here. Press '/' for insert command."
        className="min-h-96 md:min-h-[35rem]"
        value={mainText}
        onChange={handleTextChange}
        onSelect={cursorHandleSelect}
        onKeyDown={handleKeyDown}
      />
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
