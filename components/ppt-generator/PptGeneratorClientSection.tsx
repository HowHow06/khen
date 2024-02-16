"use client";
import {
  PPT_GENERATION_SETTINGS_META,
  SETTING_CATEGORY,
  SETTING_FIELD_TYPE,
} from "@/lib/constant";
import { settingsSchema } from "@/lib/schemas";
import { PptSettingsStateType, TextareaRefType } from "@/lib/types";
import {
  generatePpt,
  generatePptSettingsInitialState,
  getPreset,
  toNormalCase,
  traverseAndCollect,
} from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { FieldError, FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PptSettingsUIProvider } from "../context/PptSettingsUIContext";
import { Button } from "../ui/button";
import Container from "../ui/container";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import MainLyricSection from "./MainLyricSection";
import SecondaryLyricSection from "./SecondaryLyricSection";
import PptGeneratorSetting from "./settings/PptGeneratorSettings";
type Props = {};

const defaultSettingsValue = process.env.NEXT_PUBLIC_DEFAULT_PPT_SETTING
  ? getPreset(process.env.NEXT_PUBLIC_DEFAULT_PPT_SETTING)
  : generatePptSettingsInitialState(PPT_GENERATION_SETTINGS_META);

const PptGeneratorClientSection = (props: Props) => {
  const mainTextareaRef = useRef<TextareaRefType>(null); // TODO: optimize this by using a context
  const secondaryTextareaRef = useRef<TextareaRefType>(null);
  const [secondaryText, setSecondaryText] = useState<string>("");

  // TODO: show errors popup if there is any error, open corresponding panel if possible
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettingsValue,
  });

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    generatePpt({
      settingValues: values as PptSettingsStateType,
      primaryLyric: mainTextareaRef.current?.value || "",
      secondaryLyric: secondaryText,
    });
  }

  function onInvalidSubmit(errorsObject: FieldErrors<PptSettingsStateType>) {
    const errors = traverseAndCollect<FieldError, true>(
      errorsObject,
      "message",
      {
        getParentObject: true,
        getPath: true,
      },
    );

    errors.forEach((error) => {
      const pathArray = error.path.split(".");
      const category = pathArray[0];
      const fieldName = pathArray[pathArray.length - 1];

      toast.error(`Error in ${category} section.`, {
        description: `${toNormalCase(fieldName)}: ${error.message}`,
        duration: 10 * 1000,
        closeButton: true,
        // action: { // TODO: focus on the field with error when button is clicked (khen-56)
        //   label: "Goto",
        //   onClick: () => {
        //   },
        // },
      });
    });
  }
  // console.log("FORM VALUE:", form.getValues()); // TODO: remove this

  return (
    <>
      <PptSettingsUIProvider>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
            className="space-y-8"
          >
            <Container>
              <h2 className="mt-8 text-xl font-semibold tracking-tight">
                2. Insert Main Lyric
              </h2>
              {/* TODO: memoize so that it does not get rerender when secondary text change */}
              <MainLyricSection
                mainTextareaRef={mainTextareaRef}
                updateSecondaryText={setSecondaryText}
              />
            </Container>
            <Container>
              <h2 className="mt-8 text-xl font-semibold tracking-tight">
                3. Insert Secondary Lyric
              </h2>
              <SecondaryLyricSection
                secondaryTextareaRef={secondaryTextareaRef}
                secondaryText={secondaryText}
                setSecondaryText={setSecondaryText}
              />
            </Container>
            <Container>
              <h2 className="mt-8 text-xl font-semibold tracking-tight">
                4. Settings
              </h2>
              <PptGeneratorSetting />
            </Container>
            <Container>
              <h2 className="mt-8 text-xl font-semibold tracking-tight">
                5. Generate PPT!
              </h2>
              <div className="mr-2 w-1/2">
                <div className="pb-2">
                  {Object.entries(PPT_GENERATION_SETTINGS_META.file).map(
                    ([key, value]) => {
                      if (value.isNotAvailable) {
                        return;
                      }
                      return (
                        <FormField
                          control={form.control}
                          name={SETTING_CATEGORY.FILE + "." + key}
                          key={SETTING_CATEGORY.FILE + "." + key}
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-6 items-center gap-x-2">
                              <FormLabel className="col-span-2 text-left text-sm">
                                {value.fieldDisplayName}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="col-span-3 text-sm"
                                  type="text"
                                  placeholder={
                                    value.fieldType ===
                                      SETTING_FIELD_TYPE.TEXT &&
                                    value.placeholder
                                      ? value.placeholder
                                      : undefined
                                  }
                                />
                              </FormControl>
                              <FormMessage className="col-span-6 " />
                            </FormItem>
                          )}
                        />
                      );
                    },
                  )}
                </div>
                <div>
                  <Button variant="default" type="submit">
                    Generate
                  </Button>
                </div>
              </div>
            </Container>
          </form>
        </Form>
      </PptSettingsUIProvider>
    </>
  );
};

export default PptGeneratorClientSection;
