import { PPT_GENERATION_SETTINGS_META, SETTING_CATEGORY } from "@/lib/constant";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import SettingInputField from "./SettingInputField";

type GeneralSettingsProps = {};

const GeneralSettings = ({}: GeneralSettingsProps) => {
  const { control } = useFormContext();

  return (
    <div className="mr-2 grid divide-y py-2">
      {Object.entries(PPT_GENERATION_SETTINGS_META.general).map(
        ([key, value]) => {
          if (value.isHidden) {
            return;
          }
          return (
            <FormField
              control={control}
              name={SETTING_CATEGORY.GENERAL + "." + value.fieldKey}
              key={SETTING_CATEGORY.GENERAL + "." + value.fieldKey}
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

export default GeneralSettings;
