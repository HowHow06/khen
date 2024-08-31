import { useMemo, useRef } from "react";
import { PptSettingsStateType } from "../types";
import { deepCompare, deepCopy } from "../utils";
import useDebouncedValue from "./use-debounced-value";

type Props = {
  newSettingsValues: PptSettingsStateType;
};

const useMemoizedSettingsValues = ({ newSettingsValues }: Props) => {
  const existingSettingsValuesRef = useRef<PptSettingsStateType | null>(null);
  const debouncedNewSettingsValues = useDebouncedValue(newSettingsValues, 200);

  const settingsValues = useMemo(() => {
    // If prevSettingsValuesRef is null (first render),
    // or if the new values are different, update the ref and return the new values
    if (
      existingSettingsValuesRef.current === null ||
      !deepCompare(
        existingSettingsValuesRef.current,
        debouncedNewSettingsValues,
      )
    ) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "Settings Value Reference Updated:",
          deepCopy(debouncedNewSettingsValues),
        );
      }
      existingSettingsValuesRef.current = deepCopy(debouncedNewSettingsValues);
    }

    // Return the current (or previous) values stored in the ref
    return existingSettingsValuesRef.current;
  }, [debouncedNewSettingsValues]);

  return settingsValues;
};

export default useMemoizedSettingsValues;
