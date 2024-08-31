import { useMemo, useRef } from "react";
import { PptSettingsStateType } from "../types";
import { deepCompare, deepCopy } from "../utils";
import useDebouncedValue from "./use-debounced-value";

type Props = {
  newSettingsValues: PptSettingsStateType;
};

const useMemoizedSettingsValues = ({ newSettingsValues }: Props) => {
  const existingSettingsValuesRef = useRef<PptSettingsStateType | null>(null);

  const settingsValues = useMemo(() => {
    // If prevSettingsValuesRef is null (first render),
    // or if the new values are different, update the ref and return the new values
    if (
      existingSettingsValuesRef.current === null ||
      !deepCompare(existingSettingsValuesRef.current, newSettingsValues)
    ) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "Settings Value Reference Updated:",
          deepCopy(newSettingsValues),
        );
      }
      existingSettingsValuesRef.current = deepCopy(newSettingsValues);
    }

    // Return the current (or previous) values stored in the ref
    return existingSettingsValuesRef.current;
  }, [newSettingsValues]);

  return useDebouncedValue(settingsValues, 200);
};

export default useMemoizedSettingsValues;
