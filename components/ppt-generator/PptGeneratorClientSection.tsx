"use client";
import { PPT_GENERATION_SETTINGS_META } from "@/lib/constant";
import { settingsSchema } from "@/lib/schemas";
import { TextareaRefType } from "@/lib/types";
import { generatePptSettingsInitialState } from "@/lib/utils";
// import { zodResolver } from "@hookform/resolvers/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PptSettingsUIProvider } from "../context/PptSettingsUIContext";
import { Button } from "../ui/button";
import Container from "../ui/container";
import { Form } from "../ui/form";
import MainLyricSection from "./MainLyricSection";
import SecondaryLyricSection from "./SecondaryLyricSection";
import PptGeneratorSetting from "./settings/PptGeneratorSettings";
type Props = {};

const defaultSettingsValue = generatePptSettingsInitialState(
  PPT_GENERATION_SETTINGS_META,
);

const PptGeneratorClientSection = (props: Props) => {
  console.log("big chunk section render"); //TODO: remove this
  const mainTextareaRef = useRef<TextareaRefType>(null);
  const secondaryTextareaRef = useRef<TextareaRefType>(null);
  const [secondaryText, setSecondaryText] = useState<string>("");

  // console.log(`defaultSettingsValue: `, defaultSettingsValue); // TODO: remove this
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
            <div className="">
              <Button variant="default" type="submit">
                Generate
              </Button>
            </div>
          </Container>
        </form>
      </Form>
    </>
  );
};

export default PptGeneratorClientSection;
