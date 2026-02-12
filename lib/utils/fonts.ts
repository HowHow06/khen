import { DM_Sans, Playfair_Display } from "next/font/google";

export const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const displayFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Combined font classes for the body
export const fontVariables = `${bodyFont.variable} ${displayFont.variable}`;
export const InterFont = bodyFont; // Backwards compatibility