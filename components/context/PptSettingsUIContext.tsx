"use client";
import { CONTENT_TYPE, SETTING_CATEGORY } from "@/lib/constant";
import { PptSettingsUIState } from "@/lib/types";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useReducer,
} from "react";

type PptSettingsUIAction =
  | { type: "SET_CURRENT_CATEGORY_TAB"; tab: string }
  | { type: "SET_CURRENT_CONTENT_TAB"; tab: string }
  | { type: "SET_CURRENT_COVER_TAB"; tab: string }
  | {
      type: "SET_ACCORDION_OPEN";
      accordions: string[];
      grouping: string;
    };

type PptSettingsUIContextType = {
  settingsUIState: PptSettingsUIState;
  // dispatch: React.Dispatch<PptSettingsUIAction>;
  setCurrentCategoryTab: (tab: string) => void;
  setCurrentContentTab: (tab: string) => void;
  setCurrentCoverTab: (tab: string) => void;
  setAccordionsOpen: (props: {
    accordions: string[];
    grouping: string;
  }) => void;
};

const initialState: PptSettingsUIState = {
  currentCategoryTab: SETTING_CATEGORY.GENERAL,
  currentContentTab: CONTENT_TYPE.MAIN,
  currentCoverTab: CONTENT_TYPE.MAIN,
  openAccordions: {
    base: [],
  },
};

const pptSettingsUIReducer = (
  state: PptSettingsUIState,
  action: PptSettingsUIAction,
): PptSettingsUIState => {
  switch (action.type) {
    case "SET_CURRENT_CATEGORY_TAB":
      return { ...state, currentCategoryTab: action.tab };

    case "SET_ACCORDION_OPEN":
      const groupingKey = action.grouping;
      const tempOpenAccordions = state.openAccordions;
      tempOpenAccordions[groupingKey] = action.accordions;
      return { ...state, openAccordions: tempOpenAccordions };

    case "SET_CURRENT_CONTENT_TAB":
      return { ...state, currentContentTab: action.tab };

    case "SET_CURRENT_COVER_TAB":
      return { ...state, currentCoverTab: action.tab };

    default:
      return state;
  }
};

const PptSettingsUIContext = createContext<
  PptSettingsUIContextType | undefined
>(undefined);

type PptSettingsUIProviderProps = {
  children: ReactNode;
};

export const PptSettingsUIProvider: React.FC<PptSettingsUIProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(pptSettingsUIReducer, initialState);

  const setCurrentCategoryTab = useCallback((tab: string) => {
    return dispatch({ type: "SET_CURRENT_CATEGORY_TAB", tab: tab });
  }, []);

  const setAccordionsOpen = useCallback(
    ({ accordions, grouping }: { accordions: string[]; grouping: string }) => {
      return dispatch({
        type: "SET_ACCORDION_OPEN",
        accordions: accordions,
        grouping: grouping,
      });
    },
    [],
  );

  const setCurrentContentTab = useCallback((tab: string) => {
    return dispatch({ type: "SET_CURRENT_CONTENT_TAB", tab: tab });
  }, []);

  const setCurrentCoverTab = useCallback((tab: string) => {
    return dispatch({ type: "SET_CURRENT_COVER_TAB", tab: tab });
  }, []);

  return (
    <PptSettingsUIContext.Provider
      value={{
        settingsUIState: state,
        setCurrentCategoryTab,
        setCurrentContentTab,
        setAccordionsOpen,
        setCurrentCoverTab,
      }}
    >
      {children}
    </PptSettingsUIContext.Provider>
  );
};

export const usePptSettingsUIContext = (): PptSettingsUIContextType => {
  const context = useContext(PptSettingsUIContext);
  if (context === undefined) {
    throw new Error(
      "usePptSettingsUIContext must be used within a PptSettingsUIProvider",
    );
  }
  return context;
};
