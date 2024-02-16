import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { PPT_GENERATION_SETTINGS_META, SETTING_CATEGORY } from "@/lib/constant";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Separator } from "../../ui/separator";
import SettingInputField from "./SettingInputField";

type SectionSettingsProps = {};

// TODO: to implement
const SectionSettings = ({}: SectionSettingsProps) => {
  const { form } = usePptGeneratorFormContext();
  const { control } = form;

  return (
    <div className="mr-2 grid gap-3 py-4">
      {Object.entries(PPT_GENERATION_SETTINGS_META.section).map(
        ([key, value]) => {
          if (value.isNotAvailable) {
            return;
          }
          return (
            <FormField
              control={control}
              name={SETTING_CATEGORY.SECTION + "." + key}
              key={SETTING_CATEGORY.SECTION + "." + key}
              render={({ field }) => (
                <FormItem className="grid grid-cols-6 items-center gap-3">
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
                  <Separator className="col-span-6 " />
                </FormItem>
              )}
            />
          );
        },
      )}
    </div>
  );
};

export default SectionSettings;
