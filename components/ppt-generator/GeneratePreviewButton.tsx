"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { InternalPresentation } from "@/lib/react-pptx-preview/normalizer";
import { generatePreviewConfig } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";
import Preview from "../react-pptx-preview/Preview";
import { Button } from "../ui/button";
import GeneratePptWithPromptButton from "./settings/GeneratePptWithPromptButton";
import PptGeneratorSettingsContent from "./settings/PptGeneratorSettingsContent";

type Props = {};

const GeneratePreviewButton = (props: Props) => {
  const { mainText, secondaryText, settingsValues } =
    usePptGeneratorFormContext();
  const [previewConfig, setPreviewConfig] = useState<InternalPresentation>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onGeneratePreviewClick = () => {
    setIsModalOpen(true);
  };

  // TODO: add settings validation check here, OR show message like 'invalid content' instead of preview
  const updatePreviewConfig = useCallback(async () => {
    if (!isModalOpen) {
      return;
    }
    const previewConfig = await generatePreviewConfig({
      settingValues: settingsValues,
      primaryLyric: mainText || "",
      secondaryLyric: secondaryText,
    });
    setPreviewConfig(previewConfig);
  }, [settingsValues, mainText, secondaryText, isModalOpen]);

  // update preview config on settingsValues change
  useEffect(() => {
    updatePreviewConfig();
  }, [updatePreviewConfig]);

  return (
    <>
      {/* TODO: add auto import office fonts */}
      {/* https://github.com/vercel/next.js/discussions/40345#discussioncomment-10145316 */}
      {/* https://stackoverflow.com/questions/36178001/how-to-lazy-load-web-font-declared-by-font-face */}
      {/* <style>
        {`@import url(https://fonts.cdnfonts.com/css/microsoft-yahei);`}
      </style> */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(isOpen) => setIsModalOpen(isOpen)}
      >
        <DialogContent className="flex h-[85vh] w-[80vw] max-w-[80vw] sm:w-[70vw]">
          <div className="hidden h-full w-3/5 flex-col gap-2 sm:flex">
            <PptGeneratorSettingsContent />
          </div>
          <div className="flex h-full w-full flex-col sm:w-2/5">
            <h3 className="text-xl font-semibold tracking-tight">Preview</h3>
            <span className="text-xs">
              Note: might not display properly if the font isn&apos;t locally
              installed. Shadow, glow and outline won&apos;t be displayed here.
            </span>
            <div className="flex-grow overflow-y-auto">
              <Preview
                normalizedConfig={previewConfig}
                drawBoundingBoxes={false}
              />
            </div>
            <div className="flex justify-end">
              <GeneratePptWithPromptButton />
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
