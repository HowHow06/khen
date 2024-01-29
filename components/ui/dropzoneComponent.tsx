"use client";
import { cn } from "@/lib/utils";
import React, { HTMLAttributes, useCallback } from "react";
import { Accept, useDropzone } from "react-dropzone";

type DropzoneComponentProps = HTMLAttributes<HTMLInputElement> & {
  onFilesSelected: (files: File[] | File) => void;
  acceptedFileTypes?: Accept;
  maxFiles?: number;
};

const DropzoneComponent: React.FC<DropzoneComponentProps> = ({
  className,
  onFilesSelected,
  acceptedFileTypes,
  maxFiles,
  ...props
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log("ACCEPTED FILE:", acceptedFiles);
      if (maxFiles == 1 && acceptedFiles.length == 1) {
        onFilesSelected(acceptedFiles[0]); // Call the passed callback function
        return;
      }

      onFilesSelected(acceptedFiles); // Call the passed callback function
    },
    [onFilesSelected, maxFiles],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles,
    accept: acceptedFileTypes,
  });

  return (
    <div
      {...getRootProps()}
      className={cn("rounded-lg border px-2 py-5 text-center", className)}
    >
      <input {...getInputProps()} {...props} />
      <div>Drag and drop your file here.</div>
    </div>
  );
};

export default DropzoneComponent;
