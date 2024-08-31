"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  CONTENT_TYPE,
  PPT_GENERATION_SETTINGS_META,
  SETTING_CATEGORY,
  TEXTBOX_GROUPING_PREFIX,
  TEXTBOX_SETTING_KEY,
} from "@/lib/constant";
import { cn, groupByAsObject } from "@/lib/utils";
import { useMemo } from "react";
import ContentTypeTabsList from "../ContentTypeTabsList";
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
    <TabsContent className="flex-grow" value={SETTING_CATEGORY.CONTENT}>
      <Tabs
        defaultValue={CONTENT_TYPE.MAIN}
        value={isIgnoreSubcontent ? CONTENT_TYPE.MAIN : tabsValue} // is subcontent ignored, force show main
        onValueChange={onTabsValueChange}
        className="flex h-full w-full flex-col"
      >
        {!isIgnoreSubcontent && <ContentTypeTabsList />}
        <TabsContent className="flex-grow" value={CONTENT_TYPE.MAIN}>
          <ScrollArea className={cn("pr-3")} isFillParent>
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
            />
          </ScrollArea>
        </TabsContent>
        {!isIgnoreSubcontent && (
          <TabsContent className="flex-grow" value={CONTENT_TYPE.SECONDARY}>
            <ScrollArea className={cn("pr-3")} isFillParent>
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
              />
            </ScrollArea>
          </TabsContent>
        )}
      </Tabs>
    </TabsContent>
  );
};

export default ContentSettingsTabContent;
