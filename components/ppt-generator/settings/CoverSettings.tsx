import { PPT_GENERATION_SETTINGS_META, SETTING_CATEGORY } from "@/lib/constant";
import { PptSettingsStateType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import SettingFormField from "./SettingFormField";

type CoverSettingsProps = {
  contentKey?: string;
};

const CoverSettings = ({
  contentKey,
  className,
}: CoverSettingsProps & React.HTMLAttributes<HTMLDivElement>) => {
  const { control, getValues } = useFormContext();

  const fieldNamePrefix =
    SETTING_CATEGORY.COVER + "." + (contentKey ? contentKey + "." : "");
  return (
    <div className={cn("mr-2 grid divide-y py-2", className)}>
      {Object.entries(PPT_GENERATION_SETTINGS_META.cover).map(
        ([key, value]) => {
          return (
            <SettingFormField
              zodControl={control}
              name={fieldNamePrefix + key}
              key={fieldNamePrefix + key}
              settingField={value}
              settingsState={getValues() as PptSettingsStateType}
            />
          );
        },
      )}
    </div>
  );
};

export default CoverSettings;
