"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { LYRIC_SECTION_ITEMS } from "@/lib/constant";
import useCursorPosition from "@/lib/hooks/use-cursor-position";
import { TextareaRefType } from "@/lib/types";
import { getTextInsertedAtPosition } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { KeyboardEvent, useCallback, useRef, useState } from "react";
import ClearTextButton from "../ClearTextButton";
import CopyToClipboardButton from "../CopyToClipboardButton";
import FindAndReplaceButton from "../FindAndReplaceButton";
import GeneratePinyinDropdown from "../GeneratePinyinDropdown";
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

      setMainText(resultText);
      setCursorPosition(
        cursorPosition.start + insertedText.length,
        cursorPosition.start + insertedText.length,
      );
    },
    [mainText, cursorPosition.start, setCursorPosition, setMainText],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "/") {
      setShowCommand(true);
    }
  };

  const setTextareaSelection = (event: Event) => {
    event.preventDefault(); // to disable autofocus, refer to https://www.radix-ui.com/primitives/docs/components/dropdown-menu/0.0.17#content
    if (mainTextareaRef.current && cursorPosition.end) {
      mainTextareaRef.current.selectionStart = cursorPosition.end;
      mainTextareaRef.current.focus();
    }
  };

  return (
    <div className="">
      <div className="my-2 flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Insert...
              <ChevronDown className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            onCloseAutoFocus={setTextareaSelection}
          >
            {LYRIC_SECTION_ITEMS.map(({ label, value }) => (
              <DropdownMenuItem
                key={value}
                onSelect={() => insertLyricSection({ section: value })}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <TextTransformDropdown
          text={mainText}
          setText={setMainText}
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
        <FindAndReplaceButton text={mainText} setText={setMainText} />
        <CopyToClipboardButton text={mainText} />
        <ClearTextButton text={mainText} setText={setMainText} />
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
        onCloseAutoFocus={setTextareaSelection}
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
