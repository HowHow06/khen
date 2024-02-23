import { getPinyin } from "@/lib/utils/pinyin";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type Props = {
  text: string;
  setText: (text: string) => void;
};

const GeneratePinyinDropdown = ({ text, setText }: Props) => {
  function onGeneratePinyinClick({ hasTone = false }: { hasTone: boolean }) {
    const pinyinText = getPinyin({ text: text, hasTone: hasTone });
    setText(pinyinText);
    toast.success(`Pinyin ${hasTone ? "with" : "without"} tone generated.`);
  }

  return (
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
  );
};

export default GeneratePinyinDropdown;
