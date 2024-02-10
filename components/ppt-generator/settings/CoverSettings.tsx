import { PPT_GENERATION_SETTINGS_META, SETTING_CATEGORY } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import SettingInputField from "./SettingInputField";

type CoverSettingsProps = {
  contentKey?: string;
};

const CoverSettings = ({
  contentKey,
  className,
}: CoverSettingsProps & React.HTMLAttributes<HTMLDivElement>) => {
  const { control } = useFormContext();

  const fieldNamePrefix =
    SETTING_CATEGORY.COVER + "." + (contentKey ? contentKey + "." : "");
  return (
    <div className={cn("mr-2 grid divide-y py-2", className)}>
      {Object.entries(PPT_GENERATION_SETTINGS_META.cover).map(
        ([key, value]) => {
          if (value.isHidden) {
            return;
          }
          return (
            <FormField
              control={control}
              name={fieldNamePrefix + key}
              key={fieldNamePrefix + key}
              render={({ field }) => (
                <FormItem className="grid grid-cols-6 items-center gap-x-3 py-4">
                  <FormLabel className="col-span-4 text-left text-sm">
                    {value.fieldDisplayName}
                  </FormLabel>
                  <FormControl>
                    <SettingInputField settingItemMeta={value} field={field} />
                  </FormControl>
                  {/* <FormDescription className="col-span-6">
                      This is description.
                    </FormDescription> */}
                  <FormMessage className="col-span-6 " />
                </FormItem>
              )}
            />
          );
        },
      )}
    </div>
  );
};

export default CoverSettings;
