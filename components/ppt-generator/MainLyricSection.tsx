"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { LYRIC_SECTION } from "@/lib/constant";
import useCursorPosition from "@/lib/hooks/use-cursor-position";
import { TextareaRefType } from "@/lib/types";
import { getPinyin } from "@/lib/utils/pinyin";
import { ChevronDown } from "lucide-react";
import { KeyboardEvent, useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import ClearTextButton from "../ClearTextButton";
import CopyToClipboardButton from "../CopyToClipboardButton";
import FindAndReplaceButton from "../FindAndReplaceButton";
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
    (section: string) => {
      if (!mainTextareaRef.current) {
        return;
      }

      const isCursorAtBeginning = !mainText || cursorPosition.start === 0;
      let textToAdd = `${section} `;
      if (!isCursorAtBeginning) {
        textToAdd = "\n" + textToAdd;
      }

      const newText =
        mainText.slice(0, cursorPosition.start) +
        textToAdd +
        mainText.slice(cursorPosition.start);

      setMainText(newText);
      setCursorPosition(
        cursorPosition.start + textToAdd.length,
        cursorPosition.start + textToAdd.length,
      );
    },
    [mainText, cursorPosition.start, setCursorPosition, setMainText],
  );

  function onGeneratePinyinClick({ hasTone = false }: { hasTone: boolean }) {
    const pinyinText = getPinyin({ text: mainText, hasTone: hasTone });
    setSecondaryText(pinyinText);
    toast.success(`Pinyin ${hasTone ? "with" : "without"} tone generated.`);
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "/") {
      setShowCommand(true);
    }
  };

  const sectionsToInsert: {
    displayName: string;
    value: string;
    onSelect: () => void;
  }[] = useMemo(
    () => [
      {
        displayName: `Section`,
        value: "/section",
        onSelect: () => insertLyricSection(LYRIC_SECTION.SECTION),
      },
      {
        displayName: `Sub-section`,
        value: "/sub-section",
        onSelect: () => insertLyricSection(LYRIC_SECTION.SUBSECTION),
      },
      {
        displayName: `Main Title`,
        value: "/main-title",
        onSelect: () => insertLyricSection(LYRIC_SECTION.MAINTITLE),
      },
      {
        displayName: `Secondary Title`,
        value: "/secondary-title",
        onSelect: () => insertLyricSection(LYRIC_SECTION.SECONDARYTITLE),
      },
      {
        displayName: `Empty Slide`,
        value: "/empty-slide",
        onSelect: () => insertLyricSection(LYRIC_SECTION.EMPTYSLIDE),
      },
      {
        displayName: `Fill Slide`,
        value: "/fill-slide",
        onSelect: () => insertLyricSection(LYRIC_SECTION.FILL_SLIDE),
      },
    ],
    [insertLyricSection],
  );

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
            {sectionsToInsert.map(({ displayName, onSelect, value }) => (
              <DropdownMenuItem key={value} onSelect={onSelect}>
                {displayName}
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Generate Pinyin
              <ChevronDown className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onSelect={() => onGeneratePinyinClick({ hasTone: false })}
            >
              without tone
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onGeneratePinyinClick({ hasTone: true })}
            >
              with tone
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
            {sectionsToInsert.map(({ displayName, onSelect, value }) => (
              <CommandItem
                key={value}
                value={value}
                onSelect={() => {
                  onSelect();
                  setShowCommand(false);
                }}
              >
                {displayName}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default MainLyricSection;
