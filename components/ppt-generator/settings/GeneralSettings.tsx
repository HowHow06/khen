"use client";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { PPT_GENERATION_SETTINGS_META, SETTING_CATEGORY } from "@/lib/constant";
import { PptSettingsStateType } from "@/lib/types";
import SettingFormField from "./SettingFormField";

type GeneralSettingsProps = {};

const GeneralSettings = ({}: GeneralSettingsProps) => {
  const { form } = usePptGeneratorFormContext();
  const { control, getValues } = form;

  return (
    <div className="mr-2 grid divide-y py-2">
      {Object.entries(PPT_GENERATION_SETTINGS_META.general).map(
        ([key, value]) => {
          return (
            <SettingFormField
              zodControl={control}
              name={SETTING_CATEGORY.GENERAL + "." + key}
              key={SETTING_CATEGORY.GENERAL + "." + key}
              settingField={value}
              settingsState={getValues() as PptSettingsStateType}
            />
          );
        },
      )}
    </div>
  );
};

export default GeneralSettings;
