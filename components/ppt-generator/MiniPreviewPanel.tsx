"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SCREEN_SIZE } from "@/lib/constant/general";
import { useScreenSize } from "@/lib/hooks/use-screen-size";
import { InternalPresentation } from "@/lib/react-pptx-preview/normalizer";
import { PptSettingsStateType } from "@/lib/types";
import { cn } from "@/lib/utils/general";
import { generatePreviewConfig } from "@/lib/utils/ppt-generator/ppt-preview";
import {
  AlertTriangle,
  ChevronRight,
  Eye,
  Layers,
  Loader2,
  Maximize2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLineToSlideMapperContext } from "../context/LineToSlideMapperContext";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";
import VerticalPreview from "../react-pptx-preview/VerticalPreview";

type Props = {
  onOpenFullPreview: () => void;
};

const MiniPreviewPanel = ({ onOpenFullPreview }: Props) => {
  const { mainText, secondaryText, settingsValues, lyricsSummary, overflowWarnings, overflowSlideIndices } =
    usePptGeneratorFormContext();
  const { lineMapper } = useLineToSlideMapperContext();
  const screenSize = useScreenSize();
  const isSmallScreen =
    screenSize === SCREEN_SIZE.XS || screenSize === SCREEN_SIZE.SM;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<InternalPresentation>();
  const [error, setError] = useState<Error>();
  const hasAutoOpened = useRef(false);

  // Auto-open on non-mobile screens (only once on mount)
  useEffect(() => {
    if (!isSmallScreen && !hasAutoOpened.current) {
      hasAutoOpened.current = true;
      setIsExpanded(true);
    }
  }, [isSmallScreen]);

  // Update preview when expanded and content changes
  const updatePreview = useCallback(
    async (
      settingsValues: PptSettingsStateType,
      mainText: string,
      secondaryText: string
    ) => {
      if (!mainText.trim()) {
        setPreviewConfig(undefined);
        return;
      }

      setIsLoading(true);
      try {
        // Don't clear global mappings - use local generation only
        const config = await generatePreviewConfig({
          settingValues: settingsValues,
          primaryLyric: mainText,
          secondaryLyric: secondaryText,
          lineMapper,
        });
        setPreviewConfig(config);
        setError(undefined);
      } catch (err) {
        console.warn(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [lineMapper]
  );

  // Handle panel close - clear state
  const handleClose = useCallback(() => {
    setIsExpanded(false);
    // Clear preview state on close to ensure fresh render on next open
    setPreviewConfig(undefined);
    setError(undefined);
  }, []);

  // Handle panel open
  const handleOpen = useCallback(() => {
    setIsExpanded(true);
    setIsLoading(true);
    // Clear any stale config
    setPreviewConfig(undefined);
  }, []);

  // Generate preview when expanded (with debounce for content changes)
  useEffect(() => {
    if (!isExpanded) return;

    // Debounce preview generation
    const timeout = setTimeout(() => {
      updatePreview(settingsValues, mainText, secondaryText);
    }, 300);

    return () => clearTimeout(timeout);
  }, [isExpanded, settingsValues, mainText, secondaryText, updatePreview]);

  // Don't show on small screens (use the modal instead)
  if (isSmallScreen) {
    return null;
  }

  const hasContent = mainText.trim().length > 0;

  return (
    <>
      {/* Floating toggle button when collapsed */}
      {!isExpanded && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            type="button"
            onClick={handleOpen}
            size="lg"
            className={cn(
              "gap-2 rounded-full px-4 shadow-lg transition-all hover:shadow-xl",
              hasContent && "animate-pulse-subtle"
            )}
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Preview</span>
            {lyricsSummary.estimatedSlides > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {lyricsSummary.estimatedSlides}
              </Badge>
            )}
          </Button>
        </div>
      )}

      {/* Expanded preview panel */}
      <div
        className={cn(
          "fixed bottom-0 right-0 z-40 flex flex-col rounded-tl-2xl border-l border-t bg-background/95 shadow-2xl backdrop-blur-sm transition-all duration-300",
          isExpanded
            ? "h-[70vh] w-80 translate-x-0 opacity-100"
            : "h-0 w-0 translate-x-full opacity-0"
        )}
      >
        {isExpanded && (
          <>
            {/* Panel header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Quick Preview</span>
                {lyricsSummary.estimatedSlides > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <Layers className="mr-1 h-3 w-3" />
                    {lyricsSummary.estimatedSlides}
                  </Badge>
                )}
                {overflowWarnings.length > 0 && (
                  <Badge
                    variant="outline"
                    className="border-amber-500/50 text-xs text-amber-600 dark:text-amber-400"
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    {overflowWarnings.length}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onOpenFullPreview}
                  title="Open full preview"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden">
              {!hasContent ? (
                <div className="flex h-full flex-col items-center justify-center p-4 text-center text-muted-foreground">
                  <Eye className="mb-2 h-8 w-8 opacity-20" />
                  <p className="text-sm">Add lyrics to see preview</p>
                </div>
              ) : isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="flex h-full flex-col items-center justify-center p-4 text-center text-muted-foreground">
                  <p className="text-sm">Working on preview...</p>
                  <p className="mt-1 text-xs">Check your settings</p>
                </div>
              ) : previewConfig ? (
                <ScrollArea className="h-full px-3">
                  <div className="py-3">
                    <VerticalPreview
                      normalizedConfig={previewConfig}
                      drawBoundingBoxes={false}
                      overflowSlideIndices={overflowSlideIndices}
                    />
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Panel footer */}
            <div className="border-t px-4 py-2">
              <p className="text-center text-[10px] text-muted-foreground">
                Font rendering may vary • Click{" "}
                <Maximize2 className="inline h-3 w-3" /> for full view
              </p>
            </div>
          </>
        )}
      </div>

      {/* Collapse button when expanded */}
      {isExpanded && (
        <button
          type="button"
          onClick={handleClose}
          className="fixed bottom-1/2 right-80 z-40 flex h-8 translate-y-1/2 items-center justify-center rounded-l-lg border border-r-0 bg-background/95 px-1 shadow-lg backdrop-blur-sm transition-all hover:bg-accent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </>
  );
};

export default MiniPreviewPanel;
