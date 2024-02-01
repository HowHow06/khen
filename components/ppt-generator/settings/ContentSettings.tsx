"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PPT_GENERATION_SETTINGS_META, SETTING_CATEGORY } from "@/lib/constant";
import { cn, groupBy } from "@/lib/utils";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import SettingInputField from "./SettingInputField";

type ContentSettingsProps = {
  contentKey?: string;
};

const ContentSettings = ({
  contentKey,
  className,
}: ContentSettingsProps & React.HTMLAttributes<HTMLDivElement>) => {
  const { control } = useFormContext();
  const settingsMetaGrouped = useMemo(
    () => groupBy(PPT_GENERATION_SETTINGS_META.content, "groupingName"),
    [],
  );
  const fieldNamePrefix =
    SETTING_CATEGORY.CONTENT + "." + (contentKey ? contentKey + "." : "");

  return (
    <div className={cn("mr-0", className)}>
      <Accordion type="multiple" className="w-full">
        {Object.entries(settingsMetaGrouped).map(([groupingName, settings]) => {
          return (
            <>
              <AccordionItem value={groupingName}>
                <AccordionTrigger className="text-base font-bold capitalize">
                  {groupingName}
                </AccordionTrigger>
                <AccordionContent className="mx-3 grid divide-y pb-2">
                  {settings.map((value) => {
                    if (value.isHidden) {
                      return;
                    }
                    return (
                      <>
                        <FormField
                          control={control}
                          name={fieldNamePrefix + value.fieldKey}
                          key={fieldNamePrefix + value.fieldKey}
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-6 items-center gap-x-3 gap-y-2 space-y-0 py-3">
                              <FormLabel className="col-span-4 text-left text-sm">
                                {value.fieldDisplayName}
                              </FormLabel>
                              <FormControl>
                                <SettingInputField
                                  settingItemMeta={value}
                                  field={field}
                                />
                              </FormControl>
                              {/* <FormDescription className="col-span-6">
                          This is description.
                        </FormDescription> */}
                              <FormMessage className="col-span-6 " />
                            </FormItem>
                          )}
                        />
                        {/* <Label htmlFor={value.fieldSlug}>{value.fieldDisplayName}</Label> */}
                      </>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            </>
          );
        })}
      </Accordion>
    </div>
  );
};

export default ContentSettings;