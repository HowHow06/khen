import { PPT_GENERATION_SETTINGS_META } from "@/lib/constant";
import { BaseSettingItemMetaType } from "@/lib/types";
import { ReactNode } from "react";
import {
  ControllerRenderProps,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import ColorPicker from "../ui/color-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import ImageDropzoneComponent from "../ui/image-dropzone-component";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";

type GeneralSettingsProps = {
  // settings: PptSettingsState;
  // dispatch: React.Dispatch<PptSettingsAction>;
};

// TODO: move this to utils
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
      <div className="col-span-6 ml-4">
        <ColorPicker color={field.value} onChange={field.onChange} />
      </div>
    );
  }
  return <></>;
};

const GeneralSettings = ({}: GeneralSettingsProps) => {
  const { control } = useFormContext();

  return (
    <div className="mr-2 grid gap-3 py-4">
      {Object.entries(PPT_GENERATION_SETTINGS_META.general).map(
        ([key, value]) => {
          if (value.isHidden) {
            return;
          }
          return (
            <>
              <FormField
                control={control}
                name={"general." + key}
                key={"general." + key}
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center gap-3">
                    <FormLabel className="col-span-4 text-left text-sm">
                      {value.fieldDisplayName}
                    </FormLabel>
                    <FormControl>{renderInputField(value, field)}</FormControl>
                    {/* <FormDescription className="col-span-6">
                      This is description.
                    </FormDescription> */}
                    <FormMessage className="col-span-6 " />
                    <Separator className="col-span-6 " />
                  </FormItem>
                )}
              />
              {/* <Label htmlFor={value.fieldSlug}>{value.fieldDisplayName}</Label> */}
            </>
          );
        },
      )}
    </div>
  );
};

export default GeneralSettings;
