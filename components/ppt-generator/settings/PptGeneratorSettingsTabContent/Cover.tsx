"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  CONTENT_TYPE,
  PPT_GENERATION_SETTINGS_META,
  SETTING_CATEGORY,
} from "@/lib/constant";
import { cn } from "@/lib/utils/general";
import BaseSettings from "../BaseSettings";
import ContentTypeTabsList from "../ContentTypeTabsList";
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
        <ContentTypeTabsList />
        <TabsContent className="flex-grow" value={CONTENT_TYPE.MAIN}>
          <ScrollArea className={cn("pr-3")} isFillParent>
            <BaseSettings
              settingsMeta={PPT_GENERATION_SETTINGS_META.cover}
              keyPrefix={settingsPrefix + CONTENT_TYPE.MAIN + "."}
            />
          </ScrollArea>
        </TabsContent>
        <TabsContent className="flex-grow" value={CONTENT_TYPE.SECONDARY}>
          <ScrollArea className={cn("pr-3")} isFillParent>
            <BaseSettings
              settingsMeta={PPT_GENERATION_SETTINGS_META.cover}
              keyPrefix={settingsPrefix + CONTENT_TYPE.SECONDARY + "."}
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
};

export default CoverSettingsTabContent;
