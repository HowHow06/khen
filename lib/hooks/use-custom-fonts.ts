import { useEffect, useState } from "react";

/**
 * Custom hook to extract and track custom fonts imported into the DOM
 * @returns Array of custom font names
 */
export const useCustomFonts = () => {
  const [customFonts, setCustomFonts] = useState<string[]>([]);

  useEffect(() => {
    const syncFontsFromDOM = () => {
      const styleElements = document.querySelectorAll(
        'style[id^="custom-font-"]',
      );
      const fonts: string[] = [];

      styleElements.forEach((style) => {
        // Extract font name from style content
        const content = style.textContent || "";
        const match = content.match(/font-family:\s*"([^"]+)"/);
        if (match && match[1]) {
          fonts.push(match[1]);
        }
      });

      setCustomFonts(fonts);
    };

    // Sync on mount
    syncFontsFromDOM();

    // Set up a MutationObserver to watch for style tag changes
    const observer = new MutationObserver(() => {
      syncFontsFromDOM();
    });

    observer.observe(document.head, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return customFonts;
};
