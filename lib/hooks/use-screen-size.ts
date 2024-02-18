import theme from "@/lib/tailwindTheme"; // Assuming this imports your Tailwind theme
import { useEffect, useState } from "react";
import { SCREEN_SIZE } from "../constant/general";
import { ScreenSizeType } from "../types";

// Define Tailwind CSS breakpoints as needed (these are default Tailwind breakpoints)
const breakpoints = {
  sm: parseInt(theme.screens.sm, 10) || 640,
  md: parseInt(theme.screens.md, 10) || 768,
  lg: parseInt(theme.screens.lg, 10) || 1024,
  xl: parseInt(theme.screens.xl, 10) || 1280,
  "2xl": parseInt(theme.screens["2xl"], 10) || 1536,
};

export function useScreenSize(): ScreenSizeType {
  const [screenSize, setScreenSize] = useState<ScreenSizeType>(SCREEN_SIZE.XS);

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;

      if (width < breakpoints.sm) {
        setScreenSize(SCREEN_SIZE.XS);
      } else if (width >= breakpoints.sm && width < breakpoints.md) {
        setScreenSize(SCREEN_SIZE.SM);
      } else if (width >= breakpoints.md && width < breakpoints.lg) {
        setScreenSize(SCREEN_SIZE.MD);
      } else if (width >= breakpoints.lg && width < breakpoints.xl) {
        setScreenSize(SCREEN_SIZE.LG);
      } else if (width >= breakpoints.xl && width < breakpoints["2xl"]) {
        setScreenSize(SCREEN_SIZE.XL);
      } else if (width >= breakpoints["2xl"]) {
        setScreenSize(SCREEN_SIZE["2XL"]);
      }
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);

    // Cleanup listener on component unmount
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  return screenSize;
}
