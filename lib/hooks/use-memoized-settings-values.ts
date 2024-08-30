import { useMemo, useRef } from "react";
import { UseFormGetValues } from "react-hook-form";
import { PptSettingsStateType } from "../types";
import { deepCompare } from "../utils";

type Props = {
  valuesGetter: UseFormGetValues<{
    [x: string]: any;
  }>;
};

const useMemoizedSettingsValues = ({ valuesGetter }: Props) => {
  const prevSettingsValuesRef = useRef<PptSettingsStateType | null>(null);
  const newSettingsValues = valuesGetter() as PptSettingsStateType;

  const settingsValues = useMemo(() => {
    // If prevSettingsValuesRef is null (first render), or if the new values are different, update the ref and return the new values
    if (
      prevSettingsValuesRef.current === null ||
      !deepCompare(prevSettingsValuesRef.current, newSettingsValues)
    ) {
      if (process.env.NODE_ENV === "development") {
        console.log("Settings Value Reference Updated:", newSettingsValues);
      }
      prevSettingsValuesRef.current = newSettingsValues;
    }

    // Return the current (or previous) values stored in the ref
    return prevSettingsValuesRef.current;
  }, [newSettingsValues]);

  return settingsValues;
};

export default useMemoizedSettingsValues;
