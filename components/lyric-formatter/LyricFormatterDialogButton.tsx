"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { formatLyrics } from "@/lib/utils/lyric-formatter";
import React, { useState } from "react";
import { toast } from "sonner";
import CopyToClipboardButton from "../CopyToClipboardButton";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import TooltipInfoIcon from "../ui/tooltip-info-icon";

type Props = {};

const LyricFormatterDialogButton = (props: Props) => {
  const [lyricContent, setLyricContent] = useState("");
  const [resultContent, setResultContent] = useState("");
  const [languageCount, setLanguageCount] = useState(2);
  const [isFirstLineSection, setIsFirstLineSection] = useState(false);

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
      const isLyricsValid = isFirstLineSection
        ? (lyrics.length - 1) % languageCount !== 0
        : lyrics.length % languageCount !== 0;
      if (isLyricsValid) {
        toast.warning(`Invalid input!`, {
          description: `Make sure the each line of lyric has corresponding translation.`,
          duration: 10 * 1000,
        });
        return;
      }

      const lyricsToFormat = isFirstLineSection ? [...lyrics.slice(1)] : lyrics;
      const tempResult = formatLyrics(lyricsToFormat, languageCount);

      tempResult.forEach((result, index) => {
        if (isFirstLineSection) {
          resultArray[index].push(lyrics[0]); // add first line
        }
        resultArray[index].push(...result, ""); //add empty line after each paragraph
      });
    }

    const resultText = resultArray
      .map((result) => result.join("\n"))
      .join("\n\n");

    setResultContent(resultText);
  };

  return (
    <Dialog open>
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
          <div className="flex flex-[2] flex-col space-y-1">
            <div className="flex flex-wrap justify-between sm:gap-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-nowrap">Lanaguage Count:</Label>
                  <Input
                    type="number"
                    value={languageCount}
                    max={100}
                    min={0}
                    onChange={(event) =>
                      setLanguageCount(parseFloat(event.target.value))
                    }
                    className="w-16"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label>Has section:</Label>
                  <Switch
                    checked={isFirstLineSection}
                    onCheckedChange={(isFirstLineSection) =>
                      setIsFirstLineSection(isFirstLineSection)
                    }
                  />
                  <TooltipInfoIcon tooltipText="First line of each paragraph is section name" />
                </div>
              </div>

              <Button onClick={onFormatClick}>Format</Button>
            </div>
            <Label className="text-xs font-normal text-muted-foreground">
              Input:
            </Label>
            <Textarea
              className="h-32 sm:h-[300px]"
              onChange={handleTextChange(setLyricContent)}
              value={lyricContent}
            />
          </div>
          <div className="flex flex-[1] flex-col space-y-1">
            <div className="flex space-x-4">
              <CopyToClipboardButton text={resultContent} />
            </div>
            <Label className="text-xs font-normal text-muted-foreground">
              Result:
            </Label>
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
