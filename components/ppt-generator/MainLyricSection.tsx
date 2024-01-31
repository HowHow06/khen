"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  convertToSimplified,
  convertToTraditional,
} from "@/lib/character-converter";
import { LYRIC_SECTION } from "@/lib/constant";
import { getPinyin } from "@/lib/pinyin";
import { LyricSectionType, TextareaRefType } from "@/lib/types";
import { ArrowRight, ChevronDown } from "lucide-react";
import { MutableRefObject, useState } from "react";
import { toast } from "sonner";
import ClearTextButton from "../ClearTextButton";
import CopyToClipboardButton from "../CopyToClipboardButton";

type MainLyricSectionProps = {
  mainTextareaRef: MutableRefObject<TextareaRefType>;
  updateSecondaryText: (text: string) => void;
};

const MainLyricSection = ({
  mainTextareaRef,
  updateSecondaryText,
}: MainLyricSectionProps) => {
  console.log("mainlyric render"); //TODO: remove this
  const [text, setText] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    setCursorPosition(event.target.selectionStart);
  };

  const handleSelect = (event: React.UIEvent<HTMLTextAreaElement>) => {
    setCursorPosition(event.currentTarget.selectionStart);
  };

  const insertLyricSection = (section: LyricSectionType) => {
    if (mainTextareaRef.current) {
      const sectionValue =
        text && cursorPosition != 0
          ? "\n" + LYRIC_SECTION[section]
          : LYRIC_SECTION[section];
      const sectionLength = sectionValue.length + 1;

      const newText =
        text.slice(0, cursorPosition) +
        `${sectionValue} ` +
        text.slice(cursorPosition);
      setText(newText);
      setCursorPosition(cursorPosition + sectionLength);

      setTimeout(() => {
        if (mainTextareaRef.current) {
          mainTextareaRef.current.focus();
          mainTextareaRef.current.selectionStart =
            cursorPosition + sectionLength;
          mainTextareaRef.current.selectionEnd = cursorPosition + sectionLength;
        }
      }, 0);
    }
  };

  const onConvertToSimplifiedClick = () => {
    const simplifiedText = convertToSimplified(text);
    setText(simplifiedText);
    toast.success("Text converted.");
  };

  const onConvertToTraditionalClick = () => {
    const convertedText = convertToTraditional(text);
    setText(convertedText);
    toast.success("Text converted.");
  };

  const onReplaceCharacterClick = (toFind: string, toReplaceWith: string) => {
    const replacedText = text.replaceAll(toFind, toReplaceWith);
    setText(replacedText);
    toast.success("Text replaced.");
  };

  function onGeneratePinyinClick({ hasTone = false }: { hasTone: boolean }) {
    const pinyinText = getPinyin({ text: text, hasTone: hasTone });
    updateSecondaryText(pinyinText);
    toast.success(`Pinyin ${hasTone ? "with" : "without"} tone generated.`);
  }

  return (
    <div className="">
      <div className="my-2 flex flex-wrap gap-2">
        {/* <Button variant="outline" onClick={insertSection}>
          Test Button Insert Section
        </Button> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Insert...
              <ChevronDown className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            onCloseAutoFocus={(event) => event.preventDefault()} // to disable autofocus, refer to https://www.radix-ui.com/primitives/docs/components/dropdown-menu/0.0.17#content
          >
            {/* <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator /> */}
            <DropdownMenuItem onSelect={() => insertLyricSection("SECTION")}>
              Section
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => insertLyricSection("SUBSECTION")}>
              Sub-section
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => insertLyricSection("MAINTITLE")}>
              Main Title
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => insertLyricSection("SECONDARYTITLE")}
            >
              Secondary Title
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => insertLyricSection("EMPTYSLIDE")}>
              Empty Slide
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Chinese Character Conversion
              <ChevronDown className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={onConvertToSimplifiedClick}>
              Convert to Simplified
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onConvertToTraditionalClick}>
              Convert to Traditional
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onReplaceCharacterClick("你", "祢")}
            >
              你 <ArrowRight /> 祢
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onReplaceCharacterClick("他", "祂")}
            >
              他<ArrowRight />祂
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
        <CopyToClipboardButton targetRef={mainTextareaRef} />
        <ClearTextButton text={text} setText={setText} />
      </div>
      <Textarea
        ref={mainTextareaRef}
        placeholder="Insert the main lyrics here."
        className="min-h-52 md:min-h-72"
        value={text}
        onChange={handleTextChange}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default MainLyricSection;