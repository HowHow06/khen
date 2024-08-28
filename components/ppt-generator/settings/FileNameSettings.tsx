"use client";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  PPT_GENERATION_SETTINGS_META,
  SETTING_CATEGORY,
  SETTING_FIELD_TYPE,
} from "@/lib/constant";

type Props = {};

const FileNameSettings = (props: Props) => {
  const { form } = usePptGeneratorFormContext();
  const { control } = form;

  return (
    <div className="pb-2">
      {Object.entries(PPT_GENERATION_SETTINGS_META.file).map(([key, value]) => {
        if (value.isNotAvailable) {
          return;
        }
        return (
          <FormField
            control={control}
            name={SETTING_CATEGORY.FILE + "." + key}
            key={SETTING_CATEGORY.FILE + "." + key}
            render={({ field }) => (
              <FormItem className="grid grid-cols-6 items-center gap-x-2">
                <FormLabel className="col-span-2 text-left text-sm">
                  {value.fieldDisplayName}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="col-span-3 text-sm"
                    type="text"
                    placeholder={
                      value.fieldType === SETTING_FIELD_TYPE.TEXT &&
                      value.placeholder
                        ? value.placeholder
                        : undefined
                    }
                  />
                </FormControl>
                <FormMessage className="col-span-6 " />
              </FormItem>
            )}
          />
        );
      })}
    </div>
  );
};

export default FileNameSettings;
