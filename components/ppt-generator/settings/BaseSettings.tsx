"use client";
import { usePptGeneratorFormContext } from "@/components/context/PptGeneratorFormContext";
import { BaseSettingMetaType } from "@/lib/types";
import { cn } from "@/lib/utils";
import SettingFormField from "./common/SettingFormField";

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
  const { form, settingsValues } = usePptGeneratorFormContext();
  const { control } = form;

  return (
    <div className={cn("mr-2 grid divide-y pb-2", className)}>
      {Object.entries(settingsMeta).map(([key, value], index) => {
        return (
          <SettingFormField
            zodControl={control}
            name={keyPrefix + key}
            key={keyPrefix + key}
            settingField={value}
            settingsState={settingsValues}
            className={cn(index === 0 && "pt-0")}
          />
        );
      })}
    </div>
  );
};

export default BaseSettings;
