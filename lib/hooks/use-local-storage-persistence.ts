"use client";

import { PptSettingsStateType } from "@/lib/types";
import { useCallback, useEffect, useRef } from "react";

const STORAGE_KEYS = {
  MAIN_TEXT: "khen_ppt_main_text",
  SECONDARY_TEXT: "khen_ppt_secondary_text",
  SETTINGS: "khen_ppt_settings",
  LAST_PRESET: "khen_ppt_last_preset",
} as const;

const DEBOUNCE_MS = 1000;

type UseLocalStoragePersistenceProps = {
  mainText: string;
  secondaryText: string;
  settingsValues: PptSettingsStateType;
  setMainText: (text: string) => void;
  setSecondaryText: (text: string) => void;
  formReset: (values: PptSettingsStateType) => void;
};

/**
 * Hook to persist PPT generator state to localStorage
 * Automatically saves on changes and restores on mount
 */
export const useLocalStoragePersistence = ({
  mainText,
  secondaryText,
  settingsValues,
  setMainText,
  setSecondaryText,
  formReset,
}: UseLocalStoragePersistenceProps) => {
  const isInitialized = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Restore state from localStorage on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    try {
      const savedMainText = localStorage.getItem(STORAGE_KEYS.MAIN_TEXT);
      const savedSecondaryText = localStorage.getItem(
        STORAGE_KEYS.SECONDARY_TEXT
      );
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

      if (savedMainText) {
        setMainText(savedMainText);
      }
      if (savedSecondaryText) {
        setSecondaryText(savedSecondaryText);
      }
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(
            savedSettings
          ) as PptSettingsStateType;
          formReset(parsedSettings);
        } catch {
          // Invalid JSON, ignore
          console.warn("Failed to parse saved settings");
        }
      }
    } catch {
      // localStorage not available
      console.warn("localStorage not available");
    }
  }, [setMainText, setSecondaryText, formReset]);

  // Save main text with debounce
  useEffect(() => {
    if (!isInitialized.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.MAIN_TEXT, mainText);
      } catch {
        // Storage full or not available
      }
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [mainText]);

  // Save secondary text with debounce
  useEffect(() => {
    if (!isInitialized.current) return;

    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.SECONDARY_TEXT, secondaryText);
      } catch {
        // Storage full or not available
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [secondaryText]);

  // Save settings with debounce (longer delay as settings change less frequently)
  useEffect(() => {
    if (!isInitialized.current) return;

    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEYS.SETTINGS,
          JSON.stringify(settingsValues)
        );
      } catch {
        // Storage full or not available
      }
    }, DEBOUNCE_MS * 2);

    return () => clearTimeout(timeout);
  }, [settingsValues]);

  // Clear all saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.MAIN_TEXT);
      localStorage.removeItem(STORAGE_KEYS.SECONDARY_TEXT);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.LAST_PRESET);
    } catch {
      // localStorage not available
    }
  }, []);

  // Save last used preset
  const saveLastPreset = useCallback((presetName: string) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_PRESET, presetName);
    } catch {
      // localStorage not available
    }
  }, []);

  // Get last used preset
  const getLastPreset = useCallback((): string | null => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_PRESET);
    } catch {
      return null;
    }
  }, []);

  return {
    clearSavedData,
    saveLastPreset,
    getLastPreset,
  };
};

export default useLocalStoragePersistence;
