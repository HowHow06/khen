"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { generatePreviewConfig } from "@/lib/utils";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";
import { PptSettingsStateType } from "@/lib/types";
import { InternalPresentation } from "@/lib/react-pptx-preview/normalizer";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Preview from "../react-pptx-preview/Preview";

type Props = {};

const GeneratePreviewButton = (props: Props) => {
  const { mainText, secondaryText, form } = usePptGeneratorFormContext();
  const [previewConfig, setPreviewConfig] = useState<InternalPresentation>();

  const onGeneratePreviewClick = async () => {
    const previewConfig = await generatePreviewConfig({
      settingValues: form.getValues() as PptSettingsStateType,
      primaryLyric: mainText || "",
      secondaryLyric: secondaryText,
    });

    console.log({ previewConfig });
    setPreviewConfig(previewConfig);
  };

  return (
    <>
      {/* TODO: add auto import office fonts */}
      {/* https://github.com/vercel/next.js/discussions/40345#discussioncomment-10145316 */}
      {/* https://stackoverflow.com/questions/36178001/how-to-lazy-load-web-font-declared-by-font-face */}
      {/* <style>
        {`@import url(https://fonts.cdnfonts.com/css/microsoft-yahei);`}
      </style> */}
      <Dialog
        open={previewConfig !== undefined}
        onOpenChange={(isOpen) => !isOpen && setPreviewConfig(undefined)}
      >
        <DialogContent className="flex min-w-[70vw]">
          <div className="w-2/3">
            <h3 className="text-xl font-semibold tracking-tight">Settings</h3>
            
          </div>
          <div className="w-1/3">
            <h3 className="text-xl font-semibold tracking-tight">Preview</h3>
            <div className="max-h-[80vh] overflow-y-auto">
              <Preview
                normalizedConfig={previewConfig}
                drawBoundingBoxes={false}
              />
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
