import ColorPicker from "@/components/ui/color-picker";
import { Combobox } from "@/components/ui/combo-box";
import ImageDropzoneComponent from "@/components/ui/image-dropzone-component";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_IMAGES,
  FONT_FACES_ITEMS,
  HORIZONTAL_ALIGNMENT_ITEMS,
  SHADOW_TYPE_ITEMS,
} from "@/lib/constant";
import { SCREEN_SIZE } from "@/lib/constant/general";
import { useCustomFonts } from "@/lib/hooks/use-custom-fonts";
import { useScreenSize } from "@/lib/hooks/use-screen-size";
import {
  BaseSettingItemMetaType,
  ScreenSizeType,
  SelectionItemsType,
} from "@/lib/types";
import { ReactNode } from "react";
import { ControllerRenderProps, FieldValues } from "react-hook-form";
import { toast } from "sonner";
import ImageSelectDropdown from "./ImageSelectDropdown";

type SettingInputFieldProps = {
  settingItemMeta: BaseSettingItemMetaType;
  field: ControllerRenderProps<FieldValues, string>;
};

const renderInputField = (
  settingItemMeta: BaseSettingItemMetaType,
  field: ControllerRenderProps<FieldValues, string>,
  screenSize: ScreenSizeType,
  customFonts: string[],
): ReactNode => {
  if (settingItemMeta.fieldType === "boolean") {
    return (
      <Switch
        checked={field.value}
        onCheckedChange={field.onChange}
        disabled={settingItemMeta.isReadOnly}
      />
    );
  }

  if (settingItemMeta.fieldType === "number") {
    return (
      <Input
        {...field}
        className="col-span-2 text-xs"
        type="number"
        min={settingItemMeta.rangeMin}
        max={settingItemMeta.rangeMax}
        onChange={(event) => {
          let value = parseFloat(event.target.value);

          if (settingItemMeta.rangeMin && value < settingItemMeta.rangeMin) {
            value = settingItemMeta.rangeMin;
          }
          if (settingItemMeta.rangeMax && value > settingItemMeta.rangeMax) {
            value = settingItemMeta.rangeMax;
          }

          field.onChange(value);
        }}
        step={settingItemMeta.step}
        disabled={settingItemMeta.isReadOnly}
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
            dropdownItemClassName="text-xs"
          />
        </div>
        <ImageDropzoneComponent
          className="col-span-6 text-xs"
          onFilesSelected={(file) => {
            console.log("file", file);
            field.onChange(file);
          }}
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
      <div className="col-span-6 ml-4 flex flex-col items-center pt-2 text-sm">
        <ColorPicker
          color={field.value}
          onChange={field.onChange}
          showColorPicker={screenSize !== SCREEN_SIZE.XS}
          // TODO: implement disabled
        />
      </div>
    );
  }

  if (settingItemMeta.fieldType === "font") {
    // Combine default fonts with custom imported fonts
    const customFontItems: SelectionItemsType = customFonts.map((font) => ({
      value: font,
      label: `${font} (Custom)`,
    }));

    const allFontItems = [...FONT_FACES_ITEMS, ...customFontItems];

    return (
      <Combobox
        items={allFontItems}
        selectedValue={field.value}
        onItemSelect={field.onChange}
        notFoundLabel="Font not found."
        defaultLabel="Select font..."
        className="col-span-6 w-full text-xs"
        // TODO: implement disabled
      />
    );
  }

  if (settingItemMeta.fieldType === "horizontal-align") {
    return (
      <Combobox
        items={HORIZONTAL_ALIGNMENT_ITEMS}
        selectedValue={field.value}
        onItemSelect={field.onChange}
        className="col-span-6 w-full text-xs"
        hasNoSearch
        // TODO: implement disabled
      />
    );
  }

  if (settingItemMeta.fieldType === "shadow-type") {
    return (
      <Combobox
        items={SHADOW_TYPE_ITEMS}
        selectedValue={field.value}
        onItemSelect={field.onChange}
        className="col-span-6 w-full text-xs"
        hasNoSearch
        // TODO: implement disabled
      />
    );
  }

  if (settingItemMeta.fieldType === "percentage") {
    return (
      <Input
        {...field}
        className="col-span-2 text-xs"
        type="number"
        {...(settingItemMeta.useProportionForm
          ? { min: 0.0, max: 1.0, step: 0.1 }
          : { min: 0, max: 100 })}
        onChange={(event) => {
          let value = parseFloat(event.target.value);

          if (value < 0) {
            value = 0;
          }
          if (value > 100) {
            value = 100;
          }

          field.onChange(value);
        }}
        disabled={settingItemMeta.isReadOnly}
      />
    );
  }

  if (settingItemMeta.fieldType === "text") {
    return (
      <Input
        {...field}
        className="col-span-2 text-xs"
        disabled={settingItemMeta.isReadOnly}
      />
    );
  }

  throw new Error("Invalid Setting Input Field Type");
};

const SettingInputField = ({
  settingItemMeta,
  field,
}: SettingInputFieldProps) => {
  const screenSize = useScreenSize();
  const customFonts = useCustomFonts();

  return (
    <>{renderInputField(settingItemMeta, field, screenSize, customFonts)}</>
  );
};

export default SettingInputField;
