import { Combobox } from "@/components/ui/combo-box";
import {
  DEFAULT_IMAGES,
  FONT_FACES_ITEMS,
  HORIZONTAL_ALIGNMENT_ITEMS,
  SHADOW_TYPE_ITEMS,
} from "@/lib/constant";
import { BaseSettingItemMetaType } from "@/lib/types";
import { ReactNode } from "react";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import { toast } from "sonner";
import ColorPicker from "../../ui/color-picker";
import ImageDropzoneComponent from "../../ui/image-dropzone-component";
import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";
import ImageSelectDropdown from "./ImageSelectDropdown";

type SettingInputFieldProps = {
  settingItemMeta: BaseSettingItemMetaType;
  field: ControllerRenderProps<FieldValues, string>;
};

const renderInputField = (
  settingItemMeta: BaseSettingItemMetaType,
  field: ControllerRenderProps<FieldValues, string>,
): ReactNode => {
  if (settingItemMeta.fieldType === "boolean") {
    return <Switch checked={field.value} onCheckedChange={field.onChange} />;
  }

  if (settingItemMeta.fieldType === "number") {
    return (
      <Input
        {...field}
        className="col-span-2 text-sm"
        type="number"
        min={settingItemMeta.rangeMin}
        max={settingItemMeta.rangeMax}
        onChange={(event) => field.onChange(parseFloat(event.target.value))}
        step={settingItemMeta.step}
      />
    );
  }

  if (settingItemMeta.fieldType === "image") {
    return (
      <>
        <div className="col-span-2 ml-auto">
          <ImageSelectDropdown
            images={DEFAULT_IMAGES}
            align={"end"}
            onImageClick={(imagePath) => field.onChange(imagePath)}
          />
        </div>
        <ImageDropzoneComponent
          className="col-span-6 text-sm"
          onFilesSelected={(file) => field.onChange(file)}
          onFilesRejected={(fileRejections) => {
            fileRejections.forEach((fileRejection) => {
              const message = fileRejection.errors.reduce((result, error) => {
                return `${result}\n${error.message}`;
              }, "");
              toast.error("Failed to select image.", {
                description: message,
              });
            });
          }}
          value={field.value}
        />
      </>
    );
  }

  if (settingItemMeta.fieldType === "color") {
    return (
      <div className="col-span-6 ml-4 flex flex-col items-center">
        <ColorPicker color={field.value} onChange={field.onChange} />
      </div>
    );
  }

  if (settingItemMeta.fieldType === "font") {
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

  if (settingItemMeta.fieldType === "horizontal-align") {
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

  if (settingItemMeta.fieldType === "shadow-type") {
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

  if (settingItemMeta.fieldType === "percentage") {
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

  // TODO: add for text field when necessary
  return <></>;
};

const SettingInputField = ({
  settingItemMeta,
  field,
}: SettingInputFieldProps) => {
  return <>{renderInputField(settingItemMeta, field)}</>;
};

export default SettingInputField;
