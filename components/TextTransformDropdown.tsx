"use client";
import { TEXT_TRANSFORM } from "@/lib/constant/general";
import { TextTransformType } from "@/lib/types";
import { capitalizeSpecificWords } from "@/lib/utils";
import {
  convertToSimplified,
  convertToTraditional,
} from "@/lib/utils/character-converter";
import { ArrowRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type Props = {
  text: string;
  setText: (text: string) => void;
};

const TextTransformDropdown = ({ text, setText }: Props) => {
  const transformText = ({ actionType }: { actionType: TextTransformType }) => {
    const tempText = text;
    let resultText = "";

    text.split("\n").forEach((textLine, index, arr) => {
      if (actionType === TEXT_TRANSFORM.LOWER) {
        resultText += textLine.toLowerCase();
      }
      if (actionType === TEXT_TRANSFORM.UPPER) {
        resultText += textLine.toUpperCase();
      }
      if (actionType === TEXT_TRANSFORM.CAPITALIZE_FIRST_LETTER) {
        const searchIndex = textLine.search(/[a-zA-Z]/);
        const firstLetterIndex = searchIndex === -1 ? 0 : searchIndex;

        resultText +=
          textLine.slice(0, firstLetterIndex) +
          textLine.slice(firstLetterIndex, firstLetterIndex + 1).toUpperCase() +
          textLine.slice(firstLetterIndex + 1);
      }
      if (actionType === TEXT_TRANSFORM.CAPITALIZE_SPECIAL_WORDS) {
        resultText += capitalizeSpecificWords(textLine);
      }
      if (index !== arr.length - 1) {
        resultText += "\n";
      }
    });

    if (resultText !== "") {
      setText(resultText);
    }
    toast.success("Text transformed", {
      action: {
        label: "Undo",
        onClick: () => setText(tempText),
      },
      duration: 10 * 1000,
    });
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
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Transform Text
            <ChevronDown className="ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          onCloseAutoFocus={(event) => event.preventDefault()} // to disable autofocus, refer to https://www.radix-ui.com/primitives/docs/components/dropdown-menu/0.0.17#content
        >
          <DropdownMenuItem onSelect={onConvertToSimplifiedClick}>
            Convert to Simplified Chinese
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onConvertToTraditionalClick}>
            Convert to Traditional Chinese
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

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onSelect={() =>
                    transformText({
                      actionType: TEXT_TRANSFORM.CAPITALIZE_FIRST_LETTER,
                    })
                  }
                >
                  For each line: Capitalize First Letter
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    transformText({
                      actionType: TEXT_TRANSFORM.CAPITALIZE_SPECIAL_WORDS,
                    })
                  }
                >
                  For each line: Capitalize Special Words
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    transformText({ actionType: TEXT_TRANSFORM.LOWER })
                  }
                >
                  To Lowercase
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    transformText({ actionType: TEXT_TRANSFORM.UPPER })
                  }
                >
                  To Uppercase
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default TextTransformDropdown;
