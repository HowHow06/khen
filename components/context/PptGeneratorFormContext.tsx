"use client";
import React, { ReactNode, createContext, useContext, useState } from "react";

type PptGeneratorFormContextType = {
  mainText: string;
  secondaryText: string;
  // mainTextareaRef: MutableRefObject<TextareaRefType>;
  // secondaryTextareaRef: MutableRefObject<TextareaRefType>;
  setMainText: (text: string) => void;
  setSecondaryText: (text: string) => void;
};

const PptGeneratorFormContext = createContext<
  PptGeneratorFormContextType | undefined
>(undefined);

type PptGeneratorFormProviderProps = {
  children: ReactNode;
};

export const PptGeneratorFormProvider: React.FC<
  PptGeneratorFormProviderProps
> = ({ children }) => {
  const [mainText, setMainText] = useState("");
  const [secondaryText, setSecondaryText] = useState("");

  return (
    <PptGeneratorFormContext.Provider
      value={{
        mainText,
        secondaryText,
        setMainText,
        setSecondaryText,
      }}
    >
      {children}
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
