"use client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SETTING_CATEGORY } from "@/lib/constant";
import { cn } from "@/lib/utils/general";

type Props = {};

const PptGeneratorSettingsTabsList = (props: Props) => {
  return (
    <ScrollArea className="w-full flex-shrink-0">
      <TabsList className={cn("grid h-9 w-max min-w-full grid-cols-3")}>
        <TabsTrigger
          value={SETTING_CATEGORY.GENERAL}
          className="min-w-20 text-xs"
        >
          General
        </TabsTrigger>
        <TabsTrigger
          value={SETTING_CATEGORY.COVER}
          className="min-w-20 text-xs"
        >
          Cover
        </TabsTrigger>
        <TabsTrigger
          value={SETTING_CATEGORY.CONTENT}
          className="min-w-20 text-xs"
        >
          Content
        </TabsTrigger>
        <ScrollBar orientation="horizontal" />
      </TabsList>
    </ScrollArea>
  );
};

export default PptGeneratorSettingsTabsList;
