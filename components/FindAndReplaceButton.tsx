import { PopoverClose } from "@radix-ui/react-popover";
import { Replace } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import TooltipButton from "./ui/tooltip-button";

type Props = {
  align?: "start" | "center" | "end";
  text: string;
  setText: (text: string) => void;
  isIconButton?: boolean;
};

const FindAndReplaceButton = ({
  align = "center",
  text,
  setText,
  isIconButton = true,
}: Props) => {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  const handleFindTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFindText(event.target.value);
  };

  const handleReplaceTextChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setReplaceText(event.target.value);
  };

  const onReplaceButtonClick = () => {
    const newText = text.replace(findText, replaceText);
    setText(newText);
  };

  const onReplaceAllButtonClick = () => {
    const newText = text.replaceAll(findText, replaceText);
    setText(newText);
  };
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <TooltipButton
            variant="outline"
            type="button"
            size={isIconButton ? "icon" : "default"}
            tooltipText={"Find & Replace"}
          >
            {isIconButton ? <Replace /> : "Find & Replace"}
          </TooltipButton>
        </PopoverTrigger>
        <PopoverContent
          className="w-80"
          align={align}
          onInteractOutside={(event) => {
            event.preventDefault();
          }}
        >
          <div className="grid gap-4">
            {/* <div className="space-y-2">
              <h4 className="font-medium leading-none">Find and Replace</h4>
            </div> */}
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4 text-sm">
                <Label htmlFor="find">Find</Label>
                <Input
                  id="find"
                  className="col-span-2 h-8 text-sm"
                  value={findText}
                  onChange={handleFindTextChange}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4 text-sm">
                <Label htmlFor="replace">Replace</Label>
                <Input
                  id="replace"
                  className="col-span-2 h-8"
                  value={replaceText}
                  onChange={handleReplaceTextChange}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <PopoverClose asChild>
                <Button variant="ghost" size="sm" type="button">
                  Close
                </Button>
              </PopoverClose>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={onReplaceButtonClick}
              >
                Replace
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={onReplaceAllButtonClick}
              >
                Replace All
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default FindAndReplaceButton;
