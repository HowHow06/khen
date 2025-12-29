import { useCallback, useEffect, useRef } from "react";
import { LYRIC_SECTION } from "../constant";
import { PptSettingsStateType, SectionSettingsKeyType } from "../types";
import { deepCompare, getLinesStartingWith } from "../utils";
import {
  getAllSectionOverwrites,
  getGlobalSettingsOverwrite,
  insertOrUpdateSectionOverwritesInLyrics,
  removeAllOverwritesFromLyrics,
  settingsOverwriteToJson,
} from "../utils/ppt-generator";

type Props = {
  settingsValues: PptSettingsStateType;
  mainText: string;
  setMainText: (text: string) => void;
};

/**
 * Hook that automatically inserts/updates overwrite JSON in lyrics
 * when settings change and autoOutputOverwrite is enabled.
 */
const useAutoOutputOverwrite = ({
  settingsValues,
  mainText,
  setMainText,
}: Props) => {
  const previousSettingsRef = useRef<PptSettingsStateType | null>(null);
  const previousAutoOutputRef = useRef<boolean | undefined>(undefined);
  const isInternalUpdateRef = useRef<boolean>(false);

  const updateLyricsWithOverwrite = useCallback(
    (settings: PptSettingsStateType, lyrics: string): string => {
      // Count the number of sections in the lyrics
      const sectionHeaders = getLinesStartingWith(
        lyrics,
        LYRIC_SECTION.SECTION,
      );
      const sectionCount = sectionHeaders.length;

      if (sectionCount === 0) {
        // No sections in lyrics, nothing to do
        return lyrics;
      }

      // Get global overwrite (settings before first section)
      const globalOverwrite = getGlobalSettingsOverwrite(settings);
      const globalOverwriteJson = settingsOverwriteToJson(globalOverwrite);

      // Get overwrites for all sections
      const sectionOverwriteObjects = getAllSectionOverwrites(
        settings,
        sectionCount,
      );

      // Convert overwrite objects to JSON strings
      const sectionOverwriteJsons = new Map<SectionSettingsKeyType, string>();
      for (const [sectionKey, overwrite] of sectionOverwriteObjects) {
        const json = settingsOverwriteToJson(overwrite);
        sectionOverwriteJsons.set(sectionKey, json);
      }

      return insertOrUpdateSectionOverwritesInLyrics(
        lyrics,
        sectionOverwriteJsons,
        globalOverwriteJson,
      );
    },
    [],
  );

  useEffect(() => {
    // Skip if this is an internal update (to prevent infinite loop)
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    const autoOutputOverwrite = settingsValues.general?.autoOutputOverwrite;
    const wasAutoOutputEnabled = previousAutoOutputRef.current;

    // Update refs
    previousAutoOutputRef.current = autoOutputOverwrite;

    // If autoOutputOverwrite is disabled, do nothing
    if (!autoOutputOverwrite) {
      // If it was just turned off, remove any existing overwrites
      if (wasAutoOutputEnabled === true) {
        const updatedLyrics = removeAllOverwritesFromLyrics(mainText);
        if (updatedLyrics !== mainText) {
          isInternalUpdateRef.current = true;
          setMainText(updatedLyrics);
        }
      }
      previousSettingsRef.current = settingsValues;
      return;
    }

    // Check if settings have actually changed (excluding the comparison that would cause loops)
    const previousSettings = previousSettingsRef.current;
    previousSettingsRef.current = settingsValues;

    // Skip initial render or if settings haven't meaningfully changed
    if (!previousSettings) {
      // On initial render with autoOutputOverwrite enabled, update lyrics
      const updatedLyrics = updateLyricsWithOverwrite(settingsValues, mainText);
      if (updatedLyrics !== mainText) {
        isInternalUpdateRef.current = true;
        setMainText(updatedLyrics);
      }
      return;
    }

    // Compare settings excluding the autoOutputOverwrite field itself
    const { general: currentGeneral, ...currentRest } = settingsValues;
    const { general: prevGeneral, ...prevRest } = previousSettings;

    const { autoOutputOverwrite: _currentAuto, ...currentGeneralWithoutAuto } =
      currentGeneral || {};
    const { autoOutputOverwrite: _prevAuto, ...prevGeneralWithoutAuto } =
      prevGeneral || {};

    const settingsChanged =
      !deepCompare(currentGeneralWithoutAuto, prevGeneralWithoutAuto) ||
      !deepCompare(currentRest, prevRest);

    // If autoOutputOverwrite was just enabled or settings changed
    if (wasAutoOutputEnabled !== true || settingsChanged) {
      const updatedLyrics = updateLyricsWithOverwrite(settingsValues, mainText);
      if (updatedLyrics !== mainText) {
        isInternalUpdateRef.current = true;
        setMainText(updatedLyrics);
      }
    }
  }, [settingsValues, mainText, setMainText, updateLyricsWithOverwrite]);
};

export default useAutoOutputOverwrite;
