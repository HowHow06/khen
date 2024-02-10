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
} from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
  console.log("big chunk section render"); //TODO: remove this
  const mainTextareaRef = useRef<TextareaRefType>(null); // TODO: optimize this by using a context
  const secondaryTextareaRef = useRef<TextareaRefType>(null);
  const [secondaryText, setSecondaryText] = useState<string>("");

  // console.log(`defaultSettingsValue: `, defaultSettingsValue); // TODO: remove this
  // TODO: show errors if there is any error
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettingsValue,
  });
  // console.log("FORM error: ", form.formState.errors); // TODO: remove this
  // console.log("FORM values: ", form.getValues()); // TODO: remove this

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log("SUBMITE:", values);
    generatePpt({
      settingValues: values as PptSettingsStateType,
      primaryLyric: mainTextareaRef.current?.value || "",
      secondaryLyric: secondaryText,
    });
  }
  return (
    <>
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Container>
            <h2 className="mt-8 text-xl font-semibold tracking-tight">
              4. Settings
            </h2>
            <PptSettingsUIProvider>
              <PptGeneratorSetting />
            </PptSettingsUIProvider>
          </Container>
          <Container>
            <h2 className="mt-8 text-xl font-semibold tracking-tight">
              5. Generate PPT!
            </h2>
            <div className="mr-2 w-1/2">
              <div className="pb-2">
                {Object.entries(PPT_GENERATION_SETTINGS_META.file).map(
                  ([key, value]) => {
                    if (value.isHidden) {
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
                                  value.fieldType === SETTING_FIELD_TYPE.TEXT &&
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
    </>
  );
};

export default PptGeneratorClientSection;
