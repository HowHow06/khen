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
import { LyricSectionType, TextareaRefType } from "@/lib/types";
import {
  convertToSimplified,
  convertToTraditional,
} from "@/lib/utils/character-converter";
import { getPinyin } from "@/lib/utils/pinyin";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import ClearTextButton from "../ClearTextButton";
import CopyToClipboardButton from "../CopyToClipboardButton";
import FindAndReplaceButton from "../FindAndReplaceButton";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";

type MainLyricSectionProps = {};

const MainLyricSection = ({}: MainLyricSectionProps) => {
  const { mainText, setMainText, setSecondaryText } =
    usePptGeneratorFormContext();
  const mainTextareaRef = useRef<TextareaRefType>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMainText(event.target.value);
    setCursorPosition(event.target.selectionStart);
  };

  const handleSelect = (event: React.UIEvent<HTMLTextAreaElement>) => {
    setCursorPosition(event.currentTarget.selectionStart);
  };

  const insertLyricSection = (section: LyricSectionType) => {
    if (mainTextareaRef.current) {
      const sectionValue =
        mainText && cursorPosition !== 0
          ? "\n" + LYRIC_SECTION[section]
          : LYRIC_SECTION[section];
      const sectionLength = sectionValue.length + 1;

      const newText =
        mainText.slice(0, cursorPosition) +
        `${sectionValue} ` +
        mainText.slice(cursorPosition);
      setMainText(newText);
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
    const simplifiedText = convertToSimplified(mainText);
    setMainText(simplifiedText);
    toast.success("Text converted.");
  };

  const onConvertToTraditionalClick = () => {
    const convertedText = convertToTraditional(mainText);
    setMainText(convertedText);
    toast.success("Text converted.");
  };

  const onReplaceCharacterClick = (toFind: string, toReplaceWith: string) => {
    const replacedText = mainText.replaceAll(toFind, toReplaceWith);
    setMainText(replacedText);
    toast.success("Text replaced.");
  };

  function onGeneratePinyinClick({ hasTone = false }: { hasTone: boolean }) {
    const pinyinText = getPinyin({ text: mainText, hasTone: hasTone });
    setSecondaryText(pinyinText);
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
            <DropdownMenuItem onSelect={() => insertLyricSection("FILL_SLIDE")}>
              Fill Slide
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
        <CopyToClipboardButton text={mainText} />
        <FindAndReplaceButton text={mainText} setText={setMainText} />
        <ClearTextButton text={mainText} setText={setMainText} />
      </div>
      <Textarea
        ref={mainTextareaRef}
        placeholder="Insert the main lyrics here."
        className="min-h-52 md:min-h-72"
        value={mainText}
        onChange={handleTextChange}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default MainLyricSection;
