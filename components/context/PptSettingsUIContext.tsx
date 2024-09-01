"use client";
import {
  CONTENT_TYPE,
  SETTING_CATEGORY,
  TAB_TYPE_UI_STATE_NAME_MAPPING,
  TAB_TYPES,
} from "@/lib/constant";
import { PptSettingsUIState } from "@/lib/types";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useReducer,
} from "react";

type setSectionTabsProps = {
  sectionName: string;
  tab: string;
  tabType: TAB_TYPES;
};

type PptSettingsUIAction =
  | { type: "SET_CURRENT_CATEGORY_TAB"; tab: string }
  | { type: "SET_CURRENT_CONTENT_TAB"; tab: string }
  | { type: "SET_CURRENT_COVER_TAB"; tab: string }
  | {
      type: "SET_ACCORDION_OPEN";
      accordions: string[];
      grouping: string;
    }
  | ({
      type: "SET_SECTION_TABS";
    } & setSectionTabsProps);

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
  setSectionTabs: (props: setSectionTabsProps) => void;
};

const initialState: PptSettingsUIState = {
  currentCategoryTab: SETTING_CATEGORY.GENERAL,
  currentContentTab: CONTENT_TYPE.MAIN,
  currentCoverTab: CONTENT_TYPE.MAIN,
  openAccordions: {
    base: [],
  },
  sectionTabs: {},
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

    case "SET_SECTION_TABS":
      const targetTabName = TAB_TYPE_UI_STATE_NAME_MAPPING[action.tabType];
      const originalTargetSection = state.sectionTabs[action.sectionName];
      const newSectionTabs = {
        ...state.sectionTabs,
        [action.sectionName]: {
          ...originalTargetSection,
          [targetTabName]: action.tab,
        },
      };
      return { ...state, sectionTabs: newSectionTabs };
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

  const setSectionTabs = useCallback(
    ({ sectionName, tab, tabType }: setSectionTabsProps) => {
      return dispatch({
        type: "SET_SECTION_TABS",
        tab: tab,
        sectionName,
        tabType,
      });
    },
    [],
  );

  return (
    <PptSettingsUIContext.Provider
      value={{
        settingsUIState: state,
        setCurrentCategoryTab,
        setCurrentContentTab,
        setAccordionsOpen,
        setCurrentCoverTab,
        setSectionTabs,
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
