"use client";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
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
  TEXTBOX_GROUPING_PREFIX,
} from "@/lib/constant";
import { PptSettingsStateType } from "@/lib/types";
import { cn, groupByAsObject, toNormalCase } from "@/lib/utils";
import { useMemo } from "react";
import BaseSettings from "./BaseSettings";

type ContentSettingsProps = {
  accordionKey: string;
  keyPrefix: string;
};

const ContentSettings = ({
  accordionKey,
  keyPrefix,
  className,
}: ContentSettingsProps & React.HTMLAttributes<HTMLDivElement>) => {
  const { settingsUIState, setAccordionsOpen } = usePptSettingsUIContext();
  const { form } = usePptGeneratorFormContext();
  const { getValues } = form;
  const formValues = getValues() as PptSettingsStateType;
  const settingsMetaGrouped = useMemo(() => {
    const textBoxSettings = Array.from({
      length: formValues.general.singleLineMode
        ? 1
        : DEFAULT_LINE_COUNT_PER_SLIDE,
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
  }, [formValues.general.singleLineMode]);

  return (
    <div className={cn("mr-0", className)}>
      <Accordion
        type="multiple"
        className="w-full"
        value={settingsUIState.openAccordions[accordionKey]}
        defaultValue={[`${keyPrefix}text`]}
        onValueChange={(accordions) =>
          setAccordionsOpen({
            accordions: accordions,
            grouping: accordionKey,
          })
        }
      >
        {Object.entries(settingsMetaGrouped).map(([groupingName, settings]) => {
          return (
            <AccordionItem value={keyPrefix + groupingName} key={groupingName}>
              <AccordionTrigger className="text-base font-bold capitalize">
                {toNormalCase(groupingName)}
              </AccordionTrigger>
              <AccordionContent>
                <BaseSettings
                  keyPrefix={keyPrefix + groupingName + "."}
                  settingsMeta={settings}
                  className="mx-3 pb-2"
                  formFieldClassName="gap-y-2 space-y-0 py-3"
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default ContentSettings;
