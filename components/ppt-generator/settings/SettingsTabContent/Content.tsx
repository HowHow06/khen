"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CONTENT_TYPE,
  PPT_GENERATION_SETTINGS_META,
  SETTING_CATEGORY,
  TEXTBOX_GROUPING_PREFIX,
  TEXTBOX_SETTING_KEY,
} from "@/lib/constant";
import { cn, groupByAsObject } from "@/lib/utils";
import { useMemo } from "react";
import GroupedBaseSettings from "../GroupedBaseSettings";
import { TabContentWithInnerTabProp } from "./types";

type Props = TabContentWithInnerTabProp & {
  textBoxCount: number;
  isIgnoreSubcontent?: boolean;
};

const groupedContentSettings = groupByAsObject(
  PPT_GENERATION_SETTINGS_META.content,
  "groupingName",
);

const ContentSettingsTabContent = ({
  tabsValue,
  onTabsValueChange,
  scrollAreaClassName,
  settingsPrefix,
  isIgnoreSubcontent = false,
  textBoxCount,
}: Props) => {
  const groupedTextBoxSettings = useMemo(() => {
    return Array.from({
      length: textBoxCount,
    }).reduce<{}>((result, _, currentIndex) => {
      return {
        ...result,
        [`${TEXTBOX_GROUPING_PREFIX}${currentIndex + 1}`]:
          PPT_GENERATION_SETTINGS_META.contentTextbox,
      };
    }, {});
  }, [textBoxCount]);

  return (
    <TabsContent value={SETTING_CATEGORY.CONTENT}>
      <Tabs
        defaultValue={CONTENT_TYPE.MAIN}
        value={tabsValue}
        onValueChange={onTabsValueChange}
        className="w-full px-2"
      >
        {!isIgnoreSubcontent && (
          <TabsList className="my-2 grid w-full grid-cols-2">
            <TabsTrigger value={CONTENT_TYPE.MAIN}>Main</TabsTrigger>
            <TabsTrigger value={CONTENT_TYPE.SECONDARY}>Secondary</TabsTrigger>
          </TabsList>
        )}
        <TabsContent value={CONTENT_TYPE.MAIN}>
          <ScrollArea
            className={cn("h-[50vh] pr-3 sm:h-[72vh]", scrollAreaClassName)}
          >
            <GroupedBaseSettings
              keyPrefix={`${settingsPrefix}${CONTENT_TYPE.MAIN}.${TEXTBOX_SETTING_KEY}.`}
              accordionKey={CONTENT_TYPE.MAIN + TEXTBOX_SETTING_KEY}
              groupedSettingsMeta={groupedTextBoxSettings}
            />
            <GroupedBaseSettings
              keyPrefix={`${settingsPrefix}${CONTENT_TYPE.MAIN}.`}
              accordionKey={CONTENT_TYPE.MAIN}
              groupedSettingsMeta={groupedContentSettings}
              defaultAccordionValue={[`text`]}
              className="pb-5 xl:pb-10"
            />
          </ScrollArea>
        </TabsContent>
        {!isIgnoreSubcontent && (
          <TabsContent value={CONTENT_TYPE.SECONDARY}>
            <ScrollArea
              className={cn("h-[50vh] pr-3 sm:h-[72vh]", scrollAreaClassName)}
            >
              <GroupedBaseSettings
                keyPrefix={`${settingsPrefix}${CONTENT_TYPE.SECONDARY}.${TEXTBOX_SETTING_KEY}.`}
                accordionKey={CONTENT_TYPE.SECONDARY + TEXTBOX_SETTING_KEY}
                groupedSettingsMeta={groupedTextBoxSettings}
              />
              <GroupedBaseSettings
                keyPrefix={`${settingsPrefix}${CONTENT_TYPE.SECONDARY}.`}
                accordionKey={CONTENT_TYPE.SECONDARY}
                groupedSettingsMeta={groupedContentSettings}
                defaultAccordionValue={[`text`]}
                className="pb-5 xl:pb-10"
              />
            </ScrollArea>
          </TabsContent>
        )}
      </Tabs>
    </TabsContent>
  );
};

export default ContentSettingsTabContent;
