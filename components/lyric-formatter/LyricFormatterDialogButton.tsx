"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatLyrics } from "@/lib/utils/lyric-formatter";
import React, { useState } from "react";
import { toast } from "sonner";
import CopyToClipboardButton from "../CopyToClipboardButton";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

type Props = {};

const LyricFormatterDialogButton = (props: Props) => {
  const [lyricContent, setLyricContent] = useState("");
  const [resultContent, setResultContent] = useState("");
  const [languageCount, setLanguageCount] = useState(2);

  const handleTextChange =
    (textUpdateHandler: (text: string) => void) =>
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      textUpdateHandler(event.target.value);
    };

  const onFormatClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const paragraphs = lyricContent.trim().split("\n\n");
    const resultArray: string[][] = Array.from(
      { length: languageCount },
      () => [],
    );

    for (const paragraph of paragraphs) {
      const lyrics = paragraph.trim().split("\n");
      if (lyrics.length % languageCount !== 0) {
        toast.warning(`Invalid input!`, {
          description: `Make sure the each line of lyric has corresponding translation.`,
          duration: 10 * 1000,
        });
        return;
      }
      const tempResult = formatLyrics(lyrics, languageCount);
      tempResult.forEach(
        (result, index) => resultArray[index].push(...result, ""), //add empty line
      );
    }

    const resultText = resultArray
      .map((result) => result.join("\n"))
      .join("\n\n");

    setResultContent(resultText);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Split Lyrics By Language</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[80vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle className="text-left">
            Multi-languages Lyric Formatter
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col justify-between space-x-0 space-y-4 sm:flex-row sm:space-x-2 sm:space-y-0">
          <div className="flex flex-[2] flex-col space-y-2">
            <div className="flex flex-wrap sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Label className="text-nowrap">Lanaguage Count:</Label>
                <Input
                  type="number"
                  value={languageCount}
                  max={100}
                  min={0}
                  onChange={(event) =>
                    setLanguageCount(parseFloat(event.target.value))
                  }
                />
              </div>

              <Button onClick={onFormatClick}>Format</Button>
            </div>
            <Textarea
              className="h-32 sm:h-[300px]"
              onChange={handleTextChange(setLyricContent)}
              value={lyricContent}
            />
          </div>
          <div className="flex flex-[1] flex-col space-y-2">
            <div className="flex space-x-4">
              <CopyToClipboardButton text={resultContent} />
            </div>
            <Textarea
              className="h-32 sm:h-[300px]"
              readOnly
              value={resultContent}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LyricFormatterDialogButton;
