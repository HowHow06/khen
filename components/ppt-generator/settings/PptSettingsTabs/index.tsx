"use client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SETTING_CATEGORY } from "@/lib/constant";
import { cn } from "@/lib/utils";

type Props = {};

const PptSettingsTabs = (props: Props) => {
  return (
    <ScrollArea className="w-full pb-3">
      <TabsList className={cn("grid w-max min-w-full grid-cols-3")}>
        <TabsTrigger value={SETTING_CATEGORY.GENERAL} className="min-w-20">
          General
        </TabsTrigger>
        <TabsTrigger value={SETTING_CATEGORY.COVER} className="min-w-20">
          Cover
        </TabsTrigger>
        <TabsTrigger value={SETTING_CATEGORY.CONTENT} className="min-w-20">
          Content
        </TabsTrigger>
        <ScrollBar orientation="horizontal" />
      </TabsList>
    </ScrollArea>
  );
};

export default PptSettingsTabs;
