import { useMemo, useRef } from "react";
import { UseFormGetValues } from "react-hook-form";
import { PptSettingsStateType } from "../types";
import { deepCompare, deepCopy } from "../utils";

type Props = {
  valuesGetter: UseFormGetValues<{
    [x: string]: any;
  }>;
  onValuesChange?: (
    prevValues: PptSettingsStateType | null,
    newValues: PptSettingsStateType,
  ) => void;
};

const useMemoizedSettingsValues = ({ valuesGetter, onValuesChange }: Props) => {
  const existingSettingsValuesRef = useRef<PptSettingsStateType | null>(null);
  const newSettingsValues = valuesGetter() as PptSettingsStateType;

  const settingsValues = useMemo(() => {
    // If prevSettingsValuesRef is null (first render),
    // or if the new values are different, update the ref and return the new values
    if (
      existingSettingsValuesRef.current === null ||
      !deepCompare(existingSettingsValuesRef.current, newSettingsValues)
    ) {
      if (process.env.NODE_ENV === "development") {
        console.log("Settings Value Reference Updated:", newSettingsValues);
      }
      if (onValuesChange) {
        onValuesChange(existingSettingsValuesRef.current, newSettingsValues);
      }
      existingSettingsValuesRef.current = deepCopy(newSettingsValues);
    }

    // Return the current (or previous) values stored in the ref
    return existingSettingsValuesRef.current;
  }, [newSettingsValues, onValuesChange]);

  return settingsValues;
};

export default useMemoizedSettingsValues;
