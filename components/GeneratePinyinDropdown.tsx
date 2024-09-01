import { getIsTouchDevice } from "@/lib/utils";
import { getPinyin } from "@/lib/utils/pinyin";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isTouchDevice = getIsTouchDevice();

  function onGeneratePinyinClick({ hasTone = false }: { hasTone: boolean }) {
    const pinyinText = getPinyin({ text: text, hasTone: hasTone });
    setText(pinyinText);
    toast.success(`Pinyin ${hasTone ? "with" : "without"} tone generated.`);
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      {/* Bug in scrolling, refer to https://github.com/radix-ui/primitives/issues/2418#issuecomment-1926605763 */}
      <DropdownMenuTrigger
        {...(isTouchDevice
          ? {
              onPointerDown: (e) => e.preventDefault(),
              onClick: () => setIsMenuOpen(!isMenuOpen),
            }
          : undefined)}
        asChild
      >
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
