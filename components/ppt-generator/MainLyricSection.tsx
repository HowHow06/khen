"use client";

import { Textarea } from "@/components/ui/textarea";
import { LYRIC_SECTION_ITEMS } from "@/lib/constant";
import useCursorPosition from "@/lib/hooks/use-cursor-position";
import useUndoStack from "@/lib/hooks/use-undo-stack";
import { TextareaRefType } from "@/lib/types";
import { getTextInsertedAtPosition } from "@/lib/utils";
import { KeyboardEvent, useCallback, useRef, useState } from "react";
import ClearTextButton from "../ClearTextButton";
import CopyToClipboardButton from "../CopyToClipboardButton";
import FindAndReplaceButton from "../FindAndReplaceButton";
import GeneratePinyinDropdown from "../GeneratePinyinDropdown";
import SectionInsertDropdown from "../SectionInsertDropdown";
import TextTransformDropdown from "../TextTransformDropdown";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

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
    setMainText(event.target.value);
    cursorHandleTextChange(event);
  };

  const insertLyricSection = useCallback(
    ({ section }: { section: string }) => {
      const { resultText, insertedText } = getTextInsertedAtPosition({
        originalText: mainText,
        positionToInsert: cursorPosition.start,
        textToInsert: `${section} `,
      });

      setMainTextHandler(resultText);
      setCursorPosition(
        cursorPosition.start + insertedText.length,
        cursorPosition.start + insertedText.length,
      );
    },
    [mainText, cursorPosition.start, setCursorPosition, setMainTextHandler],
  );

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
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (mainTextareaRef.current && cursorPosition) {
              mainTextareaRef.current.setSelectionRange(
                cursorPosition.start,
                cursorPosition.end,
              );
              mainTextareaRef.current.focus();
            }
          }}
        />
        <TextTransformDropdown
          text={mainText}
          setText={setMainTextHandler}
          cursorPosition={cursorPosition}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (mainTextareaRef.current && cursorPosition) {
              mainTextareaRef.current.setSelectionRange(
                cursorPosition.start,
                cursorPosition.end,
              );
              mainTextareaRef.current.focus();
            }
          }}
        />
        <GeneratePinyinDropdown setText={setSecondaryText} text={mainText} />
        <FindAndReplaceButton text={mainText} setText={setMainTextHandler} />
        <CopyToClipboardButton text={mainText} />
        <ClearTextButton text={mainText} setText={setMainTextHandler} />
      </div>
      <Textarea
        ref={mainTextareaRef}
        placeholder="Insert the main lyrics here. Press '/' for insert command."
        className="min-h-96 md:min-h-80"
        value={mainText}
        onChange={handleTextChange}
        onSelect={cursorHandleSelect}
        onKeyDown={handleKeyDown}
      />
      <CommandDialog
        open={showCommand}
        onOpenChange={setShowCommand}
        onCloseAutoFocus={setTextareaSelectionOnDropdownClose}
      >
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Inserts...">
            {LYRIC_SECTION_ITEMS.map(({ label, value }) => (
              <CommandItem
                key={value}
                value={`/${label}`}
                onSelect={() => {
                  insertLyricSection({ section: value });
                  setShowCommand(false);
                }}
              >
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default MainLyricSection;
