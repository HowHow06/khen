"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { POPUP_TAB_TYPE } from "@/lib/constant";
import { InternalPresentation } from "@/lib/react-pptx-preview/normalizer";
import { PptSettingsStateType } from "@/lib/types";
import { generatePreviewConfig, getBase64FromString } from "@/lib/utils";
import { Pencil, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLineToSlideMapperContext } from "../context/LineToSlideMapperContext";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";
import Preview from "../react-pptx-preview/Preview";
import { Button } from "../ui/button";
import MainLyricSection from "./MainLyricSection";
import SecondaryLyricSection from "./SecondaryLyricSection";
import GeneratePptWithPromptButton from "./settings/GeneratePptWithPromptButton";
import PptGeneratorSettingsContent from "./settings/PptGeneratorSettingsContent";

type Props = {};

const GeneratePreviewButton = (props: Props) => {
  const { mainText, secondaryText, settingsValues } =
    usePptGeneratorFormContext();
  const { lineMapper, clearMappings } = useLineToSlideMapperContext();
  const [previewConfig, setPreviewConfig] = useState<InternalPresentation>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(
    POPUP_TAB_TYPE.SETTINGS as string,
  );
  const [error, setError] = useState<Error>();

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
        <DialogContent className="flex h-[85vh] w-[80vw] max-w-[80vw] sm:w-[70vw]">
          <div className="hidden h-full w-3/5 gap-4 sm:flex">
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
              </ToggleGroup>
            </div>
            <div className="flex h-full w-full flex-col gap-2">
              {currentTab === POPUP_TAB_TYPE.SETTINGS && (
                <PptGeneratorSettingsContent
                  onSectionChange={onSectionChange}
                />
              )}
              {currentTab === POPUP_TAB_TYPE.LYRICS && (
                <ScrollArea className={"px-3"} isFillParent>
                  <div className="flex flex-col gap-4">
                    <div>
                      <MainLyricSection />
                    </div>
                    <div>
                      <SecondaryLyricSection />
                    </div>
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
          <div className="flex h-full w-full flex-col sm:w-2/5">
            <h3 className="text-xl font-semibold tracking-tight">Preview</h3>
            <span className="text-xs">
              Note: might not display properly if the font isn&apos;t locally
              installed. Shadow, glow and outline won&apos;t be displayed here.
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
                  <Preview
                    normalizedConfig={previewConfig}
                    drawBoundingBoxes={false}
                  />
                </ScrollArea>
              )}
            </div>
            <div className="flex justify-end">
              <div className="hidden sm:block">
                <GeneratePptWithPromptButton />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="outline" type="button" onClick={onGeneratePreviewClick}>
        Preview
      </Button>
    </>
  );
};

export default GeneratePreviewButton;
