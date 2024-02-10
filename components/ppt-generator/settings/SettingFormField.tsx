import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { BaseSettingItemMetaType, PptSettingsStateType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Control, FieldValues } from "react-hook-form";
import SettingInputField from "./SettingInputField";
import SettingLabel from "./SettingLabel";

type SettingFormFieldProps = {
  zodControl: Control<FieldValues, any, FieldValues>;
  name: string;
  settingField: BaseSettingItemMetaType;
  settingsState: PptSettingsStateType;
} & React.HTMLAttributes<HTMLDivElement>;

const SettingFormField = ({
  zodControl,
  name,
  settingField,
  settingsState,
  className,
}: SettingFormFieldProps) => {
  if (
    typeof settingField.isHidden === "function" &&
    settingField.isHidden(settingsState, name)
  ) {
    return;
  }

  if (settingField.isNotAvailable) {
    return;
  }
  return (
    <>
      <FormField
        control={zodControl}
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
