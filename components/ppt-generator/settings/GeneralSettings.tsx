import { PPT_GENERATION_SETTINGS_META, SETTING_CATEGORY } from "@/lib/constant";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Separator } from "../../ui/separator";
import SettingInputField from "./SettingInputField";

type GeneralSettingsProps = {
  // settings: PptSettingsState;
  // dispatch: React.Dispatch<PptSettingsAction>;
};

const GeneralSettings = ({}: GeneralSettingsProps) => {
  const { control } = useFormContext();

  return (
    <div className="mr-2 grid gap-3 py-4">
      {Object.entries(PPT_GENERATION_SETTINGS_META.general).map(
        ([key, value]) => {
          if (value.isHidden) {
            return;
          }
          return (
            <>
              <FormField
                control={control}
                name={SETTING_CATEGORY.GENERAL + "." + value.fieldSlug}
                key={SETTING_CATEGORY.GENERAL + "." + value.fieldSlug}
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center gap-3">
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
                    <Separator className="col-span-6 " />
                  </FormItem>
                )}
              />
              {/* <Label htmlFor={value.fieldSlug}>{value.fieldDisplayName}</Label> */}
            </>
          );
        },
      )}
    </div>
  );
};

export default GeneralSettings;
