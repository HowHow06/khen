"use client";
import { PPT_GENERATION_SETTINGS_META } from "@/lib/constant";
import { settingsSchema } from "@/lib/schemas";
import { PptSettingsStateType } from "@/lib/types";
import {
  generatePpt,
  generatePptSettingsInitialState,
  getPreset,
  toNormalCase,
  traverseAndCollect,
} from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { ReactNode, createContext, useContext, useState } from "react";
import {
  FieldError,
  FieldErrors,
  UseFormReturn,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Form } from "../ui/form";

type PptGeneratorFormContextType = {
  mainText: string;
  secondaryText: string;
  // mainTextareaRef: MutableRefObject<TextareaRefType>;
  // secondaryTextareaRef: MutableRefObject<TextareaRefType>;
  setMainText: (text: string) => void;
  setSecondaryText: (text: string) => void;
  form: UseFormReturn<z.infer<typeof settingsSchema>>; // Include the entire form object from React Hook Form
};

const PptGeneratorFormContext = createContext<
  PptGeneratorFormContextType | undefined
>(undefined);

const defaultSettingsValue = process.env.NEXT_PUBLIC_DEFAULT_PPT_SETTING
  ? getPreset(process.env.NEXT_PUBLIC_DEFAULT_PPT_SETTING)
  : generatePptSettingsInitialState(PPT_GENERATION_SETTINGS_META);

type PptGeneratorFormProviderProps = {
  children: ReactNode;
};

export const PptGeneratorFormProvider: React.FC<
  PptGeneratorFormProviderProps
> = ({ children }) => {
  const [mainText, setMainText] = useState("");
  const [secondaryText, setSecondaryText] = useState("");

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettingsValue,
  });

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    generatePpt({
      settingValues: values as PptSettingsStateType,
      primaryLyric: mainText || "",
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

  return (
    <PptGeneratorFormContext.Provider
      value={{
        mainText,
        secondaryText,
        setMainText,
        setSecondaryText,
        form,
      }}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
          className="space-y-8"
        >
          {children}
        </form>
      </Form>
    </PptGeneratorFormContext.Provider>
  );
};

export const usePptGeneratorFormContext = (): PptGeneratorFormContextType => {
  const context = useContext(PptGeneratorFormContext);
  if (context === undefined) {
    throw new Error(
      "usePptGeneratorFormContext must be used within a PptGeneratorFormProvider",
    );
  }
  return context;
};
