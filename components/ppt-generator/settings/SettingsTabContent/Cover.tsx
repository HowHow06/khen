"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CONTENT_TYPE,
  PPT_GENERATION_SETTINGS_META,
  SETTING_CATEGORY,
} from "@/lib/constant";
import { cn } from "@/lib/utils";
import BaseSettings from "../BaseSettings";
import { TabContentWithInnerTabProp } from "./types";

type Props = TabContentWithInnerTabProp;

const CoverSettingsTabContent = ({
  tabsValue,
  onTabsValueChange,
  scrollAreaClassName,
  settingsPrefix,
}: Props) => {
  return (
    <TabsContent value={SETTING_CATEGORY.COVER}>
      <Tabs
        defaultValue={CONTENT_TYPE.MAIN}
        value={tabsValue}
        onValueChange={onTabsValueChange}
        className="w-full px-2"
      >
        <TabsList className="my-2 grid w-full grid-cols-2">
          <TabsTrigger value={CONTENT_TYPE.MAIN}>Main</TabsTrigger>
          <TabsTrigger value={CONTENT_TYPE.SECONDARY}>Secondary</TabsTrigger>
        </TabsList>
        <TabsContent value={CONTENT_TYPE.MAIN}>
          <ScrollArea
            className={cn("h-[50vh] pr-3 sm:h-[72vh]", scrollAreaClassName)}
          >
            <BaseSettings
              settingsMeta={PPT_GENERATION_SETTINGS_META.cover}
              keyPrefix={settingsPrefix + CONTENT_TYPE.MAIN + "."}
              className="pb-5 xl:pb-10"
            />
          </ScrollArea>
        </TabsContent>
        <TabsContent value={CONTENT_TYPE.SECONDARY}>
          <ScrollArea
            className={cn("h-[50vh] pr-3 sm:h-[72vh]", scrollAreaClassName)}
          >
            <BaseSettings
              settingsMeta={PPT_GENERATION_SETTINGS_META.cover}
              keyPrefix={settingsPrefix + CONTENT_TYPE.SECONDARY + "."}
              className="pb-5 xl:pb-10"
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
};

export default CoverSettingsTabContent;
