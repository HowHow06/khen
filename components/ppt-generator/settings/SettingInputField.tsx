import { Combobox } from "@/components/ui/combo-box";
import {
  FONT_FACES_ITEMS,
  HORIZONTAL_ALIGNMENT_ITEMS,
  SHADOW_TYPE_ITEMS,
} from "@/lib/constant";
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
    return (
      <Input
        {...field}
        className="col-span-2 text-sm"
        type="number"
        onChange={(event) => field.onChange(parseFloat(event.target.value))}
      />
    );
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
        items={FONT_FACES_ITEMS}
        selectedValue={field.value}
        onItemSelect={field.onChange}
        notFoundLabel="Font not found."
        defaultLabel="Select font..."
        className="col-span-6 w-full text-sm"
      />
    );
  }

  if (settingItemMeta.fieldType == "horizontal-align") {
    return (
      <Combobox
        items={HORIZONTAL_ALIGNMENT_ITEMS}
        selectedValue={field.value}
        onItemSelect={field.onChange}
        className="col-span-6 w-full text-sm"
        hasNoSearch
      />
    );
  }

  if (settingItemMeta.fieldType == "shadow-type") {
    return (
      <Combobox
        items={SHADOW_TYPE_ITEMS}
        selectedValue={field.value}
        onItemSelect={field.onChange}
        className="col-span-6 w-full text-sm"
        hasNoSearch
      />
    );
  }

  if (settingItemMeta.fieldType == "percentage") {
    return (
      <Input
        {...field}
        className="col-span-2 text-sm"
        type="number"
        {...(settingItemMeta.useProportionForm
          ? { min: 0.0, max: 1.0, step: 0.1 }
          : { min: 0, max: 100 })}
        onChange={(event) => field.onChange(parseFloat(event.target.value))}
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
