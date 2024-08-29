"use client";
import { usePptSettingsUIContext } from "@/components/context/PptSettingsUIContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BaseSettingItemMetaType } from "@/lib/types";
import { cn, toNormalCase } from "@/lib/utils";
import BaseSettings from "./BaseSettings";

type Props = {
  accordionKey: string;
  defaultAccordionValue?: string[];
  keyPrefix: string;
  groupedSettingsMeta: {
    [key in string]: Record<string, BaseSettingItemMetaType>;
  };
};

const GroupedBaseSettings = ({
  accordionKey,
  defaultAccordionValue,
  keyPrefix,
  groupedSettingsMeta,
  className,
}: Props & React.HTMLAttributes<HTMLDivElement>) => {
  const { settingsUIState, setAccordionsOpen } = usePptSettingsUIContext();

  return (
    <div className={cn("mr-0", className)}>
      <Accordion
        type="multiple"
        className="w-full"
        value={settingsUIState.openAccordions[accordionKey]}
        defaultValue={defaultAccordionValue}
        onValueChange={(accordions) =>
          setAccordionsOpen({
            accordions: accordions,
            grouping: accordionKey,
          })
        }
      >
        {Object.entries(groupedSettingsMeta).map(([groupingName, settings]) => {
          return (
            <AccordionItem value={groupingName} key={groupingName}>
              <AccordionTrigger className="text-[.8rem] font-bold capitalize">
                {toNormalCase(groupingName)}
              </AccordionTrigger>
              <AccordionContent>
                <BaseSettings
                  keyPrefix={keyPrefix + groupingName + "."}
                  settingsMeta={settings}
                  className="mx-3"
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default GroupedBaseSettings;
