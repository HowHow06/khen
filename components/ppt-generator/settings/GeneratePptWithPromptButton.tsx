import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TooltipButton from "@/components/ui/tooltip-button";
import debounce from "lodash/debounce";
import { Download } from "lucide-react";
import FileNameSettings from "./FileNameSettings";

type Props = {};

const GeneratePptWithPromptButton = (props: Props) => {
  const { submit } = usePptGeneratorFormContext();

  const debouncedSubmit = debounce(submit, 300);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <TooltipButton
          variant="outline"
          type="button"
          size={"icon"}
          tooltipText={"Save PPT"}
          aria-label="save ppt"
        >
          <Download />
        </TooltipButton>
      </PopoverTrigger>
      <PopoverContent className="w-96" align={"end"}>
        <FileNameSettings />
        <Button onClick={() => debouncedSubmit()}>Generate</Button>
      </PopoverContent>
    </Popover>
  );
};

export default GeneratePptWithPromptButton;
