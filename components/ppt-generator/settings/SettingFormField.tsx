import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { BaseSettingItemMetaType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Control, FieldValues } from "react-hook-form";
import SettingInputField from "./SettingInputField";
import SettingLabel from "./SettingLabel";

type SettingFormFieldProps = {
  control: Control<FieldValues, any, FieldValues>;
  name: string;
  settingField: BaseSettingItemMetaType;
} & React.HTMLAttributes<HTMLDivElement>;

const SettingFormField = ({
  control,
  name,
  settingField,
  className,
}: SettingFormFieldProps) => {
  if (settingField.isNotAvailable) {
    return;
  }
  return (
    <>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem
            className={cn(
              "grid grid-cols-6 items-center gap-x-3 py-4",
              className,
            )}
          >
            <div className="col-span-4 flex items-center justify-between">
              <SettingLabel
                displayLabel={settingField.fieldDisplayName}
                tips={settingField.tips}
              />
            </div>
            <FormControl>
              <SettingInputField settingItemMeta={settingField} field={field} />
            </FormControl>
            {/* <FormDescription className="col-span-6">
                      This is description.
                    </FormDescription> */}
            <FormMessage className="col-span-6 " />
          </FormItem>
        )}
      />
    </>
  );
};

export default SettingFormField;
