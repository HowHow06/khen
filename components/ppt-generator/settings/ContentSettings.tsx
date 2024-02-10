"use client";
import { usePptSettingsUIContext } from "@/components/context/PptSettingsUIContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DEFAULT_LINE_COUNT_PER_SLIDE,
  PPT_GENERATION_SETTINGS_META,
  SETTING_CATEGORY,
  TEXTBOX_GROUPING_PREFIX,
} from "@/lib/constant";
import { cn, groupByAsObject, toNormalCase } from "@/lib/utils";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import SettingFormField from "./SettingFormField";

type ContentSettingsProps = {
  contentKey?: string;
};

const ContentSettings = ({
  contentKey,
  className,
}: ContentSettingsProps & React.HTMLAttributes<HTMLDivElement>) => {
  const { settingsUIState, setAccordionsOpen } = usePptSettingsUIContext();
  const { control } = useFormContext();
  const settingsMetaGrouped = useMemo(() => {
    const textBoxSettings = Array.from({
      length: DEFAULT_LINE_COUNT_PER_SLIDE,
    }).reduce<{}>((result, _, currentIndex) => {
      return {
        ...result,
        [`${TEXTBOX_GROUPING_PREFIX}${currentIndex + 1}`]:
          PPT_GENERATION_SETTINGS_META.contentTextbox,
      };
    }, {});
    return {
      ...textBoxSettings,
      ...groupByAsObject(PPT_GENERATION_SETTINGS_META.content, "groupingName"),
    };
  }, []);

  const fieldNamePrefix =
    SETTING_CATEGORY.CONTENT + "." + (contentKey ? contentKey + "." : "");

  return (
    <div className={cn("mr-0", className)}>
      <Accordion
        type="multiple"
        className="w-full"
        value={
          contentKey
            ? settingsUIState.openAccordions[contentKey]
            : settingsUIState.openAccordions["base"]
        }
        onValueChange={(accordions) =>
          setAccordionsOpen({
            accordions: accordions,
            grouping: contentKey,
          })
        }
      >
        {Object.entries(settingsMetaGrouped).map(([groupingName, settings]) => {
          return (
            <AccordionItem
              value={fieldNamePrefix + groupingName}
              key={groupingName}
            >
              <AccordionTrigger className="text-base font-bold capitalize">
                {toNormalCase(groupingName)}
              </AccordionTrigger>
              <AccordionContent className="mx-3 grid divide-y pb-2">
                {Object.entries(settings).map(([key, value]) => {
                  return (
                    <SettingFormField
                      control={control}
                      name={fieldNamePrefix + groupingName + "." + key}
                      key={fieldNamePrefix + groupingName + "." + key}
                      settingField={value}
                      className="gap-y-2 space-y-0 py-3"
                    />
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default ContentSettings;
