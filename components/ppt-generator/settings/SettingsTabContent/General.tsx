import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import { PPT_GENERATION_SETTINGS_META, SETTING_CATEGORY } from "@/lib/constant";
import { BaseSettingMetaType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import BaseSettings from "../BaseSettings";
import { TabContentBaseProp } from "./types";

type Props = TabContentBaseProp &
  (
    | {
        isForSection: boolean;
        isSectionUseMainSectionSettings: boolean;
      }
    | {
        isForSection?: never;
        isSectionUseMainSectionSettings?: never;
      }
  );

const GeneralSettingsTabContent = ({
  settingsPrefix,
  isForSection,
  isSectionUseMainSectionSettings = false,
}: Props) => {
  const settingMetaToUse: BaseSettingMetaType = useMemo(() => {
    if (!isForSection) {
      return PPT_GENERATION_SETTINGS_META.general;
    }

    if (isSectionUseMainSectionSettings) {
      return {
        useMainSectionSettings:
          PPT_GENERATION_SETTINGS_META.section.useMainSectionSettings,
      }; // show only useMainSectionSettings
    }

    return PPT_GENERATION_SETTINGS_META.section;
  }, [isForSection, isSectionUseMainSectionSettings]);

  return (
    <TabsContent className="flex-grow" value={SETTING_CATEGORY.GENERAL}>
      <ScrollArea className={cn("pl-3 pr-4")} isFillParent>
        <BaseSettings
          settingsMeta={settingMetaToUse}
          keyPrefix={settingsPrefix}
        />
      </ScrollArea>
    </TabsContent>
  );
};

export default GeneralSettingsTabContent;
