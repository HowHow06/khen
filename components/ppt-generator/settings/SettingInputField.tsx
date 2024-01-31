import { Combobox } from "@/components/ui/combo-box";
import { fontFacesItems } from "@/lib/constant";
import { BaseSettingItemMetaType } from "@/lib/types";
import { ReactNode } from "react";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import ColorPicker from "../../ui/color-picker";
import ImageDropzoneComponent from "../../ui/image-dropzone-component";
import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";

type SettingInputFieldProps = {
  settingItemMeta: BaseSettingItemMetaType;
  field: ControllerRenderProps<FieldValues, string>;
};

const renderInputField = (
  settingItemMeta: BaseSettingItemMetaType,
  field: ControllerRenderProps<FieldValues, string>,
): ReactNode => {
  if (settingItemMeta.fieldType == "boolean") {
    return <Switch checked={field.value} onCheckedChange={field.onChange} />;
  }

  if (settingItemMeta.fieldType == "number") {
    return <Input className="col-span-2 text-sm" type="number" {...field} />;
  }

  if (settingItemMeta.fieldType == "image") {
    return (
      <ImageDropzoneComponent
        className="col-span-6 text-sm"
        onFilesSelected={(file) => field.onChange(file)}
      />
    );
  }

  if (settingItemMeta.fieldType == "color") {
    return (
      <div className="col-span-6 ml-4 flex flex-col items-center">
        <ColorPicker color={field.value} onChange={field.onChange} />
      </div>
    );
  }

  if (settingItemMeta.fieldType == "font") {
    return (
      <Combobox
        items={fontFacesItems}
        selectedValue={field.value}
        onItemSelect={field.onChange}
        notFoundLabel="Font not found."
        defaultLabel="Select font..."
        className="col-span-6 w-full text-sm"
      />
    );
  }
  return <></>;
};

const SettingInputField = ({
  settingItemMeta,
  field,
}: SettingInputFieldProps) => {
  return <>{renderInputField(settingItemMeta, field)}</>;
};

export default SettingInputField;
