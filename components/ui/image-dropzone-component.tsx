"use client";
import { IMAGE_FILE_TYPE, SETTING_FIELD_TYPE } from "@/lib/constant";
import { InferTypeScriptTypeFromSettingFieldType } from "@/lib/types";
import { getBase64FromImageField } from "@/lib/utils";
import Image from "next/image";
import React, { HTMLAttributes, useCallback, useEffect, useState } from "react";
import DropzoneComponent from "./dropzone-component";

type ImageDropzoneComponentProps = HTMLAttributes<HTMLInputElement> & {
  onFilesSelected: (file: File) => void;
  description?: string;
  value: InferTypeScriptTypeFromSettingFieldType<
    typeof SETTING_FIELD_TYPE.IMAGE
  >;
};

const ImageDropzoneComponent: React.FC<ImageDropzoneComponentProps> = ({
  className,
  onFilesSelected,
  description = "Drag and drop an image here, or click to select an image.",
  value,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length == 1) {
      const file = files[0];
      onFilesSelected(file);
      return;
    }
  };

  const renderImage = useCallback(async (image: typeof value) => {
    const imageDataUrl = await getBase64FromImageField(image);
    setImagePreview(imageDataUrl);
  }, []);

  useEffect(() => {
    renderImage(value);
  }, [value, renderImage]);

  return (
    <div className={className}>
      {imagePreview && (
        <div className="mb-3 flex w-full items-center justify-center">
          <Image
            src={imagePreview}
            alt="Preview"
            className="max-h-[300px] max-w-full rounded border "
            width="150"
            height="150"
          />
        </div>
      )}
      <DropzoneComponent
        onFilesSelected={handleFilesSelected}
        acceptedFileTypes={IMAGE_FILE_TYPE}
        maxFiles={1}
        description={description}
      />
    </div>
  );
};

export default ImageDropzoneComponent;
