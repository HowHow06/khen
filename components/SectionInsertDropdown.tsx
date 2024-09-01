"use client";
import { LYRIC_SECTION_ITEMS } from "@/lib/constant";
import { CursorPosition } from "@/lib/types";
import { getIsTouchDevice, getTextInsertedAtPosition } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";
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
  cursorPosition: CursorPosition;
  onCloseAutoFocus?: (event: Event) => void;
};

const SectionInsertDropdown = ({
  text,
  setText,
  cursorPosition,
  onCloseAutoFocus,
}: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isTouchDevice = getIsTouchDevice();
  const insertLyricSection = useCallback(
    ({ section }: { section: string }) => {
      const { resultText, insertedText } = getTextInsertedAtPosition({
        originalText: text,
        positionToInsert: cursorPosition.start,
        textToInsert: `${section} `,
      });

      setText(resultText);
    },
    [text, setText, cursorPosition.start],
  );
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
          Insert...
          <ChevronDown className="ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onCloseAutoFocus={onCloseAutoFocus}>
        {LYRIC_SECTION_ITEMS.map(({ label, value }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => insertLyricSection({ section: value })}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SectionInsertDropdown;
