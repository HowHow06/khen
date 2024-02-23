"use client";
import { TEXT_TRANSFORM } from "@/lib/constant/general";
import { CursorPosition, TextTransformType } from "@/lib/types";
import { getTransformedTextByLines } from "@/lib/utils";
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
  cursorPosition?: CursorPosition;
  onDropdownClosed?: () => void;
};

const TextTransformDropdown = ({
  text,
  setText,
  cursorPosition,
  onDropdownClosed,
}: Props) => {
  const hasSelectedText =
    cursorPosition && cursorPosition.start !== cursorPosition.end;

  const getTextByCursorPosition = (cursorPosition: CursorPosition) => {
    return {
      before: text.slice(0, cursorPosition.start),
      targetValue: text.slice(cursorPosition.start, cursorPosition.end),
      after: text.slice(cursorPosition.end),
    };
  };

  const getConvertedText = ({
    conversion,
  }: {
    conversion: (txt: string) => string;
  }): string => {
    if (!hasSelectedText) {
      return conversion(text);
    }
    const { before, targetValue, after } =
      getTextByCursorPosition(cursorPosition);
    const convertedText = conversion(targetValue);
    return before + convertedText + after;
  };

  const convertText = ({
    conversion,
    messageOnSuccess,
  }: {
    conversion: (txt: string) => string;
    messageOnSuccess?: string;
  }): void => {
    const originalText = text;
    const convertedText = getConvertedText({ conversion });
    setText(convertedText);
    if (messageOnSuccess) {
      toast.success(messageOnSuccess, {
        action: {
          label: "Undo",
          onClick: () => setText(originalText),
        },
        duration: 10 * 1000,
      });
    }
  };

  const onConvertToSimplifiedClick = () => {
    convertText({
      messageOnSuccess: `Converted to simplified chinese`,
      conversion: convertToSimplified,
    });
  };

  const onConvertToTraditionalClick = () => {
    convertText({
      messageOnSuccess: `Converted to traditional chinese`,
      conversion: convertToTraditional,
    });
  };

  const onReplaceCharacterClick = (toFind: string, toReplaceWith: string) => {
    convertText({
      messageOnSuccess: `Replaced ${toFind} with ${toReplaceWith}`,
      conversion: (text) => text.replaceAll(toFind, toReplaceWith),
    });
  };

  const transformText = ({ actionType }: { actionType: TextTransformType }) => {
    convertText({
      messageOnSuccess: "Text transformed",
      conversion: (text) =>
        getTransformedTextByLines({ targetText: text, actionType }),
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Transform {hasSelectedText && "Selected "}Text
            <ChevronDown className="ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (onDropdownClosed) {
              onDropdownClosed();
            }
          }} // to disable autofocus, refer to https://www.radix-ui.com/primitives/docs/components/dropdown-menu/0.0.17#content
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
                  Capitalize First Letter for each line
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    transformText({
                      actionType: TEXT_TRANSFORM.CAPITALIZE_SPECIAL_WORDS,
                    })
                  }
                >
                  Capitalize Special Words
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
