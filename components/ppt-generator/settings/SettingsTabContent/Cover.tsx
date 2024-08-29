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
  settingsPrefix,
}: Props) => {
  return (
    <TabsContent className="flex-grow" value={SETTING_CATEGORY.COVER}>
      <Tabs
        defaultValue={CONTENT_TYPE.MAIN}
        value={tabsValue}
        onValueChange={onTabsValueChange}
        className="flex h-full w-full flex-col"
      >
        <TabsList className="my-1 grid w-full flex-shrink-0 grid-cols-2">
          <TabsTrigger value={CONTENT_TYPE.MAIN}>Main</TabsTrigger>
          <TabsTrigger value={CONTENT_TYPE.SECONDARY}>Secondary</TabsTrigger>
        </TabsList>
        <TabsContent className="flex-grow" value={CONTENT_TYPE.MAIN}>
          <ScrollArea className={cn("pr-3")} isFillParent>
            <BaseSettings
              settingsMeta={PPT_GENERATION_SETTINGS_META.cover}
              keyPrefix={settingsPrefix + CONTENT_TYPE.MAIN + "."}
              className="pb-5 xl:pb-10"
            />
          </ScrollArea>
        </TabsContent>
        <TabsContent className="flex-grow" value={CONTENT_TYPE.SECONDARY}>
          <ScrollArea className={cn("pr-3")} isFillParent>
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
