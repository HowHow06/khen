"use client";
import { IMAGE_FILE_TYPE } from "@/lib/constant";
import Image from "next/image";
import React, { HTMLAttributes, useState } from "react";
import DropzoneComponent from "./dropzone-component";

type ImageDropzoneComponentProps = HTMLAttributes<HTMLInputElement> & {
  onFilesSelected: (file: File) => void;
  description?: string;
};

const ImageDropzoneComponent: React.FC<ImageDropzoneComponentProps> = ({
  className,
  onFilesSelected,
  description = "Drag and drop an image here, or click to select an image.",
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length == 1) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFilesSelected(file);
      return;
    }
  };

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
