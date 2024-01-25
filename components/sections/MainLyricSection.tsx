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
} from "@/lib/text-converter";
import { ArrowRight, ChevronDown } from "lucide-react";
import { MutableRefObject, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {};

type TextareaRefType = HTMLTextAreaElement | null;

const MainLyricSection = (props: Props) => {
  const [text, setText] = useState<string>("");
  const textareaRef = useRef<TextareaRefType>(null); // Ref for the textarea

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
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

  const onCopyToClipboardClick = (
    targetRef: MutableRefObject<TextareaRefType>,
  ) => {
    if (targetRef.current?.value) {
      navigator.clipboard
        .writeText(targetRef.current.value)
        .then(() => {
          toast.success("Text copied to clipboard", {
            // description: "Text copied to clipboard",
            // action: {
            //   label: "Undo",
            //   onClick: () => console.log("Undo"),
            // },
          });
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          toast.error("Failed to copy text");
        });
      return;
    }

    toast.info("The field is empty.");
  };

  const onClearClick = () => {
    const tempText = text;
    setText("");
    toast.success("Text cleared", {
      action: {
        label: "Undo",
        onClick: () => setText(tempText),
      },
      duration: 10 * 1000,
    });
  };

  return (
    <div className="">
      <div className="my-2 flex space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Insert...
              <ChevronDown className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator /> */}
            <DropdownMenuItem>Section</DropdownMenuItem>
            <DropdownMenuItem>Sub-section</DropdownMenuItem>
            <DropdownMenuItem>Main Title</DropdownMenuItem>
            <DropdownMenuItem>Secondary Title</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Chinese Character Conversion
              <ChevronDown className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onConvertToSimplifiedClick}>
              Convert to Simplified
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onConvertToTraditionalClick}>
              Convert to Traditional
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onReplaceCharacterClick("你", "祢")}
            >
              你 <ArrowRight /> 祢
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onReplaceCharacterClick("他", "祂")}
            >
              他<ArrowRight />祂
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline">Generate Pinyin</Button>
        <Button
          variant="outline"
          onClick={() => onCopyToClipboardClick(textareaRef)}
        >
          Copy to clipboard
        </Button>
        <Button variant="outline" onClick={onClearClick}>
          Clear
        </Button>
      </div>
      <Textarea
        ref={textareaRef}
        placeholder="Insert the main lyrics here."
        className="min-h-60"
        value={text}
        onChange={handleTextChange}
      />
    </div>
  );
};

export default MainLyricSection;
