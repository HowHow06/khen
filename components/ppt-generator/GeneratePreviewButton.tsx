"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { generatePreviewConfig } from "@/lib/utils";
import { usePptGeneratorFormContext } from "../context/PptGeneratorFormContext";
import { PptSettingsStateType } from "@/lib/types";
import { InternalPresentation } from "@/lib/react-pptx-preview/normalizer";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
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

    setPreviewConfig(previewConfig);
  };

  return (
    <>
      <Dialog
        open={previewConfig !== undefined}
        onOpenChange={(isOpen) => !isOpen && setPreviewConfig(undefined)}
      >
          <DialogContent>
            <Preview normalizedConfig={previewConfig} drawBoundingBoxes={false} />
          </DialogContent>
      </Dialog>

      <Button variant="default" type="button" onClick={onGeneratePreviewClick}>
        Preview
      </Button>
    </>
  );
};

export default GeneratePreviewButton;
