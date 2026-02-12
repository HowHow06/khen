"use client";
import { cn } from "@/lib/utils/general";
import React, { HTMLAttributes, useCallback } from "react";
import { Accept, FileRejection, useDropzone } from "react-dropzone";

type DropzoneComponentProps = HTMLAttributes<HTMLInputElement> & {
  onFilesSelected: (files: File[]) => void;
  onFilesRejected?: (fileRejections: FileRejection[]) => void;
  acceptedFileTypes?: Accept;
  maxFiles?: number;
  description?: string;
};

const DropzoneComponent: React.FC<DropzoneComponentProps> = ({
  className,
  onFilesSelected,
  onFilesRejected,
  acceptedFileTypes,
  maxFiles,
  description = "Drag and drop your file here.",
  ...props
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles); // Call the passed callback function
    },
    [onFilesSelected],
  );

  const onDropRejected = useCallback(
    (fileRejections: FileRejection[]) => {
      if (onFilesRejected) {
        onFilesRejected(fileRejections);
      }
    },
    [onFilesRejected],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles,
    accept: acceptedFileTypes,
  });

  return (
    <div
      {...getRootProps()}
      className={cn("rounded-lg border px-2 py-5 text-center", className)}
    >
      <input {...getInputProps()} {...props} />
      <div>{description}</div>
    </div>
  );
};

export default DropzoneComponent;
