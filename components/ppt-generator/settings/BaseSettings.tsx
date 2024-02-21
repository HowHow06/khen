"use client";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { BaseSettingMetaType, PptSettingsStateType } from "@/lib/types";
import { cn } from "@/lib/utils";
import SettingFormField from "./SettingFormField";

type BaseSettingsProps = {
  settingsMeta: BaseSettingMetaType;
  keyPrefix: string;
  className?: string;
};

const BaseSettings = ({
  settingsMeta,
  keyPrefix,
  className,
}: BaseSettingsProps) => {
  const { form } = usePptGeneratorFormContext();
  const { control, getValues } = form;

  return (
    <div className={cn("mr-2 grid divide-y py-2", className)}>
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
