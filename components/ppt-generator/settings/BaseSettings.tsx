"use client";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { BaseSettingMetaType, PptSettingsStateType } from "@/lib/types";
import SettingFormField from "./SettingFormField";

type BaseSettingsProps = {
  settingsMeta: BaseSettingMetaType;
  keyPrefix: string;
};

const BaseSettings = ({ settingsMeta, keyPrefix }: BaseSettingsProps) => {
  const { form } = usePptGeneratorFormContext();
  const { control, getValues } = form;

  return (
    <div className="mr-2 grid divide-y py-2">
      {Object.entries(settingsMeta).map(([key, value]) => {
        return (
          <SettingFormField
            zodControl={control}
            name={keyPrefix + key}
            key={keyPrefix + key}
            settingField={value}
            settingsState={getValues() as PptSettingsStateType}
          />
        );
      })}
    </div>
  );
};

export default BaseSettings;
