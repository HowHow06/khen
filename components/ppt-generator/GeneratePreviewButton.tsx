"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils/general";
import { POPUP_TAB_TYPE } from "@/lib/constant";
import { InternalPresentation } from "@/lib/react-pptx-preview/normalizer";
import { PptSettingsStateType } from "@/lib/types";
import { getBase64FromString } from "@/lib/utils/general";
import { generatePreviewConfig } from "@/lib/utils/ppt-generator/ppt-preview";
import {
  Download,
  Eye,
  Grid3X3,
  Pencil,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLineToSlideMapperContext } from "../context/LineToSlideMapperContext";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";
import VerticalPreview from "../react-pptx-preview/VerticalPreview";
import { Button } from "../ui/button";
import MainLyricSection from "./MainLyricSection";
import SecondaryLyricSection from "./SecondaryLyricSection";
import SlideGridView from "./SlideGridView";
import GeneratePptWithPromptButton from "./settings/GeneratePptWithPromptButton";
import PptGeneratorSettingsContent from "./settings/PptGeneratorSettingsContent";

type Props = {};

const GeneratePreviewButton = (props: Props) => {
  const { mainText, secondaryText, settingsValues } =
    usePptGeneratorFormContext();
  const {
    lineMapper,
    clearMappings,
    getFirstLineForSlide,
    scrollPreviewToSlideForLine,
  } = useLineToSlideMapperContext();
  const [previewConfig, setPreviewConfig] = useState<InternalPresentation>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(
    POPUP_TAB_TYPE.SETTINGS as string,
  );
  const [error, setError] = useState<Error>();
  const [pendingFocusLine, setPendingFocusLine] = useState<number | null>(null);

  const onGeneratePreviewClick = () => {
    setIsModalOpen(true);
  };

  // Listen for custom event to open preview (from MiniPreviewPanel)
  useEffect(() => {
    const handleOpenPreview = () => {
      setIsModalOpen(true);
    };
    window.addEventListener('openFullPreview', handleOpenPreview);
    return () => {
      window.removeEventListener('openFullPreview', handleOpenPreview);
    };
  }, []);

  // TODO: add settings validation check here, OR show message like 'invalid content' instead of preview
  const updatePreviewConfig = useCallback(
    async (
      settingsValues: PptSettingsStateType,
      mainText: string,
      secondaryText: string,
    ) => {
      try {
        // Clear previous mappings
        clearMappings();

        const previewConfig = await generatePreviewConfig({
          settingValues: settingsValues,
          primaryLyric: mainText || "",
          secondaryLyric: secondaryText,
          lineMapper,
        });

        setPreviewConfig(previewConfig);
        setError(undefined);
      } catch (error) {
        console.warn(error);
        setError(error as Error);
      }
    },
    [lineMapper, clearMappings],
  );

  const onSectionChange = useCallback(
    (section: { value: string; label: string }) => {
      const label = section.label;
      // remove tailing astrisks
      const sectionNameIdentifier = getBase64FromString(
        label.replace(/\*\s*$/, "").trim(),
      );

      const element = document.getElementById(
        `section-${sectionNameIdentifier}`,
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [],
  );

  /**
   * Handle double-click on a slide in the grid view
   * Switches to LYRICS tab and focuses the textarea at the corresponding line
   */
  const handleSlideDoubleClick = useCallback(
    (slideIndex: number) => {
      const lineNumber = getFirstLineForSlide(slideIndex);
      if (lineNumber !== null) {
        setPendingFocusLine(lineNumber);
      }
      // Switch to lyrics tab
      setCurrentTab(POPUP_TAB_TYPE.LYRICS);
    },
    [getFirstLineForSlide],
  );

  // Effect to focus the textarea when switching to LYRICS tab with a pending focus line
  useEffect(() => {
    if (currentTab === POPUP_TAB_TYPE.LYRICS && pendingFocusLine !== null) {
      // Calculate cursor position from line number
      const lines = mainText.split("\n");
      let cursorPosition = 0;
      for (let i = 0; i < pendingFocusLine && i < lines.length; i++) {
        cursorPosition += lines[i].length + 1; // +1 for newline
      }
      // Use setTimeout to ensure the textarea is rendered
      setTimeout(() => {
        scrollPreviewToSlideForLine(pendingFocusLine);

        const textarea = document.querySelector(
          "#preview-main-lyric-section-div textarea",
        ) as HTMLTextAreaElement | null;
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(cursorPosition, cursorPosition);
          // Scroll the textarea to show the cursor position
          const lineHeight =
            parseInt(getComputedStyle(textarea).lineHeight) || 20;
          textarea.scrollTop = pendingFocusLine * lineHeight;
        }

        setPendingFocusLine(null);
      }, 100);
    }
  }, [currentTab, pendingFocusLine, mainText]);

  // update preview config on settingsValues change
  useEffect(() => {
    if (isModalOpen) {
      updatePreviewConfig(settingsValues, mainText, secondaryText);
    }
  }, [
    updatePreviewConfig,
    isModalOpen,
    settingsValues,
    mainText,
    secondaryText,
  ]);

  // Mobile tab options with preview
  const MOBILE_TAB = {
    PREVIEW: "preview",
    LYRICS: POPUP_TAB_TYPE.LYRICS,
    SETTINGS: POPUP_TAB_TYPE.SETTINGS,
    GRID: POPUP_TAB_TYPE.GRID_VIEW,
  };

  const [mobileTab, setMobileTab] = useState(MOBILE_TAB.PREVIEW);

  // Sync mobile tab with desktop tab when switching
  useEffect(() => {
    if (mobileTab !== MOBILE_TAB.PREVIEW) {
      setCurrentTab(mobileTab);
    }
  }, [mobileTab]);

  return (
    <>
      <Dialog
        open={isModalOpen}
        onOpenChange={(isOpen) => setIsModalOpen(isOpen)}
      >
        <DialogContent
          className="flex h-[90vh] max-h-[90vh] w-[95vw] max-w-[95vw] flex-col p-0 sm:h-[85vh] sm:w-[80vw] sm:max-w-[80vw] sm:flex-row sm:p-6"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">
            PPT Preview and Settings
          </DialogTitle>

          {/* ===== DESKTOP LAYOUT ===== */}
          <div
            className={cn(
              "hidden h-full gap-4 sm:flex",
              currentTab === POPUP_TAB_TYPE.GRID_VIEW ? "w-full" : "w-3/5"
            )}
          >
            <div>
              <ToggleGroup
                type="single"
                value={currentTab}
                onValueChange={setCurrentTab}
                className="flex h-full flex-col items-center justify-start gap-1 pt-4"
              >
                <ToggleGroupItem
                  value={POPUP_TAB_TYPE.SETTINGS}
                  aria-label="Toggle settings"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={POPUP_TAB_TYPE.LYRICS}
                  aria-label="Toggle lyrics"
                >
                  <Pencil className="h-5 w-5" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={POPUP_TAB_TYPE.GRID_VIEW}
                  aria-label="Toggle grid view"
                >
                  <Grid3X3 className="h-5 w-5" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="flex h-full w-full flex-col gap-2">
              {currentTab === POPUP_TAB_TYPE.SETTINGS && (
                <PptGeneratorSettingsContent
                  onSectionChange={onSectionChange}
                />
              )}
              {currentTab === POPUP_TAB_TYPE.LYRICS && (
                <ScrollArea className="px-3" isFillParent>
                  <div className="flex flex-col gap-4">
                    <div id="preview-main-lyric-section-div">
                      <MainLyricSection />
                    </div>
                    <div>
                      <SecondaryLyricSection />
                    </div>
                  </div>
                </ScrollArea>
              )}
              {currentTab === POPUP_TAB_TYPE.GRID_VIEW && (
                <div className="h-full w-full">
                  <SlideGridView
                    normalizedConfig={previewConfig}
                    onSlideDoubleClick={handleSlideDoubleClick}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Desktop Preview Panel */}
          {currentTab !== POPUP_TAB_TYPE.GRID_VIEW && (
            <div className="hidden h-full w-2/5 flex-col sm:flex">
              <h3 className="text-xl font-semibold tracking-tight">Preview</h3>
              <span className="text-xs text-muted-foreground">
                Note: might not display properly if the font isn&apos;t locally
                installed. Shadow, glow and outline won&apos;t be displayed
                here.
              </span>
              <div className="flex-grow overflow-y-auto">
                {error ? (
                  <div className="p-4 text-muted-foreground">
                    Working on the preview, meanwhile please check your
                    settings...
                  </div>
                ) : (
                  <ScrollArea className="px-3" isFillParent>
                    <VerticalPreview
                      normalizedConfig={previewConfig}
                      drawBoundingBoxes={false}
                    />
                  </ScrollArea>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <GeneratePptWithPromptButton />
              </div>
            </div>
          )}

          {/* ===== MOBILE LAYOUT ===== */}
          <div className="flex h-full flex-col sm:hidden">
            {/* Mobile Header */}
            <div className="flex items-center justify-between border-b bg-background px-4 py-3">
              <h3 className="text-lg font-semibold tracking-tight">
                {mobileTab === MOBILE_TAB.PREVIEW && "Preview"}
                {mobileTab === MOBILE_TAB.LYRICS && "Edit Lyrics"}
                {mobileTab === MOBILE_TAB.SETTINGS && "Settings"}
                {mobileTab === MOBILE_TAB.GRID && "All Slides"}
              </h3>
              {mobileTab === MOBILE_TAB.PREVIEW && (
                <span className="text-[10px] text-muted-foreground">
                  Fonts may vary
                </span>
              )}
            </div>

            {/* Mobile Content Area */}
            <div className="flex-1 overflow-hidden">
              {/* Preview Tab */}
              {mobileTab === MOBILE_TAB.PREVIEW && (
                <div className="h-full">
                  {error ? (
                    <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
                      Working on the preview...
                    </div>
                  ) : (
                    <ScrollArea className="h-full px-4" isFillParent>
                      <div className="py-4">
                        <VerticalPreview
                          normalizedConfig={previewConfig}
                          drawBoundingBoxes={false}
                        />
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}

              {/* Lyrics Tab */}
              {mobileTab === MOBILE_TAB.LYRICS && (
                <div className="h-full">
                  <ScrollArea className="h-full px-4" isFillParent>
                    <div className="flex flex-col gap-6 py-4">
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                          Main Lyrics
                        </h4>
                        <div id="mobile-preview-main-lyric-section-div">
                          <MainLyricSection />
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                          Secondary Lyrics
                        </h4>
                        <SecondaryLyricSection />
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Settings Tab */}
              {mobileTab === MOBILE_TAB.SETTINGS && (
                <div className="h-full overflow-auto px-4 py-4">
                  <PptGeneratorSettingsContent
                    onSectionChange={onSectionChange}
                  />
                </div>
              )}

              {/* Grid Tab */}
              {mobileTab === MOBILE_TAB.GRID && (
                <div className="h-full px-4 py-4">
                  <SlideGridView
                    normalizedConfig={previewConfig}
                    onSlideDoubleClick={(index) => {
                      handleSlideDoubleClick(index);
                      setMobileTab(MOBILE_TAB.LYRICS);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Mobile Bottom Bar with Download + Navigation */}
            <div className="border-t bg-background/95 px-3 pb-3 pt-2 backdrop-blur-sm">
              {/* Download button - prominent CTA */}
              <div className="mb-2">
                <GeneratePptWithPromptButton
                  className="w-full gap-2 shadow-lg"
                  size="lg"
                >
                  <Download className="h-4 w-4" />
                  Download PPT
                </GeneratePptWithPromptButton>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center justify-around rounded-2xl bg-muted/50 p-1">
                {[
                  { id: MOBILE_TAB.PREVIEW, icon: Eye, label: "Preview" },
                  { id: MOBILE_TAB.LYRICS, icon: Pencil, label: "Lyrics" },
                  { id: MOBILE_TAB.SETTINGS, icon: Settings2, label: "Settings" },
                  { id: MOBILE_TAB.GRID, icon: Grid3X3, label: "Grid" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setMobileTab(tab.id)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 transition-all duration-200",
                      mobileTab === tab.id
                        ? "bg-background text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <tab.icon
                      className={cn(
                        "h-5 w-5 transition-transform duration-200",
                        mobileTab === tab.id && "scale-110"
                      )}
                    />
                    <span className="text-[10px] font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        variant="outline"
        type="button"
        onClick={onGeneratePreviewClick}
        data-preview-button="true"
        className="gap-2"
      >
        <Eye className="h-4 w-4" />
        Edit & Preview
      </Button>
    </>
  );
};

export default GeneratePreviewButton;
