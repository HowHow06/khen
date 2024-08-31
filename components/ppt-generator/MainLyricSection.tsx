"use client";

import { Textarea } from "@/components/ui/textarea";
import { SCREEN_SIZE } from "@/lib/constant/general";
import useCursorPosition from "@/lib/hooks/use-cursor-position";
import { useScreenSize } from "@/lib/hooks/use-screen-size";
import useUndoStack from "@/lib/hooks/use-undo-stack";
import { TextareaRefType } from "@/lib/types";
import { KeyboardEvent, useCallback, useRef, useState } from "react";
import AutoGeneratePinyinSwitch from "../AutoGeneratePinyinSwitch";
import ClearTextButton from "../ClearTextButton";
import CopyToClipboardButton from "../CopyToClipboardButton";
import FindAndReplaceButton from "../FindAndReplaceButton";
import GeneratePinyinDropdown from "../GeneratePinyinDropdown";
import LyricSectionCommand from "../LyricSectionCommand";
import SectionInsertDropdown from "../SectionInsertDropdown";
import TextTransformDropdown from "../TextTransformDropdown";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";
import LyricFormatterDialogButton from "../lyric-formatter/LyricFormatterDialogButton";

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
        <LyricFormatterDialogButton />
      </div>
      <div className="mb-1">
        <AutoGeneratePinyinSwitch text={mainText} setText={setSecondaryText} />
      </div>
      <Textarea
        ref={mainTextareaRef}
        placeholder={`Insert the main lyrics here. ${isExtraSmallScreen ? "" : `Press '/' for insert command.`}`}
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
