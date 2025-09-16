"use client";

import { useLineToSlideMapper } from "@/lib/hooks/use-line-to-slide-mapper";
import { LineToSlideMapper } from "@/lib/utils/ppt-generator/line-to-slide-mapper";
import React, { createContext, ReactNode, useContext } from "react";

interface LineToSlideMapperContextType {
  lineMapper: LineToSlideMapper;
  clearMappings: () => void;
  getSlideIndexForLine: (lineNumber: number) => number | null;
  scrollPreviewToSlideForLine: (lineNumber: number) => boolean;
  scrollPreviewToCursorPosition: (
    text: string,
    cursorPosition: number,
  ) => number | null;
  getAllMappings: () => any[];
  getLinesForSlide: (slideIndex: number) => any[];
}

const LineToSlideMapperContext = createContext<
  LineToSlideMapperContextType | undefined
>(undefined);

interface LineToSlideMapperProviderProps {
  children: ReactNode;
}

export const LineToSlideMapperProvider: React.FC<
  LineToSlideMapperProviderProps
> = ({ children }) => {
  const mapperUtils = useLineToSlideMapper();

  return (
    <LineToSlideMapperContext.Provider value={mapperUtils}>
      {children}
    </LineToSlideMapperContext.Provider>
  );
};

export const useLineToSlideMapperContext = (): LineToSlideMapperContextType => {
  const context = useContext(LineToSlideMapperContext);
  if (context === undefined) {
    throw new Error(
      "useLineToSlideMapperContext must be used within a LineToSlideMapperProvider",
    );
  }
  return context;
};
