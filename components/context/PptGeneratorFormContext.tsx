"use client";
import { PPT_GENERATION_SETTINGS_META } from "@/lib/constant";
import { DIALOG_RESULT } from "@/lib/constant/general";
import useMemoizedSettingsValues from "@/lib/hooks/use-memoized-settings-values";
import usePptSettingsDynamicTextboxCount from "@/lib/hooks/use-ppt-settings-dynamic-textbox-count";
import usePptSettingsSections from "@/lib/hooks/use-ppt-settings-sections";
import { pptPresets } from "@/lib/presets";
import { settingsSchema } from "@/lib/schemas";
import { PptSettingsStateType, SelectionItemsType } from "@/lib/types";
import {
  combineWithDefaultSettings,
  generatePpt,
  generatePptSettingsInitialState,
  getPreset,
  toNormalCase,
  traverseAndCollect,
} from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import {
  FieldError,
  FieldErrors,
  UseFormReturn,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Form } from "../ui/form";
import { useAlertDialog } from "./AlertDialogContext";

type PptGeneratorFormContextType = {
  mainText: string;
  secondaryText: string;
  setMainText: (text: string) => void;
  setSecondaryText: (text: string) => void;
  form: UseFormReturn<z.infer<typeof settingsSchema>>;
  settingsValues: PptSettingsStateType;
  sectionItems: SelectionItemsType;
  currentSection: string;
  setCurrentSection: Dispatch<SetStateAction<string>>;
};

const PptGeneratorFormContext = createContext<
  PptGeneratorFormContextType | undefined
>(undefined);

let defaultSettingsValue = generatePptSettingsInitialState(
  PPT_GENERATION_SETTINGS_META,
);

if (process.env.NEXT_PUBLIC_DEFAULT_PPT_SETTING) {
  const preset = getPreset(
    process.env.NEXT_PUBLIC_DEFAULT_PPT_SETTING,
    pptPresets,
  );
  if (preset) {
    defaultSettingsValue = combineWithDefaultSettings(preset);
  }
}

type PptGeneratorFormProviderProps = {
  children: ReactNode;
};

export const PptGeneratorFormProvider: React.FC<
  PptGeneratorFormProviderProps
> = ({ children }) => {
  const [mainText, setMainText] = useState("");
  const [secondaryText, setSecondaryText] = useState("");
  const { showDialog } = useAlertDialog();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettingsValue,
  });

  // form.watch will make this component rerender on value change
  const settingsValues = useMemoizedSettingsValues({
    newSettingsValues: form.watch() as PptSettingsStateType,
  });

  usePptSettingsDynamicTextboxCount({ settingsValues, formReset: form.reset });

  const { sectionItems, currentSection, setCurrentSection } =
    usePptSettingsSections({
      mainText,
      settingsValues,
      formReset: form.reset,
    });

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    if (process.env.NODE_ENV === "development") {
      const submittedValue = values as PptSettingsStateType;
      console.log("Submitted Value:", submittedValue);
    }
    const {
      general: { ignoreSubcontent, useDifferentSettingForEachSection },
    } = values;
    const primaryLinesArray = mainText.split("\n");
    const secondaryLinesArray = secondaryText.split("\n");
    const shouldIgnoreSubcontent =
      ignoreSubcontent && !useDifferentSettingForEachSection;

    if (
      !shouldIgnoreSubcontent &&
      primaryLinesArray.length !== secondaryLinesArray.length
    ) {
      const result = await showDialog("Are you sure?", {
        description: `There are ${primaryLinesArray.length} line(s) in the main lyrics, but there is only ${secondaryLinesArray.length} line(s) in the secondary lyrics, is this the desired behavior?`,
      });
      if (result === DIALOG_RESULT.CANCEL) {
        return;
      }
    }

    generatePpt({
      settingValues: values as PptSettingsStateType,
      primaryLyric: mainText || "",
      secondaryLyric: secondaryText,
    });
  }

  function onInvalidSubmit(errorsObject: FieldErrors<PptSettingsStateType>) {
    if (process.env.NODE_ENV === "development") {
      console.log("Errors:", errorsObject);
    }
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
        settingsValues,
        sectionItems,
        currentSection,
        setCurrentSection,
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
