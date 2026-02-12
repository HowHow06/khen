import { LYRIC_SECTION_ITEMS } from "@/lib/constant";
import { CursorPosition } from "@/lib/types";
import { getTextInsertedAtPosition } from "@/lib/utils/general";
import { useCallback } from "react";
import {
  CommandDialog,
  CommandDialogProps,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

type Props = CommandDialogProps & {
  text: string;
  setText: (text: string) => void;
  cursorPosition: CursorPosition;
};

const LyricSectionCommand = ({
  text,
  setText,
  cursorPosition,
  ...restProps
}: Props) => {
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
    <CommandDialog {...restProps}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Inserts...">
          {LYRIC_SECTION_ITEMS.map(({ label, value }) => (
            <CommandItem
              key={value}
              value={`/${label}`}
              onSelect={() => {
                insertLyricSection({ section: value });
                if (restProps.onOpenChange) {
                  restProps.onOpenChange(false);
                }
              }}
            >
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default LyricSectionCommand;
