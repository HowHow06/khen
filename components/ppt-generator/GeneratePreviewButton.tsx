"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { POPUP_TAB_TYPE } from "@/lib/constant";
import { InternalPresentation } from "@/lib/react-pptx-preview/normalizer";
import { PptSettingsStateType } from "@/lib/types";
import { getBase64FromString } from "@/lib/utils/general";
import { generatePreviewConfig } from "@/lib/utils/ppt-generator/ppt-preview";
import { Grid3X3, Pencil, SlidersHorizontal } from "lucide-react";
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

  return (
    <>
      <Dialog
        open={isModalOpen}
        onOpenChange={(isOpen) => setIsModalOpen(isOpen)}
      >
        <DialogContent
          className="flex h-[85vh] w-[80vw] max-w-[80vw] sm:w-[70vw]"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">
            PPT Preview and Settings
          </DialogTitle>
          <div
            className={`hidden h-full gap-4 sm:flex ${
              currentTab === POPUP_TAB_TYPE.GRID_VIEW ? "w-full" : "w-3/5"
            }`}
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
            <div className={"flex h-full w-full flex-col gap-2"}>
              {currentTab === POPUP_TAB_TYPE.SETTINGS && (
                <PptGeneratorSettingsContent
                  onSectionChange={onSectionChange}
                />
              )}
              {currentTab === POPUP_TAB_TYPE.LYRICS && (
                <ScrollArea className={"px-3"} isFillParent>
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
          {currentTab !== POPUP_TAB_TYPE.GRID_VIEW && (
            <div className="flex h-full w-full flex-col sm:w-2/5">
              <h3 className="text-xl font-semibold tracking-tight">Preview</h3>
              <span className="text-xs">
                Note: might not display properly if the font isn&apos;t locally
                installed. Shadow, glow and outline won&apos;t be displayed
                here.
              </span>
              <div className="flex-grow overflow-y-auto">
                {error ? (
                  <div>
                    Working on the preview, meanwhile please check your
                    settings...
                  </div>
                ) : (
                  // NOTE: very important to add scroll area because the default scroll bar will affect the width of the component
                  <ScrollArea className={"px-3"} isFillParent>
                    <VerticalPreview
                      normalizedConfig={previewConfig}
                      drawBoundingBoxes={false}
                    />
                  </ScrollArea>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <div className="hidden sm:block">
                  <GeneratePptWithPromptButton />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Button variant="outline" type="button" onClick={onGeneratePreviewClick}>
        Preview
      </Button>
    </>
  );
};

export default GeneratePreviewButton;
